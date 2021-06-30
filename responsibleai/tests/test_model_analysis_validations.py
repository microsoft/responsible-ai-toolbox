# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
from .common_utils import (create_iris_data,
                           create_cancer_data,
                           create_lightgbm_classifier)
from responsibleai.modelanalysis._model_analysis_validations import \
    _validate_model_analysis_input_parameters
from responsibleai.exceptions import UserConfigValidationException


class TestModelAnalysisValidations:
    def test_validate_unsupported_task_type(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException):
            _validate_model_analysis_input_parameters(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='regre')

    def test__validate_bad_target_name(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException):
            _validate_model_analysis_input_parameters(
                model=model,
                train=X_train,
                test=X_test,
                target_column='bad_target',
                task_type='regre')

    def test_validate_categorical_features_having_target(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException):
            _validate_model_analysis_input_parameters(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                categorical_features=['target'])

    def test_validate_categorical_features_not_having_train_features(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException):
            _validate_model_analysis_input_parameters(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                categorical_features=['some bad feature name'])

    def test_model_predictions(self):
        X_train, _, y_train, _, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            _validate_model_analysis_input_parameters(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification')

        assert 'The model passed cannot be used for getting predictions' \
            in str(ucve)
