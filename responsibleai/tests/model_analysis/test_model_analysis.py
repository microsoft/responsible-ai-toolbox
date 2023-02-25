# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Note: this test file will be removed once ModelAnalysis is removed."""

import os
from pathlib import Path
from tempfile import TemporaryDirectory
from uuid import UUID

import numpy as np
import pandas as pd
import pytest
from tests.causal_manager_validator import validate_causal
from tests.common_utils import create_adult_income_dataset, create_iris_data
from tests.counterfactual_manager_validator import validate_counterfactual
from tests.error_analysis_validator import (setup_error_analysis,
                                            validate_error_analysis)
from tests.explainer_manager_validator import (setup_explainer,
                                               validate_explainer)

from rai_test_utils.datasets.tabular import (
    create_binary_classification_dataset, create_cancer_data,
    create_housing_data)
from rai_test_utils.models.model_utils import (create_models_classification,
                                               create_models_regression)
from rai_test_utils.models.sklearn import \
    create_complex_classification_pipeline
from responsibleai import ModelAnalysis, ModelTask
from responsibleai._internal.constants import ManagerNames
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager

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
            run_model_analysis(model, X_train, X_test, LABELS, None,
                               manager_type, manager_args, classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.COUNTERFACTUAL,
                                              ManagerNames.EXPLAINER])
    def test_model_analysis_cancer(self, manager_type):
        X_train, X_test, y_train, y_test, _, classes = \
            create_cancer_data(return_dataframe=True)
        models = create_models_classification(X_train, y_train)
        X_train[LABELS] = y_train
        X_test[LABELS] = y_test
        manager_args = {
            ManagerParams.DESIRED_CLASS: 'opposite',
            ManagerParams.FEATURE_IMPORTANCE: False
        }

        for model in models:
            run_model_analysis(model, X_train, X_test, LABELS, None,
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
            run_model_analysis(model, X_train, X_test, LABELS, None,
                               manager_type, manager_args,
                               classes=classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.EXPLAINER,
                                              ManagerNames.COUNTERFACTUAL])
    def test_model_analysis_binary_mixed_types(self, manager_type):

        data_train, data_test, y_train, y_test, categorical_features, \
            continuous_features, target_name, classes, \
            feature_columns, feature_range_keys = \
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

        run_model_analysis(model, X_train, X_test, LABELS, None,
                           manager_type, manager_args,
                           classes=classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.COUNTERFACTUAL,
                                              ManagerNames.EXPLAINER])
    def test_modelanalysis_housing(self, manager_type):
        X_train, X_test, y_train, y_test, feature_names = \
            create_housing_data()
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        models = create_models_regression(X_train, y_train)
        X_train[LABELS] = y_train
        X_test[LABELS] = y_test

        manager_args = {
            ManagerParams.DESIRED_RANGE: [3, 5],
            ManagerParams.TREATMENT_FEATURES: ['AveRooms'],
            ManagerParams.MAX_CAT_EXPANSION: 12,
            ManagerParams.FEATURE_IMPORTANCE: True
        }

        for model in models:
            run_model_analysis(model, X_train, X_test, LABELS, [],
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
        with pytest.warns(DeprecationWarning,
                          match=("MODULE-DEPRECATION-WARNING: "
                                 "ModelAnalysis in responsibleai "
                                 "package is deprecated. "
                                 "Please use RAIInsights instead.")):
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

        # Validate the directory structure of the state saved
        # by the managers.
        validate_state_directory(path, manager_type)

        # load the model_analysis
        model_analysis = ModelAnalysis.load(path)

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
            # validate adding new explainer config after deserialization works
            setup_explainer(model_analysis)
            validate_explainer(model_analysis, train_data, test_data, classes)


def validate_state_directory(path, manager_type):
    all_dirs = os.listdir(path)
    assert manager_type in all_dirs
    all_component_paths = os.listdir(path / manager_type)
    for component_path in all_component_paths:
        # Test if the component directory has UUID structure
        UUID(component_path, version=4)

        dm = DirectoryManager(path / manager_type, component_path)

        config_path = dm.get_config_directory()
        data_path = dm.get_data_directory()
        generators_path = dm.get_generators_directory()

        if manager_type == ManagerNames.EXPLAINER:
            assert not config_path.exists()
            assert data_path.exists()
            assert not generators_path.exists()
        elif manager_type == ManagerNames.COUNTERFACTUAL:
            assert config_path.exists()
            assert data_path.exists()
            assert generators_path.exists()
        elif manager_type == ManagerNames.ERROR_ANALYSIS:
            assert config_path.exists()
            assert data_path.exists()
            assert not generators_path.exists()
        elif manager_type == ManagerNames.CAUSAL:
            assert not config_path.exists()
            assert data_path.exists()
            assert not generators_path.exists()


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
    assert model_analysis.categorical_features == (categorical_features or [])
    assert type(model_analysis.categorical_features) is list
    if task_type == ModelTask.CLASSIFICATION:
        classes = train_data[target_column].unique()
        classes.sort()
        np.testing.assert_array_equal(model_analysis.rai_insights._classes,
                                      classes)
