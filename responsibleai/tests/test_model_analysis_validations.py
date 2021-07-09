# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import logging
import pytest
from .common_utils import (create_iris_data,
                           create_cancer_data,
                           create_lightgbm_classifier)
from responsibleai.modelanalysis.model_analysis import ModelAnalysis
from responsibleai.exceptions import UserConfigValidationException


class TestModelAnalysisValidations:
    def test_validate_unsupported_task_type(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='regre')
        assert 'Unsupported task type. Should be one of classification or ' + \
            'regression' in str(ucve)

    def test_validate_bad_target_name(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='bad_target',
                task_type='classification')
        assert "Target name bad_target not present in train/test data" in \
            str(ucve)

    def test_validate_categorical_features_having_target(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                categorical_features=['target'])
        assert 'Found target name target in categorical feature list' in \
            str(ucve)

    def test_validate_categorical_features_not_having_train_features(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                categorical_features=['some bad feature name'])
        assert 'Found some feature names in categorical feature which' + \
            ' do not occur in train data' in str(ucve)

    def test_validate_serializer(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            class LoadOnlySerializer:
                def __init__(self, logger=None):
                    self._logger = logger

                def load(self):
                    pass

            serializer = LoadOnlySerializer()
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                serializer=serializer
            )
        assert 'The serializer does not implement save()' in str(ucve)

        with pytest.raises(UserConfigValidationException) as ucve:
            class SaveOnlySerializer:
                def __init__(self, logger=None):
                    self._logger = logger

                def save(self):
                    pass

            serializer = SaveOnlySerializer()
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                serializer=serializer
            )
        assert 'The serializer does not implement load()' in str(ucve)

        with pytest.raises(UserConfigValidationException) as ucve:
            class Serializer:
                def __init__(self, logger=None):
                    self._logger = logger

                def save(self):
                    pass

                def load(self):
                    pass

            serializer = Serializer(logger=logging.getLogger('some logger'))

            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                serializer=serializer
            )
        assert 'The serializer should be serializable via pickle' in str(ucve)

    def test_model_predictions(self):
        X_train, _, y_train, _, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification')

        assert 'The model passed cannot be used for getting predictions' \
            in str(ucve)

    def test_mismatch_train_test_features(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train['target'] = y_train
        X_test['bad_target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification')
        assert 'The features in train and test data do not match' in str(ucve)

    def test_train_labels(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                train_labels=[0, 1, 2])
        assert 'The train labels and distinct values in ' + \
            'target (train data) do not match' in str(ucve)

        y_train[0] = 2
        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                train_labels=[0, 1])
        assert 'The train labels and distinct values in target ' + \
            '(train data) do not match' in str(ucve)

        y_train[0] = 0
        y_test[0] = 2
        X_train['target'] = y_train
        X_test['target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                train_labels=[0, 1])
        assert 'The train labels and distinct values in target ' + \
            '(test data) do not match' in str(ucve)
