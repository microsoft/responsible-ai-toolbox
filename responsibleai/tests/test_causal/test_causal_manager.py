# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import pytest

import pandas as pd

from ..common_utils import create_boston_data

from responsibleai import ModelAnalysis, ModelTask


@pytest.fixture(scope='module')
def boston_data():
    target_feature = 'TARGET'
    X_train, X_test, y_train, y_test, feature_names = create_boston_data()
    train_df = pd.DataFrame(X_train, columns=feature_names)
    train_df[target_feature] = y_train
    test_df = pd.DataFrame(X_test, columns=feature_names)
    test_df[target_feature] = y_test
    return train_df, test_df, feature_names, target_feature


class TestCausalManager:
    def test_causal_no_categoricals(self, boston_data):
        train_df, test_df, feature_names, target_feature = boston_data

        categoricals = None
        task = ModelTask.REGRESSION
        analysis = ModelAnalysis(
            None, train_df, test_df, target_feature, task,
            categorical_features=categoricals)

        treatment_features = ['ZN']
        analysis.causal.add(treatment_features=treatment_features)
        results = analysis.causal.get()

        assert len(results) == 1
        assert len(results[0].policies) == 1
        assert len(results[0].config.treatment_features) == 1
        assert results[0].config.treatment_features[0] == 'ZN'

    def test_causal_save_and_load(self, boston_data, tmpdir):
        train_df, test_df, feature_names, target_feature = boston_data

        save_dir = tmpdir.mkdir('save-dir')

        model = None
        task = ModelTask.REGRESSION
        analysis = ModelAnalysis(
            model, train_df, test_df, target_feature, task)

        treatment_features = ['ZN']
        analysis.causal.add(treatment_features=treatment_features)
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

        model = None
        task = ModelTask.REGRESSION
        analysis = ModelAnalysis(
            model, train_df, test_df, target_feature, task,
            categorical_features=['ZN'])

        treatment_features = ['ZN']

        expected = "Increase the value 50"
        with pytest.raises(ValueError, match=expected):
            analysis.causal.add(treatment_features=treatment_features)
