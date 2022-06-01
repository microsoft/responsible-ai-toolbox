
# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os

import pytest

from responsibleai import RAIInsights
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager

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

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test.iloc[0:10],
            target_column='target',
            task_type='classification')

        if vary_all_features:
            features_to_vary = 'all'
        else:
            features_to_vary = [feature_names[0]]

        rai_insights.counterfactual.add(
            total_CFs=10, desired_class=2,
            features_to_vary=features_to_vary,
            feature_importance=feature_importance)
        rai_insights.counterfactual.compute()

        cf_obj = rai_insights.counterfactual.get()[0]
        assert cf_obj is not None

    @pytest.mark.parametrize('feature_importance', [True, False])
    def test_counterfactual_permitted_range(self, feature_importance):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test.iloc[0:10],
            target_column='target',
            task_type='classification')

        rai_insights.counterfactual.add(
            total_CFs=10, desired_class=2,
            features_to_vary=[feature_names[0]],
            permitted_range={feature_names[0]: [2.0, 5.0]},
            feature_importance=feature_importance)
        rai_insights.counterfactual.compute()

        cf_obj = rai_insights.counterfactual.get()[0]
        assert cf_obj is not None

    def test_counterfactual_manager_save_load(self, tmpdir):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test.iloc[0:10],
            target_column='target',
            task_type='classification')

        rai_insights.counterfactual.add(
            total_CFs=10, desired_class=2,
            features_to_vary=[feature_names[0]],
            permitted_range={feature_names[0]: [2.0, 5.0]})
        rai_insights.counterfactual.add(
            total_CFs=10, desired_class=1,
            features_to_vary=[feature_names[0]],
            permitted_range={feature_names[0]: [2.0, 5.0]})
        rai_insights.counterfactual.compute()

        assert len(rai_insights.counterfactual.get()) == 2
        cf_obj = rai_insights.counterfactual.get()[0]
        assert cf_obj is not None

        save_dir = tmpdir.mkdir('save-dir')
        rai_insights.save(save_dir)
        rai_insights_copy = RAIInsights.load(save_dir)

        assert len(rai_insights_copy.counterfactual.get()) == 2
        cf_obj = rai_insights_copy.counterfactual.get()[0]
        assert cf_obj is not None

        # Delete the dice-ml explainer directory so that the dice-ml
        # explainer can be re-trained rather being loaded from the
        # disc
        counterfactual_path = save_dir / "counterfactual"
        all_cf_dirs = DirectoryManager.list_sub_directories(
            counterfactual_path)
        for counterfactual_config_dir in all_cf_dirs:
            directory_manager = DirectoryManager(
                parent_directory_path=counterfactual_path,
                sub_directory_name=counterfactual_config_dir)
            explainer_pkl_path = \
                directory_manager.get_generators_directory() / "explainer.pkl"
            os.remove(explainer_pkl_path)

        with pytest.warns(UserWarning,
                          match='ERROR-LOADING-COUNTERFACTUAL-EXPLAINER: '
                                'There was an error loading the '
                                'counterfactual explainer model. '
                                'Retraining the counterfactual '
                                'explainer.'):
            rai_insights_copy_new = RAIInsights.load(save_dir)
        counterfactual_config_list = \
            rai_insights_copy_new.counterfactual._counterfactual_config_list
        assert len(counterfactual_config_list) == 2
        assert counterfactual_config_list[0].explainer is not None
        assert counterfactual_config_list[1].explainer is not None
