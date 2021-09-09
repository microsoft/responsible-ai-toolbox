# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd

from responsibleai._tools.causal.causal_result import CausalResult

from responsibleai import ModelTask
from responsibleai._managers.causal_manager import CausalManager
from responsibleai._tools.causal.causal_constants import Versions


class TestCausalVersioning:
    def test_current_roundtrip(self, parks_data, tmpdir):
        train_df, test_df, target_feature = parks_data
        save_dir = tmpdir.mkdir('result-dir')

        manager = CausalManager(train_df, test_df, target_feature,
                                ModelTask.REGRESSION, ['state', 'attraction'])

        result = manager.add(['attraction'],
                             skip_cat_limit_checks=True,
                             upper_bound_on_cat_expansion=50)

        print(result._get_dashboard_data())

        result.save(save_dir)
        loaded = CausalResult.load(save_dir)
        assert loaded.id == result.id
        assert loaded.version == result.version
        assert loaded.version == Versions.CURRENT
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

    def test_backcompat_load(self):
        pass
