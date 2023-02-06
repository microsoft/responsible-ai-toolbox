# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
import pytest

from rai_test_utils.models.lightgbm import create_lightgbm_classifier
from responsibleai._interfaces import ModelExplanationData
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.rai_insights import RAIInsights

from ..common_utils import create_iris_data


class TestExplainerManager:
    def verify_explanations(self, explanations, is_global=True):
        assert explanations is not None
        assert isinstance(explanations, ModelExplanationData)
        assert not hasattr(explanations, 'modelClass')
        assert not hasattr(explanations, 'explanationMethod')
        assert hasattr(explanations, 'precomputedExplanations')
        assert hasattr(explanations.precomputedExplanations,
                       'globalFeatureImportance')
        if is_global:
            assert not hasattr(explanations.precomputedExplanations,
                               'localFeatureImportance')
        else:
            assert hasattr(explanations.precomputedExplanations,
                           'localFeatureImportance')

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
        self.verify_explanations(global_explanations, is_global=True)

        with pytest.warns(
                UserWarning,
                match="LARGE-DATA-SCENARIO-DETECTED: "
                      "The data is larger than the supported limit of 10000. "
                      "Computing explanations for first 10000 samples only."):
            global_explanations = \
                rai_insights.explainer.request_explanations(
                    local=False,
                    data=pd.concat([X_test] * 400).drop(['target'], axis=1))
        self.verify_explanations(global_explanations, is_global=True)

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
        self.verify_explanations(local_explanations, is_global=False)

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
