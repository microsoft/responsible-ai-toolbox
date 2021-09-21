# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import pandas as pd
import pytest

from jsonschema import ValidationError
from pathlib import Path
from typing import Any

from responsibleai import ModelTask
from responsibleai._managers.causal_manager import CausalManager
from responsibleai._tools.causal import causal_result as causal_result_module
# from responsibleai._tools.causal.causal_result import CausalResult
from responsibleai._tools.shared import versions


@pytest.fixture(scope='module')
def causal_result(parks_data):
    train_df, test_df, target_feature = parks_data
    manager = CausalManager(train_df, test_df, target_feature,
                            ModelTask.REGRESSION, ['state', 'attraction'])

    return manager.add(['attraction'],
                       skip_cat_limit_checks=True,
                       upper_bound_on_cat_expansion=50)


class TestCausalVersioning:
    def test_current_roundtrip(self, tmpdir, causal_result):
        save_dir = self._save_result(causal_result, tmpdir)
        loaded = causal_result_module.CausalResult.load(save_dir)
        result = causal_result
        assert loaded.id == result.id
        assert loaded.version == result.version
        assert loaded.version == versions.CausalVersions.get_current()
        assert loaded._get_dashboard_data() == result._get_dashboard_data()
        assert loaded.global_effects.equals(result.global_effects)
        assert loaded.local_effects.equals(result.local_effects)
        self._check_recursive_df_equality(loaded.policies, result.policies)

    def _check_recursive_df_equality(self, o_1, o_2):
        assert type(o_1) == type(o_2)

        if isinstance(o_1, list):
            assert len(o_1) == len(o_2)
            for item_1, item_2 in zip(o_1, o_2):
                self._check_recursive_df_equality(item_1, item_2)
        elif isinstance(o_1, dict):
            assert o_1.keys() == o_2.keys()
            for key, item_1 in o_1.items():
                item_2 = o_2[key]
                self._check_recursive_df_equality(item_1, item_2)
        elif isinstance(o_1, pd.DataFrame):
            assert o_1.equals(o_2)
        else:
            assert o_1 == o_2

    def test_invalid_version_load(self, tmpdir, causal_result):
        save_dir = self._save_result(causal_result, tmpdir, version='invalid')

        message = r"invalid is not valid SemVer string"
        with pytest.raises(ValueError, match=message):
            causal_result_module.CausalResult.load(save_dir)

    def test_invalid_dashboard_load(self, tmpdir, causal_result):
        save_dir = self._save_result(causal_result, tmpdir, dashboard='inv')

        message = r"Failed validating"
        with pytest.raises(ValidationError, match=message):
            causal_result_module.CausalResult.load(save_dir)

    def test_forward_incompatible(self, tmpdir, causal_result):
        """Test that the current client won't load results with versions
        later than the current version."""

        save_dir = self._save_result(causal_result, tmpdir, version='1000.0.0')

        message = ("The installed version of responsibleai is not "
                   "compatible with causal result version 1000.0.0. "
                   "Please upgrade responsibleai "
                   "in order to load this result.")
        with pytest.raises(ValueError, match=message):
            causal_result_module.CausalResult.load(save_dir)

    def test_backward_incompatible(self, monkeypatch, tmpdir, causal_result):
        """Test that the current client won't load results with versions
        earlier than the current major version."""

        save_dir = self._save_result(causal_result, tmpdir, version='0.1.0')

        class PatchCausalVersions(versions.BaseVersions):

            V_0_0_0 = '0.0.0'
            V_0_1_0 = '0.1.0'
            V_1000_0_0 = '1000.0.0'

        monkeypatch.setattr(causal_result_module,
                            'CausalVersions',
                            PatchCausalVersions)

        message = ("The installed version of responsibleai is not "
                   "compatible with causal result version 0.1.0. "
                   "Please downgrade responsibleai "
                   "in order to load this result.")
        with pytest.raises(ValueError, match=message):
            causal_result_module.CausalResult.load(save_dir)

    def _save_result(
        self,
        causal_result: causal_result_module.CausalResult,
        tmpdir: Path,
        version: str = None,
        dashboard: Any = None,
    ) -> Path:
        save_dir = tmpdir.mkdir('result-dir')
        causal_result.save(save_dir)

        if version is not None:
            with open(save_dir / 'version.json', 'w') as f:
                json.dump({'version': version}, f)

        if dashboard is not None:
            with open(save_dir / 'dashboard.json', 'w') as f:
                json.dump({'fake_dashboard': dashboard}, f)

        return save_dir
