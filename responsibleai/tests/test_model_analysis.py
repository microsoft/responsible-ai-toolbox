# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
from tempfile import TemporaryDirectory
from .common_utils import (create_boston_data,
                           create_cancer_data,
                           create_iris_data,
                           create_binary_classification_dataset,
                           create_adult_income_dataset,
                           create_models_classification,
                           create_complex_classification_pipeline,
                           create_models_regression)

from responsibleai import ModelAnalysis, ModelTask
from responsibleai._internal.constants import ManagerNames

from .causal_manager_validator import validate_causal
from .counterfactual_manager_validator import validate_counterfactual
from .error_analysis_validator import (
    setup_error_analysis, validate_error_analysis)
from .explainer_manager_validator import setup_explainer, validate_explainer


LABELS = 'labels'


class ManagerParams:
    # Counterfactual
    DESIRED_CLASS = 'desired_class'
    DESIRED_RANGE = 'desired_range'
    FEATURE_IMPORTANCE = 'feature_importance'

    # Causal
    TREATMENT_FEATURES = 'treatment_features'
    MAX_CAT_EXPANSION = 'max_cat_expansion'


class TestModelAnalysis(object):

    @pytest.mark.parametrize('manager_type', [ManagerNames.COUNTERFACTUAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.CAUSAL,
                                              ManagerNames.EXPLAINER])
    def test_model_analysis_iris(self, manager_type):
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_iris_data()
        models = create_models_classification(X_train, y_train)
        X_train[LABELS] = y_train
        X_test[LABELS] = y_test
        manager_args = {
            ManagerParams.TREATMENT_FEATURES: [feature_names[0]],
            ManagerParams.DESIRED_CLASS: 0,
            ManagerParams.FEATURE_IMPORTANCE: True
        }

        for model in models:
            run_model_analysis(model, X_train, X_test, LABELS, [],
                               manager_type, manager_args, classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.COUNTERFACTUAL,
                                              ManagerNames.EXPLAINER])
    def test_model_analysis_cancer(self, manager_type):
        X_train, X_test, y_train, y_test, _, classes = \
            create_cancer_data()
        models = create_models_classification(X_train, y_train)
        X_train[LABELS] = y_train
        X_test[LABELS] = y_test
        manager_args = {
            ManagerParams.DESIRED_CLASS: 'opposite',
            ManagerParams.FEATURE_IMPORTANCE: False
        }

        for model in models:
            run_model_analysis(model, X_train, X_test, LABELS, [],
                               manager_type, manager_args, classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.EXPLAINER])
    def test_model_analysis_binary(self, manager_type):
        X_train, y_train, X_test, y_test, classes = \
            create_binary_classification_dataset()

        models = create_models_classification(X_train, y_train)
        X_train[LABELS] = y_train
        X_test[LABELS] = y_test
        manager_args = {
            ManagerParams.TREATMENT_FEATURES: ['col0']
        }

        for model in models:
            run_model_analysis(model, X_train, X_test, LABELS, [],
                               manager_type, manager_args,
                               classes=classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.EXPLAINER,
                                              ManagerNames.COUNTERFACTUAL])
    def test_model_analysis_binary_mixed_types(self, manager_type):

        data_train, data_test, y_train, y_test, categorical_features, \
            continuous_features, target_name, classes = \
            create_adult_income_dataset()
        X_train = data_train.drop([target_name], axis=1)

        model = create_complex_classification_pipeline(
            X_train, y_train, continuous_features, categorical_features)
        manager_args = {
            ManagerParams.TREATMENT_FEATURES: ['age', 'hours_per_week'],
            ManagerParams.DESIRED_CLASS: 'opposite',
            ManagerParams.FEATURE_IMPORTANCE: False
        }

        run_model_analysis(model, data_train, data_test, target_name,
                           categorical_features,
                           manager_type, manager_args,
                           classes=classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.EXPLAINER,
                                              ManagerNames.COUNTERFACTUAL])
    def test_model_analysis_no_model(self, manager_type):

        X_train, y_train, X_test, y_test, classes = \
            create_binary_classification_dataset()

        X_train[LABELS] = y_train
        X_test[LABELS] = y_test
        model = None
        manager_args = {
            ManagerParams.TREATMENT_FEATURES: ['col0']
        }

        run_model_analysis(model, X_train, X_test, LABELS, [],
                           manager_type, manager_args,
                           classes=classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.COUNTERFACTUAL,
                                              ManagerNames.EXPLAINER])
    def test_modelanalysis_boston(self, manager_type):
        X_train, X_test, y_train, y_test, feature_names = \
            create_boston_data()
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        models = create_models_regression(X_train, y_train)
        X_train[LABELS] = y_train
        X_test[LABELS] = y_test

        manager_args = {
            ManagerParams.DESIRED_RANGE: [10, 20],
            ManagerParams.TREATMENT_FEATURES: ['CHAS'],
            ManagerParams.MAX_CAT_EXPANSION: 12,
            ManagerParams.FEATURE_IMPORTANCE: True
        }

        for model in models:
            run_model_analysis(model, X_train, X_test, LABELS, ['CHAS'],
                               manager_type, manager_args)


def run_model_analysis(model, train_data, test_data, target_column,
                       categorical_features, manager_type,
                       manager_args=None, classes=None):
    if manager_args is None:
        manager_args = {}

    if classes is not None:
        task_type = ModelTask.CLASSIFICATION
    else:
        task_type = ModelTask.REGRESSION

    if manager_type == ManagerNames.COUNTERFACTUAL:
        feature_importance = manager_args.get(ManagerParams.FEATURE_IMPORTANCE)
        if feature_importance:
            test_data = test_data[0:20]
        else:
            test_data = test_data[0:1]

    if model is None:
        with pytest.warns(
                UserWarning,
                match='INVALID-MODEL-WARNING: '
                      'No valid model is supplied. '
                      'The explanations, error analysis and '
                      'counterfactuals may not work'):
            model_analysis = ModelAnalysis(
                model, train_data, test_data,
                target_column,
                categorical_features=categorical_features,
                task_type=task_type)
    else:
        model_analysis = ModelAnalysis(
            model, train_data, test_data,
            target_column,
            categorical_features=categorical_features,
            task_type=task_type)

    if manager_type == ManagerNames.EXPLAINER:
        setup_explainer(model_analysis)
    elif manager_type == ManagerNames.ERROR_ANALYSIS:
        setup_error_analysis(model_analysis)

    validate_model_analysis(model_analysis, train_data, test_data,
                            target_column, task_type, categorical_features)

    if manager_type == ManagerNames.CAUSAL:
        treatment_features = manager_args.get(ManagerParams.TREATMENT_FEATURES)
        max_cat_expansion = manager_args.get(ManagerParams.MAX_CAT_EXPANSION)
        validate_causal(model_analysis, train_data, target_column,
                        treatment_features, max_cat_expansion)
    elif manager_type == ManagerNames.COUNTERFACTUAL:
        desired_class = manager_args.get(ManagerParams.DESIRED_CLASS)
        desired_range = manager_args.get(ManagerParams.DESIRED_RANGE)
        feature_importance = manager_args.get(ManagerParams.FEATURE_IMPORTANCE)
        validate_counterfactual(model_analysis,
                                desired_class=desired_class,
                                desired_range=desired_range,
                                feature_importance=feature_importance)
    elif manager_type == ManagerNames.ERROR_ANALYSIS:
        validate_error_analysis(model_analysis)
    elif manager_type == ManagerNames.EXPLAINER:
        validate_explainer(model_analysis, train_data, test_data, classes)

    with TemporaryDirectory() as tempdir:
        path = Path(tempdir) / 'rai_test_path'
        # save the model_analysis
        model_analysis.save(path)
        # load the model_analysis
        model_analysis = ModelAnalysis.load(path)

        if manager_type == ManagerNames.EXPLAINER:
            setup_explainer(model_analysis)

        validate_model_analysis(
            model_analysis, train_data, test_data,
            target_column, task_type, categorical_features)

        if manager_type == ManagerNames.ERROR_ANALYSIS:
            validate_error_analysis(model_analysis)
            # validate adding new reports after deserialization works
            setup_error_analysis(model_analysis, max_depth=4)
            validate_error_analysis(model_analysis, expected_reports=2)
        elif manager_type == ManagerNames.EXPLAINER:
            validate_explainer(model_analysis, train_data, test_data, classes)


def validate_model_analysis(
    model_analysis,
    train_data,
    test_data,
    target_column,
    task_type,
    categorical_features
):

    pd.testing.assert_frame_equal(model_analysis.train, train_data)
    pd.testing.assert_frame_equal(model_analysis.test, test_data)
    assert model_analysis.target_column == target_column
    assert model_analysis.task_type == task_type
    assert model_analysis.categorical_features == categorical_features
    if task_type == ModelTask.CLASSIFICATION:
        np.testing.assert_array_equal(model_analysis._classes,
                                      train_data[target_column].unique())
