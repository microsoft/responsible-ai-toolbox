# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
import pytest

from rai_test_utils.models.lightgbm import create_lightgbm_classifier
from rai_test_utils.models.sklearn import \
    create_complex_classification_pipeline
from raiutils.exceptions import UserConfigValidationException
from responsibleai._interfaces import ModelExplanationData
from responsibleai.feature_metadata import FeatureMetadata
from responsibleai.rai_insights import RAIInsights

from ..common_utils import (ADULT_CATEGORICAL_FEATURES_AFTER_DROP,
                            ADULT_DROPPED_FEATURES,
                            create_adult_income_dataset, create_iris_data)


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

    def test_explainer_manager_dropped_categorical_features(self):
        data_train, data_test, _, _, categorical_features, \
            continuous_features, target_name, classes, _, _ = \
            create_adult_income_dataset()

        dropped_features = ADULT_DROPPED_FEATURES
        categorical_features_after_drop = \
            ADULT_CATEGORICAL_FEATURES_AFTER_DROP

        X = data_train.drop([target_name] + dropped_features, axis=1)
        y = data_train[target_name]

        model = create_complex_classification_pipeline(
            X, y, continuous_features,
            categorical_features_after_drop)

        # create feature metadata
        feature_metadata = FeatureMetadata(dropped_features=dropped_features)

        rai_insights = RAIInsights(
            model=model,
            train=data_train,
            test=data_test,
            task_type='classification',
            target_column=target_name,
            categorical_features=categorical_features,
            classes=classes,
            feature_metadata=feature_metadata
        )

        rai_insights.explainer.add()
        rai_insights.compute()
