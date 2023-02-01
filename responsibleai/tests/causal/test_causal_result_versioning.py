# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

import pandas as pd
import pytest
from jsonschema import ValidationError

from responsibleai import ModelTask
from responsibleai._tools.causal.causal_result import CausalResult
from responsibleai._tools.shared.versions import CausalVersions
from responsibleai.managers.causal_manager import CausalManager


@pytest.fixture(scope='module')
def causal_result(parks_data):
    train_df, test_df, target_feature = parks_data
    manager = CausalManager(train_df, test_df, target_feature,
                            ModelTask.REGRESSION, ['state', 'attraction'])

    manager.add(['attraction'],
                skip_cat_limit_checks=True,
                upper_bound_on_cat_expansion=50)
    manager.compute()
    return manager.get()[0]


class TestCausalVersioning:
    def test_current_roundtrip(self, tmpdir, causal_result):
        save_dir = tmpdir.mkdir('result-dir')
        result = causal_result
        result.save(save_dir)
        loaded = CausalResult.load(save_dir)
        assert loaded.id == result.id
        assert loaded.version == result.version
        assert loaded.version == CausalVersions.get_current()
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
        save_dir = tmpdir.mkdir('result-dir')
        causal_result.save(save_dir)

        version_filepath = save_dir / 'version.json'
        with open(version_filepath, 'w') as f:
            new_version_data = {'version': 'invalid_version'}
            json.dump(new_version_data, f)

        message = r"invalid_version is not valid SemVer string"
        with pytest.raises(ValueError, match=message):
            CausalResult.load(save_dir)

    def test_invalid_dashboard_load(self, tmpdir, causal_result):
        save_dir = tmpdir.mkdir('result-dir')
        causal_result.save(save_dir)

        dashboard_filepath = save_dir / 'dashboard.json'
        with open(dashboard_filepath, 'w') as f:
            new_dashboard_data = {'fake_dashboard': 'invalid'}
            json.dump(new_dashboard_data, f)

        message = r"Failed validating"
        with pytest.raises(ValidationError, match=message):
            CausalResult.load(save_dir)

    def test_forward_incompatible(self, tmpdir, causal_result):
        save_dir = tmpdir.mkdir('result-dir')
        causal_result.save(save_dir)

        version_filepath = save_dir / 'version.json'
        with open(version_filepath, 'w') as f:
            new_version_data = {'version': '1000.0.0'}
            json.dump(new_version_data, f)

        message = ("The installed version of responsibleai is not "
                   "compatible with causal result version 1000.0.0. "
                   "Please upgrade in order to load this result.")
        with pytest.raises(ValueError, match=message):
            CausalResult.load(save_dir)
