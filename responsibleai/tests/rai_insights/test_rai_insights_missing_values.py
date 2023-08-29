# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum

import numpy as np
import pandas as pd
import pytest
from ml_wrappers.model.predictions_wrapper import \
    PredictionsModelWrapperClassification
from tests.common_utils import create_iris_data

from rai_test_utils.models.sklearn import (
    create_complex_classification_pipeline, create_sklearn_svm_classifier)
from raiutils.exceptions import UserConfigValidationException
from responsibleai import RAIInsights
from responsibleai._internal.constants import ManagerNames
from responsibleai.feature_metadata import FeatureMetadata

LABELS = 'labels'


class MISSING_VALUE(Enum):
    NO_MISSING_VALUES = 1
    TRAIN_ONLY_MISSING_VALUES = 2
    TEST_ONLY_MISSING_VALUES = 3
    BOTH_TRAIN_TEST_MISSING_VALUES = 4


class TestRAIInsightsMissingValues(object):

    def test_model_does_not_handle_missing_values(self):
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_iris_data()

        model = create_sklearn_svm_classifier(X_train, y_train)
        X_train.at[1, 'sepal length'] = np.nan
        X_test.at[1, 'sepal length'] = np.nan
        X_train[LABELS] = y_train
        X_test[LABELS] = y_test

        with pytest.raises(
                UserConfigValidationException,
                match='The passed model cannot be '
                      'used for getting predictions via predict'):
            RAIInsights(model, X_train, X_test,
                        LABELS, task_type="classification")

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.EXPLAINER,
                                              ManagerNames.COUNTERFACTUAL])
    @pytest.mark.parametrize('categorical_missing_values', [True, False])
    @pytest.mark.parametrize('missing_value_combination', [
        MISSING_VALUE.NO_MISSING_VALUES,
        MISSING_VALUE.TRAIN_ONLY_MISSING_VALUES,
        MISSING_VALUE.TEST_ONLY_MISSING_VALUES,
        MISSING_VALUE.BOTH_TRAIN_TEST_MISSING_VALUES
    ])
    @pytest.mark.parametrize('wrapper', [True, False])
    def test_model_handles_missing_values(
            self, manager_type, adult_data,
            categorical_missing_values,
            missing_value_combination,
            wrapper):

        data_train, data_test, y_train, y_test, categorical_features, \
            continuous_features, target_name, classes, \
            feature_columns, feature_range_keys = \
            adult_data

        data_train_copy = data_train.copy()
        data_test_copy = data_test.copy()

        if missing_value_combination == \
            MISSING_VALUE.TRAIN_ONLY_MISSING_VALUES or \
            missing_value_combination == \
                MISSING_VALUE.BOTH_TRAIN_TEST_MISSING_VALUES:
            data_train_copy.loc[data_train_copy['age'] > 30, 'age'] = np.nan

        if missing_value_combination == \
            MISSING_VALUE.TEST_ONLY_MISSING_VALUES or \
            missing_value_combination == \
                MISSING_VALUE.BOTH_TRAIN_TEST_MISSING_VALUES:
            data_test_copy.loc[data_test_copy['age'] > 30, 'age'] = np.nan

        if categorical_missing_values:
            if missing_value_combination == \
                MISSING_VALUE.TRAIN_ONLY_MISSING_VALUES or \
                missing_value_combination == \
                    MISSING_VALUE.BOTH_TRAIN_TEST_MISSING_VALUES:
                data_train_copy.loc[
                    data_train_copy[
                        'workclass'] == 'Private', 'workclass'] = np.nan

            if missing_value_combination == \
                MISSING_VALUE.TEST_ONLY_MISSING_VALUES or \
                missing_value_combination == \
                    MISSING_VALUE.BOTH_TRAIN_TEST_MISSING_VALUES:
                data_test_copy.loc[
                    data_test_copy[
                        'workclass'] == 'Private', 'workclass'] = np.nan

        X_train = data_train_copy.drop([target_name], axis=1)
        X_test = data_test_copy.drop([target_name], axis=1)

        model = create_complex_classification_pipeline(
            X_train, y_train, continuous_features,
            categorical_features)

        if wrapper:
            all_data = pd.concat(
                [X_test, X_train])
            model_predict_output = model.predict(all_data)
            model_predict_proba_output = model.predict_proba(all_data)
            model_wrapper = PredictionsModelWrapperClassification(
                all_data,
                model_predict_output,
                model_predict_proba_output,
                should_construct_pandas_query=False)
            model = model_wrapper

        rai_insights = RAIInsights(
            model, data_train_copy, data_test_copy, target_name,
            task_type="classification",
            feature_metadata=FeatureMetadata(
                categorical_features=categorical_features))

        if manager_type == ManagerNames.EXPLAINER:
            if not categorical_missing_values:
                rai_insights.explainer.add()
                rai_insights.compute()
                assert len(rai_insights.explainer.get()) == 1
            else:
                if missing_value_combination != \
                        MISSING_VALUE.NO_MISSING_VALUES:
                    if missing_value_combination == \
                        MISSING_VALUE.TRAIN_ONLY_MISSING_VALUES or \
                        missing_value_combination == \
                            MISSING_VALUE.BOTH_TRAIN_TEST_MISSING_VALUES:
                        error_message = \
                            "Categorical features workclass cannot have " + \
                            "missing values for computing explanations. " + \
                            "Please check your training data."
                    else:
                        error_message = \
                            "Categorical features workclass cannot have " + \
                            "missing values for computing explanations. " + \
                            "Please check your test data."
                    with pytest.raises(
                            UserConfigValidationException,
                            match=error_message):
                        rai_insights.explainer.add()
                else:
                    rai_insights.explainer.add()
                    rai_insights.compute()
                    assert len(rai_insights.explainer.get()) == 1
        elif manager_type == ManagerNames.ERROR_ANALYSIS:
            rai_insights.error_analysis.add()
            rai_insights.compute()
            assert len(rai_insights.error_analysis.get()) == 1
        elif manager_type == ManagerNames.COUNTERFACTUAL:
            if not wrapper:
                if missing_value_combination != \
                        MISSING_VALUE.NO_MISSING_VALUES:
                    if missing_value_combination == \
                        MISSING_VALUE.TRAIN_ONLY_MISSING_VALUES or \
                        missing_value_combination == \
                            MISSING_VALUE.BOTH_TRAIN_TEST_MISSING_VALUES:
                        error_message = \
                            'Missing values are not allowed in ' + \
                            'the train dataset while computing ' + \
                            'counterfactuals.'
                    else:
                        error_message = \
                            'Missing values are not allowed in ' + \
                            'the test dataset while computing ' + \
                            'counterfactuals.'
                    with pytest.raises(
                            UserConfigValidationException,
                            match=error_message):
                        rai_insights.counterfactual.add(
                            total_CFs=10, desired_class="opposite")
                else:
                    rai_insights.counterfactual.add(
                        total_CFs=10, desired_class="opposite")
                    rai_insights.compute()
                    assert len(rai_insights.counterfactual.get()) == 1
        elif manager_type == ManagerNames.CAUSAL:
            if missing_value_combination != \
                    MISSING_VALUE.NO_MISSING_VALUES:
                if missing_value_combination == \
                    MISSING_VALUE.TRAIN_ONLY_MISSING_VALUES or \
                    missing_value_combination == \
                        MISSING_VALUE.BOTH_TRAIN_TEST_MISSING_VALUES:
                    error_message = \
                        'Missing values are not allowed in the ' + \
                        'train dataset while computing causal effects.'
                else:
                    error_message = \
                        'Missing values are not allowed in the ' + \
                        'test dataset while computing causal effects.'
                with pytest.raises(
                        UserConfigValidationException, match=error_message):
                    rai_insights.causal.add(treatment_features=['age'])
            else:
                rai_insights.causal.add(treatment_features=['age'])
                rai_insights.compute()
                assert len(rai_insights.causal.get()) == 1
