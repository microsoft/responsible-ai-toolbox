# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from ..common_utils import create_iris_data, create_lightgbm_classifier

from responsibleai.rai_insights import RAIInsights
from responsibleai.exceptions import UserConfigValidationException


class TestExplainerManager:
    def test_explainer_manager_request_global_explanations(self):
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
        rai_insights.explainer.add()
        rai_insights.compute()

        global_explanations = \
            rai_insights.explainer.request_explanations(
                local=False, data=X_test.drop(['target'], axis=1).iloc[0:10])
        assert global_explanations is not None
        assert not hasattr(global_explanations, 'modelClass')
        assert not hasattr(global_explanations, 'explanationMethod')
        assert hasattr(global_explanations, 'precomputedExplanations')
        assert hasattr(global_explanations.precomputedExplanations,
                       'globalFeatureImportance')
        assert not hasattr(global_explanations.precomputedExplanations,
                           'localFeatureImportance')

    def test_explainer_manager_request_local_explanations(self):
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
        rai_insights.explainer.add()
        rai_insights.compute()

        local_explanations = \
            rai_insights.explainer.request_explanations(
                local=True, data=X_test.drop(['target'], axis=1).iloc[0:1])
        assert local_explanations is not None
        assert not hasattr(local_explanations, 'modelClass')
        assert not hasattr(local_explanations, 'explanationMethod')
        assert hasattr(local_explanations, 'precomputedExplanations')
        assert hasattr(local_explanations.precomputedExplanations,
                       'localFeatureImportance')
        assert hasattr(local_explanations.precomputedExplanations,
                       'globalFeatureImportance')

        with pytest.raises(
            UserConfigValidationException,
            match='Only one row of data is allowed for '
                  'local explanation generation.'):
            rai_insights.explainer.request_explanations(
                local=True, data=X_test.drop(['target'], axis=1))

        with pytest.raises(
            UserConfigValidationException,
            match='Data is of type <class \'numpy.ndarray\'>'
                  ' but it must be a pandas DataFrame.'):
            rai_insights.explainer.request_explanations(
                local=True, data=X_test.drop(['target'], axis=1).values)
