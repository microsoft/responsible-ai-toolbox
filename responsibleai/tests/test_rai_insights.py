# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
import pickle
from pathlib import Path
from tempfile import TemporaryDirectory
from uuid import UUID

import numpy as np
import pandas as pd
import pytest

from responsibleai import ModelTask, RAIInsights
from responsibleai._internal.constants import ManagerNames
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager

from .causal_manager_validator import validate_causal
from .common_utils import (create_adult_income_dataset,
                           create_binary_classification_dataset,
                           create_cancer_data,
                           create_complex_classification_pipeline,
                           create_housing_data, create_iris_data,
                           create_models_classification,
                           create_models_regression)
from .counterfactual_manager_validator import validate_counterfactual
from .error_analysis_validator import (setup_error_analysis,
                                       validate_error_analysis)
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


class TestRAIInsights(object):

    @pytest.mark.parametrize('manager_type', [ManagerNames.COUNTERFACTUAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.CAUSAL,
                                              ManagerNames.EXPLAINER])
    def test_rai_insights_iris(self, manager_type):
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
            run_rai_insights(model, X_train, X_test, LABELS, None,
                             manager_type, manager_args, classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.COUNTERFACTUAL,
                                              ManagerNames.EXPLAINER])
    def test_rai_insights_cancer(self, manager_type):
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
            run_rai_insights(model, X_train, X_test, LABELS, None,
                             manager_type, manager_args, classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.EXPLAINER])
    def test_rai_insights_binary(self, manager_type):
        X_train, y_train, X_test, y_test, classes = \
            create_binary_classification_dataset()

        models = create_models_classification(X_train, y_train)
        X_train[LABELS] = y_train
        X_test[LABELS] = y_test
        manager_args = {
            ManagerParams.TREATMENT_FEATURES: ['col0']
        }

        for model in models:
            run_rai_insights(model, X_train, X_test, LABELS, None,
                             manager_type, manager_args,
                             classes=classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.EXPLAINER,
                                              ManagerNames.COUNTERFACTUAL])
    def test_rai_insights_binary_mixed_types(self, manager_type):

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

        run_rai_insights(model, data_train, data_test, target_name,
                         categorical_features,
                         manager_type, manager_args,
                         classes=classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.ERROR_ANALYSIS,
                                              ManagerNames.EXPLAINER,
                                              ManagerNames.COUNTERFACTUAL])
    def test_rai_insights_no_model(self, manager_type):

        X_train, y_train, X_test, y_test, classes = \
            create_binary_classification_dataset()

        X_train[LABELS] = y_train
        X_test[LABELS] = y_test
        model = None
        manager_args = {
            ManagerParams.TREATMENT_FEATURES: ['col0']
        }

        run_rai_insights(model, X_train, X_test, LABELS, None,
                         manager_type, manager_args,
                         classes=classes)

    @pytest.mark.parametrize('manager_type', [ManagerNames.CAUSAL,
                                              ManagerNames.COUNTERFACTUAL,
                                              ManagerNames.EXPLAINER,
                                              ManagerNames.ERROR_ANALYSIS])
    def test_rai_insights_housing(self, manager_type):
        X_train, X_test, y_train, y_test, feature_names = \
            create_housing_data()
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        models = create_models_regression(X_train, y_train)
        X_train[LABELS] = y_train
        X_test[LABELS] = y_test

        manager_args = {
            ManagerParams.DESIRED_RANGE: [5, 10],
            ManagerParams.TREATMENT_FEATURES: ['AveRooms'],
            ManagerParams.MAX_CAT_EXPANSION: 12,
            ManagerParams.FEATURE_IMPORTANCE: True
        }

        for model in models:
            run_rai_insights(model, X_train, X_test, LABELS, [],
                             manager_type, manager_args)


def run_rai_insights(model, train_data, test_data, target_column,
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
            rai_insights = RAIInsights(
                model, train_data, test_data,
                target_column,
                categorical_features=categorical_features,
                task_type=task_type)
    else:
        rai_insights = RAIInsights(
            model, train_data, test_data,
            target_column,
            categorical_features=categorical_features,
            task_type=task_type)

    if manager_type == ManagerNames.EXPLAINER:
        setup_explainer(rai_insights)
    elif manager_type == ManagerNames.ERROR_ANALYSIS:
        setup_error_analysis(rai_insights)

    validate_rai_insights(rai_insights, train_data, test_data,
                          target_column, task_type, categorical_features)

    if manager_type == ManagerNames.CAUSAL:
        treatment_features = manager_args.get(ManagerParams.TREATMENT_FEATURES)
        max_cat_expansion = manager_args.get(ManagerParams.MAX_CAT_EXPANSION)
        validate_causal(rai_insights, train_data, target_column,
                        treatment_features, max_cat_expansion)
    elif manager_type == ManagerNames.COUNTERFACTUAL:
        desired_class = manager_args.get(ManagerParams.DESIRED_CLASS)
        desired_range = manager_args.get(ManagerParams.DESIRED_RANGE)
        feature_importance = manager_args.get(ManagerParams.FEATURE_IMPORTANCE)
        validate_counterfactual(rai_insights,
                                desired_class=desired_class,
                                desired_range=desired_range,
                                feature_importance=feature_importance)
    elif manager_type == ManagerNames.ERROR_ANALYSIS:
        validate_error_analysis(rai_insights)
    elif manager_type == ManagerNames.EXPLAINER:
        validate_explainer(rai_insights, train_data, test_data, classes)

    with TemporaryDirectory() as tmpdir:
        path = Path(tmpdir) / 'rai_test_path'
        # save the rai_insights
        rai_insights.save(path)

        # Validate the common set of state produced when rai insights
        # are saved on the disk.
        validate_common_state_directories(path, task_type)

        # Validate the directory structure of the state saved
        # by the managers.
        validate_component_state_directory(path, manager_type)

        # load the rai_insights
        rai_insights = RAIInsights.load(path)

        validate_rai_insights(
            rai_insights, train_data, test_data,
            target_column, task_type, categorical_features)

        if manager_type == ManagerNames.ERROR_ANALYSIS:
            validate_error_analysis(rai_insights)
            # validate adding new reports after deserialization works
            setup_error_analysis(rai_insights, max_depth=4)
            validate_error_analysis(rai_insights, expected_reports=2)
        elif manager_type == ManagerNames.EXPLAINER:
            validate_explainer(rai_insights, train_data, test_data, classes)
            # validate adding new explainer config after deserialization works
            setup_explainer(rai_insights)
            validate_explainer(rai_insights, train_data, test_data, classes)


def validate_common_state_directories(path, task_type):
    all_other_files = os.listdir(path)
    assert "meta.json" in all_other_files
    assert "model.pkl" in all_other_files

    model = None
    with open(path / 'model.pkl', 'rb') as file:
        model = pickle.load(file)

    predictions_path = path / "predictions"
    assert predictions_path.exists()
    all_predictions_files = os.listdir(predictions_path)
    if model is not None:
        assert "predict.json" in all_predictions_files
        if task_type == ModelTask.CLASSIFICATION:
            assert "predict_proba.json" in all_predictions_files
        else:
            assert "predict_proba.json" not in all_predictions_files
    else:
        assert len(all_predictions_files) == 0

    data_path = path / "data"
    assert data_path.exists()
    all_data_files = os.listdir(data_path)
    assert "train.json" in all_data_files
    assert "traindtypes.json" in all_data_files
    assert "test.json" in all_data_files
    assert "testdtypes.json" in all_data_files


def validate_component_state_directory(path, manager_type):
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
            assert not generators_path.exists()
        elif manager_type == ManagerNames.ERROR_ANALYSIS:
            assert config_path.exists()
            assert data_path.exists()
            assert not generators_path.exists()
        elif manager_type == ManagerNames.CAUSAL:
            assert not config_path.exists()
            assert data_path.exists()
            assert not generators_path.exists()


def validate_rai_insights(
    rai_insights,
    train_data,
    test_data,
    target_column,
    task_type,
    categorical_features
):

    pd.testing.assert_frame_equal(rai_insights.train, train_data)
    pd.testing.assert_frame_equal(rai_insights.test, test_data)
    assert rai_insights.target_column == target_column
    assert rai_insights.task_type == task_type
    assert rai_insights.categorical_features == (categorical_features or [])
    if task_type == ModelTask.CLASSIFICATION:
        classes = train_data[target_column].unique()
        classes.sort()
        np.testing.assert_array_equal(rai_insights._classes,
                                      classes)
