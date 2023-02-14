# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Note: this test file will be removed once ModelAnalysis is removed."""

import logging
from unittest.mock import MagicMock

import pandas as pd
import pytest
from tests.common_utils import create_iris_data

from rai_test_utils.datasets.tabular import (
    create_binary_classification_dataset, create_cancer_data,
    create_housing_data)
from rai_test_utils.models.lightgbm import create_lightgbm_classifier
from rai_test_utils.models.sklearn import \
    create_sklearn_random_forest_regressor
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.modelanalysis.model_analysis import ModelAnalysis


class TestModelAnalysisValidations:
    def test_validate_unsupported_task_type(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        message = ("Unsupported task type 'regre'. "
                   "Should be one of \\['classification', 'regression'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='regre')

    def test_validate_test_data_size(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        length = len(y_test)
        with pytest.warns(
                UserWarning,
                match=f"The size of the test set {length} is greater than "
                      f"the supported limit of {length-1}. Computing insights"
                      f" for the first {length-1} samples of the test set"):
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                maximum_rows_for_test=len(y_test) - 1)

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
            str(ucve.value)

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
            str(ucve.value)

    def test_validate_categorical_features_not_having_train_features(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        message = ("Feature names in categorical_features "
                   "do not exist in train data: \\['not_a_feature'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification',
                categorical_features=['not_a_feature'])

    def test_validate_serializer(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data(return_dataframe=True)
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
        assert 'The serializer does not implement save()' in str(ucve.value)

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
        assert 'The serializer does not implement load()' in str(ucve.value)

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
        assert 'The serializer should be serializable via pickle' in \
            str(ucve.value)

    def test_model_predictions_predict(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data(return_dataframe=True)

        X_train['target'] = y_train
        X_test['target'] = y_test

        model = MagicMock()
        model.predict.side_effect = Exception()
        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification')

        assert 'The passed model cannot be used for getting predictions ' + \
            'via predict' in str(ucve.value)

    def test_model_predictions_predict_proba(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data(return_dataframe=True)

        X_train['target'] = y_train
        X_test['target'] = y_test

        model = MagicMock()
        model.predict.return_value = [0]
        model.predict_proba.side_effect = Exception()

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='classification')

        assert 'The passed model cannot be used for getting predictions ' + \
            'via predict_proba' in str(ucve.value)

    def test_model_analysis_incorrect_task_type(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data(return_dataframe=True)
        model = create_lightgbm_classifier(X_train, y_train)

        X_train['target'] = y_train
        X_test['target'] = y_test

        err_msg = ('The regression model '
                   'provided has a predict_proba function. '
                   'Please check the task_type.')
        with pytest.raises(UserConfigValidationException, match=err_msg):
            ModelAnalysis(
                model=model,
                train=X_train,
                test=X_test,
                target_column='target',
                task_type='regression')

    def test_mismatch_train_test_features(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data(return_dataframe=True)
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
        assert 'The features in train and test data do not match' in \
            str(ucve.value)

    def test_unsupported_train_test_types(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data(return_dataframe=True)
        model = create_lightgbm_classifier(X_train, y_train)

        X_train['target'] = y_train
        X_test['bad_target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            ModelAnalysis(
                model=model,
                train=X_train.values,
                test=X_test.values,
                target_column='target',
                task_type='classification')
        assert "Unsupported data type for either train or test. " + \
            "Expecting pandas DataFrame for train and test." in str(ucve.value)

    def test_train_labels(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data(return_dataframe=True)
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
            'target (train data) do not match' in str(ucve.value)

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
            '(train data) do not match' in str(ucve.value)

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
            '(test data) do not match' in str(ucve.value)


class TestCausalUserConfigValidations:

    def test_treatment_features_list_not_having_train_features(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        model_analysis = ModelAnalysis(
            model=model,
            train=X_train,
            test=X_test,
            target_column='target',
            task_type='classification')

        message = ("Feature names in treatment_features "
                   "do not exist in train data: \\['not_a_feature'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            model_analysis.causal.add(treatment_features=['not_a_feature'])


class TestCounterfactualUserConfigValidations:

    def test_features_to_vary_list_not_having_train_features(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        model_analysis = ModelAnalysis(
            model=model,
            train=X_train,
            test=X_test,
            target_column='target',
            task_type='classification')

        message = ("Feature names in features_to_vary do "
                   "not exist in train data: \\['not_a_feature'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            model_analysis.counterfactual.add(
                total_CFs=10, features_to_vary=['not_a_feature'])

    def test_permitted_range_not_having_train_features(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        model_analysis = ModelAnalysis(
            model=model,
            train=X_train,
            test=X_test,
            target_column='target',
            task_type='classification')

        message = ("Feature names in permitted_range do "
                   "not exist in train data: \\['not_a_feature'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            model_analysis.counterfactual.add(
                total_CFs=10, permitted_range={'not_a_feature': [20, 40]})

    def test_desired_class_not_set(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        model_analysis = ModelAnalysis(
            model=model,
            train=X_train,
            test=X_test,
            target_column='target',
            task_type='classification')
        with pytest.raises(
                UserConfigValidationException,
                match='The desired_class attribute should be '
                      'either \'opposite\' for binary classification or '
                      'the class value for multi-classification scenarios.'):
            model_analysis.counterfactual.add(
                total_CFs=10,
                method='random')

    def test_desired_range_not_set(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_housing_data()

        model = create_sklearn_random_forest_regressor(X_train, y_train)
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        X_train['TARGET'] = y_train
        X_test['TARGET'] = y_test

        model_analysis = ModelAnalysis(
            model=model,
            train=X_train,
            test=X_test,
            target_column='TARGET',
            task_type='regression')
        with pytest.raises(
                UserConfigValidationException,
                match='The desired_range should not be None'
                      ' for regression scenarios.'):
            model_analysis.counterfactual.add(
                total_CFs=10,
                method='random')

    def test_desired_class_opposite_multi_classification(self):
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_iris_data()
        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        model_analysis = ModelAnalysis(
            model=model,
            train=X_train,
            test=X_test,
            target_column='target',
            task_type='classification')

        with pytest.raises(
                UserConfigValidationException,
                match='The desired_class attribute should not be \'opposite\''
                      ' It should be the class value for multiclass'
                      ' classification scenario.'):
            model_analysis.counterfactual.add(
                total_CFs=10,
                method='random',
                desired_class='opposite')

    def test_feature_importance_with_less_counterfactuals(self):
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_iris_data()
        model = create_lightgbm_classifier(X_train, y_train)
        X_train['target'] = y_train
        X_test['target'] = y_test

        model_analysis = ModelAnalysis(
            model=model,
            train=X_train,
            test=X_test,
            target_column='target',
            task_type='classification')

        with pytest.raises(
                UserConfigValidationException,
                match="A total_CFs value of at least 10 is required to "
                      "use counterfactual feature importances. "
                      "Either increase total_CFs to at least 10 or "
                      "set feature_importance to False."):
            model_analysis.counterfactual.add(
                total_CFs=5,
                method='random',
                desired_class=2)

    def test_eval_data_having_new_categories(self):
        train_data = pd.DataFrame(
            data=[[1, 2, 0],
                  [2, 3, 1],
                  [3, 3, 0]],
            columns=['c1', 'c2', 'target']
        )
        test_data = pd.DataFrame(
            data=[[1, 1, 0]],
            columns=['c1', 'c2', 'target']
        )

        X_train = train_data.drop(['target'], axis=1)
        y_train = train_data['target']
        model = create_lightgbm_classifier(X_train, y_train)

        model_analysis = ModelAnalysis(
            model=model,
            train=train_data,
            test=test_data,
            target_column='target',
            task_type='classification',
            categorical_features=['c2'])

        message = ("Counterfactual example generation requires "
                   "that every category of "
                   "categorical features present in the test data be "
                   "also present in the train data. "
                   "Categories missing from train data: "
                   "{'c2': \\[1\\]}")
        with pytest.raises(
                UserConfigValidationException, match=message):
            model_analysis.counterfactual.add(
                total_CFs=10,
                method='random',
                desired_class='opposite')
