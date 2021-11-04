
# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from responsibleai import ModelAnalysis

from ..common_utils import create_iris_data, create_lightgbm_classifier


class TestCounterfactualAdvancedFeatures(object):

    @pytest.mark.parametrize('vary_all_features', [True, False])
    @pytest.mark.parametrize('feature_importance', [True, False])
    def test_counterfactual_vary_features(
            self, vary_all_features, feature_importance):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        model_analysis = ModelAnalysis(
            model=model,
            train=X_train,
            test=X_test.iloc[0:10],
            target_column='target',
            task_type='classification')

        if vary_all_features:
            features_to_vary = 'all'
        else:
            features_to_vary = [feature_names[0]]

        model_analysis.counterfactual.add(
            total_CFs=10, desired_class=2,
            features_to_vary=features_to_vary,
            feature_importance=feature_importance)
        model_analysis.counterfactual.compute()

        cf_obj = model_analysis.counterfactual.get()[0]
        assert cf_obj is not None

    @pytest.mark.parametrize('feature_importance', [True, False])
    def test_counterfactual_permitted_range(self, feature_importance):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        model_analysis = ModelAnalysis(
            model=model,
            train=X_train,
            test=X_test.iloc[0:10],
            target_column='target',
            task_type='classification')

        model_analysis.counterfactual.add(
            total_CFs=10, desired_class=2,
            features_to_vary=[feature_names[0]],
            permitted_range={feature_names[0]: [2.0, 5.0]},
            feature_importance=feature_importance)
        model_analysis.counterfactual.compute()

        cf_obj = model_analysis.counterfactual.get()[0]
        assert cf_obj is not None

    def test_counterfactual_manager_save_load(self, tmpdir):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        model_analysis = ModelAnalysis(
            model=model,
            train=X_train,
            test=X_test.iloc[0:10],
            target_column='target',
            task_type='classification')

        model_analysis.counterfactual.add(
            total_CFs=10, desired_class=2,
            features_to_vary=[feature_names[0]],
            permitted_range={feature_names[0]: [2.0, 5.0]})
        model_analysis.counterfactual.add(
            total_CFs=10, desired_class=1,
            features_to_vary=[feature_names[0]],
            permitted_range={feature_names[0]: [2.0, 5.0]})
        model_analysis.counterfactual.compute()

        assert len(model_analysis.counterfactual.get()) == 2
        cf_obj = model_analysis.counterfactual.get()[0]
        assert cf_obj is not None

        save_dir = tmpdir.mkdir('save-dir')
        model_analysis.save(save_dir)
        model_analysis_copy = ModelAnalysis.load(save_dir)

        assert len(model_analysis_copy.counterfactual.get()) == 2
        cf_obj = model_analysis_copy.counterfactual.get()[0]
        assert cf_obj is not None
