# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import copy
import numpy as np
import pytest
import pandas as pd

from unittest.mock import patch, ANY

from ..common_utils import create_boston_data, create_adult_income_dataset

from responsibleai import ModelAnalysis, ModelTask
from responsibleai.exceptions import UserConfigValidationException
from responsibleai._managers.causal_manager import CausalManager


@pytest.fixture(scope='module')
def boston_data():
    target_feature = 'TARGET'
    X_train, X_test, y_train, y_test, feature_names = create_boston_data()
    train_df = pd.DataFrame(X_train, columns=feature_names)
    train_df[target_feature] = y_train
    test_df = pd.DataFrame(X_test, columns=feature_names)
    test_df[target_feature] = y_test
    return train_df, test_df, feature_names, target_feature


@pytest.fixture(scope='module')
def adult_data():
    X_train_df, X_test_df, y_train, y_test,\
        _, _, target_name, _ = create_adult_income_dataset()
    train_df = copy.deepcopy(X_train_df)
    test_df = copy.deepcopy(X_test_df)
    train_df[target_name] = y_train
    test_df[target_name] = y_test
    return train_df, test_df, X_train_df.columns, target_name


class TestCausalManager:
    def test_causal_no_categoricals(self, boston_data):
        train_df, test_df, feature_names, target_feature = boston_data

        manager = CausalManager(train_df, test_df, target_feature,
                                ModelTask.REGRESSION, None)

        result = manager.add(['ZN'])

        assert len(result.policies) == 1
        assert len(result.config.treatment_features) == 1
        assert result.config.treatment_features[0] == 'ZN'

    def test_causal_save_and_load(self, boston_data, tmpdir):
        train_df, test_df, feature_names, target_feature = boston_data

        save_dir = tmpdir.mkdir('save-dir')

        analysis = ModelAnalysis(
            None, train_df, test_df, target_feature, ModelTask.REGRESSION)

        analysis.causal.add(['ZN'])
        pre_results = analysis.causal.get()
        pre_result = pre_results[0]

        analysis.causal._save(save_dir)
        manager = analysis.causal._load(save_dir, analysis)
        post_results = manager.get()
        post_result = post_results[0]
        assert post_result.id == pre_result.id
        assert post_result.causal_analysis is not None
        assert post_result.global_effects is not None
        assert post_result.local_effects is not None
        assert post_result.policies is not None

    def test_causal_cat_expansion(self, boston_data):
        train_df, test_df, feature_names, target_feature = boston_data

        manager = CausalManager(train_df, test_df, target_feature,
                                ModelTask.REGRESSION, ['ZN'])

        expected = "Increase the value 50"
        with pytest.raises(ValueError, match=expected):
            manager.add(['ZN'])

    def test_causal_train_test_categories(self):
        feature_names = ['state', 'population', 'attraction', 'area']
        train_df = pd.DataFrame([
            ['massachusetts', 3129, 'trees', 11],
            ['utah', 41891, 'rocks', 51],
            ['california', 193912, 'trees', 62],
            ['california', 123901, 'trees', 25],
            ['utah', 39012, 'rocks', 34],
            ['colorado', 30102, 'rocks', 40],
            ['massachusetts', 4222, 'trees', 15],
            ['colorado', 20342, 'rocks', 42],
            ['arizona', 3201, 'rocks', 90],
            ['massachusetts', 3129, 'trees', 11],
            ['utah', 41891, 'rocks', 51],
            ['california', 193912, 'trees', 62],
            ['california', 123901, 'trees', 25],
            ['utah', 39012, 'rocks', 34],
            ['colorado', 30102, 'rocks', 40],
            ['massachusetts', 4222, 'trees', 15],
            ['colorado', 20342, 'rocks', 42],
            ['arizona', 3201, 'rocks', 90],
        ], columns=feature_names)

        test_df = pd.DataFrame([
            ['california', 203912, 'trees', 102],
            ['utah', 5102, 'rocks', 21],
            ['colorado', 8120, 'rocks', 31],
            ['indiana', 301, 'trees', 78],
            ['california', 203912, 'trees', 102],
            ['utah', 5102, 'rocks', 21],
            ['colorado', 8120, 'rocks', 31],
            ['indiana', 301, 'trees', 78],
        ], columns=feature_names)

        print(train_df)
        print(test_df)

        target_feature = 'area'
        manager = CausalManager(train_df, test_df, target_feature,
                                ModelTask.REGRESSION, ['state', 'attraction'])

        manager.add(['population'],
                    skip_cat_limit_checks=True,
                    upper_bound_on_cat_expansion=50)


@pytest.fixture(scope='class')
def cost_manager(boston_data):
    train_df, test_df, feature_names, target_feature = boston_data

    test_df = test_df[:7]
    return CausalManager(train_df, test_df, target_feature,
                         ModelTask.REGRESSION, ['CHAS'])


class TestCausalManagerTreatmentCosts:
    def test_zero_cost(self, cost_manager):
        with patch.object(cost_manager, '_create_policy', return_value=None)\
                as mock_create:
            cost_manager.add(['ZN', 'RM', 'B'], treatment_cost=0)
            mock_create.assert_any_call(ANY, ANY, 'ZN', 0, ANY, ANY, ANY)
            mock_create.assert_any_call(ANY, ANY, 'RM', 0, ANY, ANY, ANY)
            mock_create.assert_any_call(ANY, ANY, 'B', 0, ANY, ANY, ANY)

    def test_nonzero_scalar_cost(self, cost_manager):
        message = ("treatment_cost must be a list with the same number "
                   "of elements as treatment_features where each "
                   "element is either a constant cost of treatment "
                   "or an array specifying the cost of treatment per "
                   "sample. Found treatment_cost "
                   "of type <class 'int'>, expected list.")
        with pytest.raises(UserConfigValidationException, match=message):
            cost_manager.add(['ZN', 'RM', 'B'], treatment_cost=5)

    def test_nonlist_cost(self, cost_manager):
        message = ("treatment_cost must be a list with the same number of "
                   "elements as treatment_features where each element is "
                   "either a constant cost of treatment or an array "
                   "specifying the cost of treatment per sample. "
                   "Found treatment_cost of type <class 'numpy.ndarray'>, "
                   "expected list.")
        with pytest.raises(UserConfigValidationException, match=message):
            cost_manager.add(['ZN', 'RM', 'B'],
                             treatment_cost=np.array([1, 2]))

    def test_invalid_cost_list_length(self, cost_manager):
        expected = ("treatment_cost must be a list with the same number of "
                    "elements as treatment_features. "
                    "Length of treatment_cost was 2, expected 3.")
        with pytest.raises(UserConfigValidationException, match=expected):
            cost_manager.add(['ZN', 'RM', 'B'], treatment_cost=[1, 2])

    def test_constant_cost_per_treatment_feature(self, cost_manager):
        with patch.object(cost_manager, '_create_policy', return_value=None)\
                as mock_create:
            cost_manager.add(['ZN', 'RM', 'B'], treatment_cost=[1, 2, 3])
            mock_create.assert_any_call(ANY, ANY, 'ZN', 1, ANY, ANY, ANY)
            mock_create.assert_any_call(ANY, ANY, 'RM', 2, ANY, ANY, ANY)
            mock_create.assert_any_call(ANY, ANY, 'B', 3, ANY, ANY, ANY)

    def test_per_sample_costs(self, cost_manager):
        with patch.object(cost_manager, '_create_policy', return_value=None)\
                as mock_create:
            costs = [
                [1, 2, 3, 4, 5, 6, 7],
                [2, 3, 4, 5, 6, 7, 1],
            ]
            cost_manager.add(['ZN', 'RM'], treatment_cost=costs)
            mock_create.assert_any_call(
                ANY, ANY, 'ZN', [1, 2, 3, 4, 5, 6, 7], ANY, ANY, ANY)
            mock_create.assert_any_call(
                ANY, ANY, 'RM', [2, 3, 4, 5, 6, 7, 1], ANY, ANY, ANY)

    def test_invalid_per_sample_length(self, cost_manager):
        costs = [
            np.array([1, 2, 3, 4, 5]),
            np.array([2, 3, 4, 5, 1]),
        ]
        with pytest.raises(Exception):
            cost_manager.add(['ZN', 'B'], treatment_cost=costs,
                             skip_cat_limit_checks=True)
