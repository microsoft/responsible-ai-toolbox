
# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from ..common_utils import (
    create_iris_data, create_lightgbm_classifier
)

from responsibleai import ModelAnalysis


class TestCounterfactualAdvancedFeatures(object):

    @pytest.mark.parametrize('vary_all_features', [True, False])
    @pytest.mark.parametrize('feature_importance', [True, False])
    def test_counterfactual_vary_features(
            self, vary_all_features, feature_importance):
        if feature_importance and not vary_all_features:
            pytest.skip('Skipping test due to exception in dice-ml library')

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

        # TODO: The logic below needs to be made robust for gated tests
        # cf_obj = model_analysis.counterfactual.get()[0]
        # for feature_name in feature_names:
        #     if not vary_all_features and feature_name != feature_names[0]:
        #         assert np.all(
        #             cf_obj.cf_examples_list[0].final_cfs_df[feature_name] ==
        #             X_test.iloc[0:1][feature_name][0])
        #     else:
        #         assert np.any(
        #             cf_obj.cf_examples_list[0].final_cfs_df[feature_name] !=
        #             X_test.iloc[0:1][feature_name][0])

    @pytest.mark.parametrize('feature_importance', [True, False])
    def test_counterfactual_permitted_range(self, feature_importance):
        if feature_importance:
            pytest.skip('Skipping test due to exception in dice-ml library')
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

        # TODO: The logic below needs to be made robust for gated tests
        # cf_obj = model_analysis.counterfactual.get()[0]
        # for feature_name in feature_names:
        #     if feature_name != feature_names[0]:
        #         assert np.all(
        #             cf_obj.cf_examples_list[0].final_cfs_df[feature_name] ==
        #             X_test.iloc[0:1][feature_name][0])
        #     else:
        #         assert np.any(
        #             cf_obj.cf_examples_list[0].final_cfs_df[feature_name] !=
        #             X_test.iloc[0:1][feature_name][0])
        #         assert np.any(
        #             cf_obj.cf_examples_list[0].final_cfs_df[feature_name] >=
        #             2.0)
        #         assert np.any(
        #             cf_obj.cf_examples_list[0].final_cfs_df[feature_name] <=
        #             5.0)
