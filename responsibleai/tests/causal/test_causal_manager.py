# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
from unittest.mock import ANY, patch

import numpy as np
import pytest

from responsibleai import ModelTask, RAIInsights
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.managers.causal_manager import CausalManager


class TestCausalManager:
    def test_causal_no_categoricals(self, housing_data):
        train_df, test_df, target_feature = housing_data

        manager = CausalManager(train_df, test_df, target_feature,
                                ModelTask.REGRESSION, None)
        manager.add(['AveRooms'])
        manager.compute()
        result = manager.get()[0]

        assert len(result.policies) == 1
        assert len(result.config.treatment_features) == 1
        assert result.config.treatment_features[0] == 'AveRooms'

    def test_causal_save_and_load(self, housing_data, tmpdir):
        train_df, test_df, target_feature = housing_data

        save_dir = tmpdir.mkdir('save-dir')

        insights = RAIInsights(
            None, train_df, test_df, target_feature, ModelTask.REGRESSION)

        insights.causal.add(['AveRooms'])
        insights.compute()

        pre_results = insights.causal.get()
        pre_result = pre_results[0]

        insights.causal._save(save_dir)
        manager = insights.causal._load(save_dir, insights)
        post_results = manager.get()
        post_result = post_results[0]
        assert post_result.id == pre_result.id
        assert post_result.causal_analysis is not None
        assert post_result.global_effects is not None
        assert post_result.local_effects is not None
        assert post_result.policies is not None

    def test_causal_cat_expansion(self, parks_data):
        train_df, test_df, target_feature = parks_data

        manager = CausalManager(train_df, test_df, target_feature,
                                ModelTask.REGRESSION, ['state', 'attraction'])

        expected = "Increase the value 50"
        with pytest.raises(ValueError, match=expected):
            manager.add(['state'])
            manager.compute()

    def test_causal_train_test_categories(self, parks_data):
        train_df, test_df, target_feature = parks_data

        test_df = test_df.copy()
        test_df.loc[len(test_df.index)] = ['indiana', 301, 'trees', 78]
        test_df.loc[len(test_df.index)] = ['indiana', 222, 'trees', 81]

        manager = CausalManager(train_df, test_df, target_feature,
                                ModelTask.REGRESSION, ['state', 'attraction'])

        message = ("Causal analysis requires that every category of "
                   "categorical features present in the test data be "
                   "also present in the train data. "
                   "Categories missing from train data: "
                   "{'state': \\['indiana'\\]}")
        with pytest.raises(UserConfigValidationException, match=message):
            manager.add(['state'],
                        skip_cat_limit_checks=True,
                        upper_bound_on_cat_expansion=50)


@pytest.fixture(scope='class')
def cost_manager(housing_data):
    train_df, test_df, target_feature = housing_data

    test_df = test_df[:7]
    return CausalManager(train_df, test_df, target_feature,
                         ModelTask.REGRESSION, None)


class TestCausalManagerTreatmentCosts:
    def test_zero_cost(self, cost_manager):
        with patch.object(cost_manager, '_create_policy', return_value=None)\
                as mock_create:
            try:
                cost_manager.add(['AveRooms', 'Population', 'AveOccup'],
                                 treatment_cost=0)
                cost_manager.compute()

            except TypeError:
                pass
            mock_create.assert_any_call(ANY, ANY, 'AveRooms', 0, ANY, ANY, ANY)
            mock_create.assert_any_call(ANY, ANY, 'Population', 0,
                                        ANY, ANY, ANY)
            mock_create.assert_any_call(ANY, ANY, 'AveOccup', 0, ANY, ANY, ANY)

    def test_nonzero_scalar_cost(self, cost_manager):
        message = ("treatment_cost must be a list with the same number "
                   "of elements as treatment_features where each "
                   "element is either a constant cost of treatment "
                   "or an array specifying the cost of treatment per "
                   "sample. Found treatment_cost "
                   "of type <class 'int'>, expected list.")
        with pytest.raises(UserConfigValidationException, match=message):
            cost_manager.add(['AveRooms', 'Population', 'AveOccup'],
                             treatment_cost=5)
            cost_manager.compute()

    def test_nonlist_cost(self, cost_manager):
        message = ("treatment_cost must be a list with the same number of "
                   "elements as treatment_features where each element is "
                   "either a constant cost of treatment or an array "
                   "specifying the cost of treatment per sample. "
                   "Found treatment_cost of type <class 'numpy.ndarray'>, "
                   "expected list.")
        with pytest.raises(UserConfigValidationException, match=message):
            cost_manager.add(['AveRooms', 'Population', 'AveOccup'],
                             treatment_cost=np.array([1, 2]))
            cost_manager.compute()

    def test_invalid_cost_list_length(self, cost_manager):
        expected = ("treatment_cost must be a list with the same number of "
                    "elements as treatment_features. "
                    "Length of treatment_cost was 2, expected 3.")
        with pytest.raises(UserConfigValidationException, match=expected):
            cost_manager.add(['AveRooms', 'Population', 'AveOccup'],
                             treatment_cost=[1, 2])
            cost_manager.compute()

    def test_constant_cost_per_treatment_feature(self, cost_manager):
        with patch.object(cost_manager, '_create_policy', return_value=None)\
                as mock_create:
            try:
                cost_manager.add(['AveRooms', 'Population', 'AveOccup'],
                                 treatment_cost=[1, 2, 3])
                cost_manager.compute()
            except TypeError:
                pass
            mock_create.assert_any_call(ANY, ANY, 'AveRooms', 1, ANY, ANY, ANY)
            mock_create.assert_any_call(ANY, ANY, 'Population', 2,
                                        ANY, ANY, ANY)
            mock_create.assert_any_call(ANY, ANY, 'AveOccup', 3, ANY, ANY, ANY)

    def test_per_sample_costs(self, cost_manager):
        with patch.object(cost_manager, '_create_policy', return_value=None)\
                as mock_create:
            costs = [
                [1, 2, 3, 4, 5, 6, 7],
                [2, 3, 4, 5, 6, 7, 1],
            ]
            try:
                cost_manager.add(['AveRooms', 'Population'],
                                 treatment_cost=costs)
                cost_manager.compute()
            except TypeError:
                pass
            mock_create.assert_any_call(
                ANY, ANY, 'AveRooms', [1, 2, 3, 4, 5, 6, 7], ANY, ANY, ANY)
            mock_create.assert_any_call(
                ANY, ANY, 'Population', [2, 3, 4, 5, 6, 7, 1], ANY, ANY, ANY)

    def test_invalid_per_sample_length(self, cost_manager):
        costs = [
            np.array([1, 2, 3, 4, 5]),
            np.array([2, 3, 4, 5, 1]),
        ]
        with pytest.raises(Exception):
            cost_manager.add(['AveRooms', 'Population'], treatment_cost=costs,
                             skip_cat_limit_checks=True)
            cost_manager.compute()


class TestCausalDashboardData:
    def test_categorical_policy(self, housing_data_categorical):
        train_df, test_df, target_feature = housing_data_categorical
        categoricals = train_df.select_dtypes(include=[object]).columns

        # Just use categoricals to force categorical policy tree
        new_features = list(categoricals) + [target_feature]
        train_df = train_df[new_features]
        test_df = test_df[new_features]

        # Sample data for easier debug
        test_df = test_df[:20]

        manager = CausalManager(train_df, test_df, target_feature,
                                ModelTask.REGRESSION, categoricals)

        result = manager.add(['HouseAge_CAT', 'Population_CAT'],
                             random_state=42)
        manager.compute()
        result = manager.get()[0]
        dashboard_data = result._get_dashboard_data()

        policies = dashboard_data['policies']
        assert len(policies) > 0
        for policy in policies:
            tree = policy['policy_tree']
            assert not tree['leaf']
            assert tree['feature'] in categoricals
            assert tree['right_comparison'] == 'eq'
            is_very_old_comparison = tree['comparison_value'] == 'very-old'
            is_high_comparison = tree['comparison_value'] == 'high'
            assert is_very_old_comparison or is_high_comparison
