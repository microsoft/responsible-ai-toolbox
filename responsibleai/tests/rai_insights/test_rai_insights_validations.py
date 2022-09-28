# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import logging
from unittest.mock import MagicMock

import numpy as np
import pandas as pd
import pytest
from lightgbm import LGBMClassifier
from tests.common_utils import (create_binary_classification_dataset,
                                create_cancer_data, create_housing_data,
                                create_iris_data, create_lightgbm_classifier,
                                create_sklearn_random_forest_regressor)

from responsibleai import RAIInsights
from responsibleai.exceptions import UserConfigValidationException

TARGET = 'target'


class TestRAIInsightsValidations:
    def test_validate_unsupported_task_type(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        message = ("Unsupported task type 'regre'. "
                   "Should be one of \\['classification', 'regression'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='regre')

    def test_validate_test_data_size(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column='bad_target',
                task_type='classification',
                maximum_rows_for_test=len(y_test) - 1)
        assert "The test data has 31 rows, but limit is set to 30 rows" in \
            str(ucve.value)
        assert "Please resample the test data or " +\
            "adjust maximum_rows_for_test" in \
            str(ucve.value)

    def test_empty_train_or_test_datasets(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test
        X_test_empty = pd.DataFrame(columns=X_test.columns)
        X_train_empty = pd.DataFrame(columns=X_train.columns)

        with pytest.raises(
                UserConfigValidationException,
                match='Either of the train/test are empty. '
                      'Please provide non-empty dataframes for train '
                      'and test sets.'):
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test_empty,
                target_column=TARGET,
                task_type='classification')

        with pytest.raises(
                UserConfigValidationException,
                match='Either of the train/test are empty. '
                      'Please provide non-empty dataframes for train '
                      'and test sets.'):
            RAIInsights(
                model=model,
                train=X_train_empty,
                test=X_test,
                target_column=TARGET,
                task_type='classification')

    def test_validate_bad_target_name(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
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
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification',
                categorical_features=[TARGET])
        assert 'Found target name target in categorical feature list' in \
            str(ucve.value)

    def test_validate_categorical_features_not_having_train_features(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_iris_data()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        message = ("Feature names in categorical_features "
                   "do not exist in train data: \\['not_a_feature'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification',
                categorical_features=['not_a_feature'])

    def test_validate_serializer(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            class LoadOnlySerializer:
                def __init__(self, logger=None):
                    self._logger = logger

                def load(self):
                    pass

            serializer = LoadOnlySerializer()
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
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
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
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

            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification',
                serializer=serializer
            )
        assert 'The serializer should be serializable via pickle' in \
            str(ucve.value)

    def test_model_predictions_predict(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        model = MagicMock()
        model.predict.side_effect = Exception()
        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification')

        assert 'The model passed cannot be used for getting predictions ' + \
            'via predict()' in str(ucve.value)

    def test_model_predictions_predict_proba(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        model = MagicMock()
        model.predict.return_value = [0]
        model.predict_proba.side_effect = Exception()

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification')

        assert 'The model passed cannot be used for getting predictions ' + \
            'via predict_proba()' in str(ucve.value)

    def test_incorrect_task_type(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        err_msg = ('The regression model'
                   'provided has a predict_proba function. '
                   'Please check the task_type.')
        with pytest.raises(UserConfigValidationException, match=err_msg):
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='regression')

    def test_mismatch_train_test_features(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train[TARGET] = y_train
        X_test['bad_target'] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification')
        assert 'The features in train and test data do not match' in \
            str(ucve.value)

    def test_dirty_train_test_data(self):
        X_train = pd.DataFrame(data=[['1', np.nan], ['2', '3']],
                               columns=['c1', 'c2'])
        y_train = np.array([1, 0])
        X_test = pd.DataFrame(data=[['1', '2'], ['2', '3']],
                              columns=['c1', 'c2'])
        y_test = np.array([1, 0])

        model = LGBMClassifier(boosting_type='gbdt', learning_rate=0.1,
                               max_depth=5, n_estimators=200, n_jobs=1,
                               random_state=777)

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                categorical_features=['c2'],
                task_type='classification')

        assert 'Error finding unique values in column c2. ' + \
            'Please check your train data.' in str(ucve.value)

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_test,
                test=X_train,
                target_column=TARGET,
                categorical_features=['c2'],
                task_type='classification')

        assert 'Error finding unique values in column c2. ' + \
            'Please check your test data.' in str(ucve.value)

    def test_unsupported_train_test_types(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train.values,
                test=X_test.values,
                target_column=TARGET,
                task_type='classification')

        assert "Unsupported data type for either train or test. " + \
            "Expecting pandas DataFrame for train and test." in str(ucve.value)

    def test_classes_exceptions(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification',
                classes=[0, 1, 2])
        assert 'The train labels and distinct values in ' + \
            'target (train data) do not match' in str(ucve.value)

        y_train[0] = 2
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification',
                classes=[0, 1])
        assert 'The train labels and distinct values in target ' + \
            '(train data) do not match' in str(ucve.value)

        y_train[0] = 0
        y_test[0] = 2
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification',
                classes=[0, 1])

        assert 'The train labels and distinct values in target ' + \
            '(test data) do not match' in str(ucve.value)

    def test_classes_passes(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        rai = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column=TARGET,
            task_type='classification')
        # validate classes are always sorted
        classes = rai._classes
        assert np.all(classes[:-1] <= classes[1:])

    def test_no_model_but_serializer_provided(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=None,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification',
                serializer={})
        assert 'No valid model is specified but model serializer provided.' \
            in str(ucve.value)

    def test_feature_metadata(self):
        X_train, X_test, y_train, y_test, _, _ = \
            create_cancer_data()
        model = create_lightgbm_classifier(X_train, y_train)

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test
        from responsibleai.feature_metadata import FeatureMetadata
        feature_metadata = FeatureMetadata(identity_feature_name='id')

        err_msg = ('The given identity feature name id is not present'
                   ' in user features.')
        with pytest.raises(UserConfigValidationException, match=err_msg):
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification',
                feature_metadata=feature_metadata)

    def test_misidentified_categorical_features(self):
        X_train = pd.DataFrame(data=[['1', 1], ['2', 3]],
                               columns=['c1', 'c2'])
        y_train = np.array([1, 0])
        X_test = pd.DataFrame(data=[['1', 2], ['2', 3]],
                              columns=['c1', 'c2'])
        y_test = np.array([1, 0])

        model = LGBMClassifier(boosting_type='gbdt', learning_rate=0.1,
                               max_depth=5, n_estimators=200, n_jobs=1,
                               random_state=777)

        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        with pytest.raises(UserConfigValidationException) as ucve:
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification')

        assert "The following string features were not " + \
            "identified as categorical features: {\'c1\'}" in str(ucve.value)


class TestCausalUserConfigValidations:

    def test_treatment_features_list_not_having_train_features(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column=TARGET,
            task_type='classification')

        message = ("Feature names in treatment_features "
                   "do not exist in train data: \\['not_a_feature'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            rai_insights.causal.add(treatment_features=['not_a_feature'])

    def test_heterogeneity_features_list_not_having_train_features(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column=TARGET,
            task_type='classification')

        message = ("Feature names in heterogeneity_features "
                   "do not exist in train data: \\['not_a_feature'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            rai_insights.causal.add(
                treatment_features=['col1'],
                heterogeneity_features=['not_a_feature'])


class TestCounterfactualUserConfigValidations:

    def test_features_to_vary_list_not_having_train_features(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column=TARGET,
            task_type='classification')

        message = ("Feature names in features_to_vary do "
                   "not exist in train data: \\['not_a_feature'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            rai_insights.counterfactual.add(
                total_CFs=10, features_to_vary=['not_a_feature'])

    def test_permitted_range_not_having_train_features(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column=TARGET,
            task_type='classification')

        message = ("Feature names in permitted_range do "
                   "not exist in train data: \\['not_a_feature'\\]")
        with pytest.raises(UserConfigValidationException, match=message):
            rai_insights.counterfactual.add(
                total_CFs=10, permitted_range={'not_a_feature': [20, 40]})

    def test_desired_class_not_set(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()

        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column=TARGET,
            task_type='classification')
        with pytest.raises(
                UserConfigValidationException,
                match='The desired_class attribute should be '
                      'either \'opposite\' for binary classification or '
                      'the class value for multi-classification scenarios.'):
            rai_insights.counterfactual.add(
                total_CFs=10,
                method='random')

    def test_desired_range_not_set(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_housing_data()

        model = create_sklearn_random_forest_regressor(X_train, y_train)
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column=TARGET,
            task_type='regression')
        with pytest.raises(
                UserConfigValidationException,
                match='The desired_range should not be None'
                      ' for regression scenarios.'):
            rai_insights.counterfactual.add(
                total_CFs=10,
                method='random')

    def test_desired_class_opposite_multi_classification(self):
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_iris_data()
        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column=TARGET,
            task_type='classification')

        with pytest.raises(
                UserConfigValidationException,
                match='The desired_class attribute should not be \'opposite\''
                      ' It should be the class value for multiclass'
                      ' classification scenario.'):
            rai_insights.counterfactual.add(
                total_CFs=10,
                method='random',
                desired_class='opposite')

    def test_feature_importance_with_less_counterfactuals(self):
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_iris_data()
        model = create_lightgbm_classifier(X_train, y_train)
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        rai_insights = RAIInsights(
            model=model,
            train=X_train,
            test=X_test,
            target_column=TARGET,
            task_type='classification')

        with pytest.raises(
                UserConfigValidationException,
                match="A total_CFs value of at least 10 is required to "
                      "use counterfactual feature importances. "
                      "Either increase total_CFs to at least 10 or "
                      "set feature_importance to False."):
            rai_insights.counterfactual.add(
                total_CFs=5,
                method='random',
                desired_class=2)

    def test_eval_data_having_new_categories(self):
        train_data = pd.DataFrame(
            data=[[1, 2, 0],
                  [2, 3, 1],
                  [3, 3, 0]],
            columns=['c1', 'c2', TARGET]
        )
        test_data = pd.DataFrame(
            data=[[1, 1, 0]],
            columns=['c1', 'c2', TARGET]
        )

        X_train = train_data.drop([TARGET], axis=1)
        y_train = train_data[TARGET]
        model = create_lightgbm_classifier(X_train, y_train)

        rai_insights = RAIInsights(
            model=model,
            train=train_data,
            test=test_data,
            target_column=TARGET,
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
            rai_insights.counterfactual.add(
                total_CFs=10,
                method='random',
                desired_class='opposite')

    def test_weird_predict_function(self):
        X_train, X_test, y_train, y_test, _, _ = create_iris_data()

        # A weird model that modifies the input dataset by
        # adding back the target column
        class WeirdModelPredictWrapper():
            def __init__(self, model):
                self.model = model

            def predict(self, test_data_pandas):
                if TARGET not in test_data_pandas.columns:
                    test_data_pandas[TARGET] = 0
                return self.model.predict(
                    test_data_pandas.drop(columns=TARGET))

            def predict_proba(self, test_data_pandas):
                return self.model.predict_proba(test_data_pandas)

        model = create_lightgbm_classifier(X_train, y_train)
        model = WeirdModelPredictWrapper(model)
        X_train = X_train.copy()
        X_test = X_test.copy()
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        message = ('Calling model predict function modifies '
                   'input dataset features. Please check if '
                   'predict function is defined correctly.')
        with pytest.raises(
                UserConfigValidationException, match=message):
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification')

    def test_weird_predict_proba_function(self):
        X_train, X_test, y_train, y_test, _, _ = create_iris_data()

        # A weird model that modifies the input dataset by
        # adding back the target column
        class WeirdModelPredictProbaWrapper():
            def __init__(self, model):
                self.model = model

            def predict(self, test_data_pandas):
                return self.model.predict(test_data_pandas)

            def predict_proba(self, test_data_pandas):
                if TARGET not in test_data_pandas.columns:
                    test_data_pandas[TARGET] = 0
                return self.model.predict_proba(
                    test_data_pandas.drop(columns=TARGET))

        model = create_lightgbm_classifier(X_train, y_train)
        model = WeirdModelPredictProbaWrapper(model)
        X_train = X_train.copy()
        X_test = X_test.copy()
        X_train[TARGET] = y_train
        X_test[TARGET] = y_test

        message = ('Calling model predict_proba function modifies '
                   'input dataset features. Please check if '
                   'predict function is defined correctly.')
        with pytest.raises(
                UserConfigValidationException, match=message):
            RAIInsights(
                model=model,
                train=X_train,
                test=X_test,
                target_column=TARGET,
                task_type='classification')
