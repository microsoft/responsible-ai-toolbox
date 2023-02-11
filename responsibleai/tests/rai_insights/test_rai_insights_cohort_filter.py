# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest
from tests.common_utils import create_iris_data

from erroranalysis._internal.constants import (PRED_Y, ROW_INDEX, TRUE_Y,
                                               ModelTask)
from rai_test_utils.datasets.tabular import (create_housing_data,
                                             create_simple_titanic_data)
from rai_test_utils.models.sklearn import (
    create_sklearn_random_forest_regressor, create_sklearn_svm_classifier,
    create_titanic_pipeline)
from responsibleai.rai_insights import RAIInsights

TOL = 1e-10
SEPAL_WIDTH = 'sepal width'
EMBARKED = 'embarked'
CLASSIFICATION_OUTCOME = 'Classification outcome'
REGRESSION_ERROR = 'Regression error'


class TestCohortFilterRAIInsights(object):
    def test_cohort_filter_equal(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{'arg': [2.8],
                    'column': SEPAL_WIDTH,
                    'method': 'equal'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] == 2.8]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_rai_insights(validation_data,
                         model,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    @pytest.mark.parametrize('use_str_labels', [True, False])
    @pytest.mark.parametrize('target_type', ['Predicted Y', 'True Y'])
    def test_cohort_filter_target(self, target_type, use_str_labels):
        if target_type == 'Predicted Y':
            pytest.skip("Skipping this test due to a bug condition "
                        "in Predicted Y cohort filtering")
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_iris_pandas(use_str_labels)
        filters = [{'arg': [2],
                    'column': target_type,
                    'method': 'includes'}]
        validation_data = create_validation_data(X_test, y_test)
        if use_str_labels:
            validation_filter = y_test == classes[2]
        else:
            validation_filter = y_test == 2
        validation_data = validation_data.loc[validation_filter]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_rai_insights(validation_data,
                         model,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    def test_cohort_filter_less(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{'arg': [2.8],
                    'column': SEPAL_WIDTH,
                    'method': 'less'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] < 2.8]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_rai_insights(validation_data,
                         model,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    def test_cohort_filter_less_and_equal(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()

        filters = [{'arg': [2.8],
                    'column': SEPAL_WIDTH,
                    'method': 'less and equal'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] <= 2.8]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_rai_insights(validation_data,
                         model,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    def test_cohort_filter_greater(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{'arg': [2.8],
                    'column': SEPAL_WIDTH,
                    'method': 'greater'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] > 2.8]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_rai_insights(validation_data,
                         model,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    def test_cohort_filter_greater_and_equal(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{'arg': [2.8],
                    'column': SEPAL_WIDTH,
                    'method': 'greater and equal'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] >= 2.8]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_rai_insights(validation_data,
                         model,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    def test_cohort_filter_in_the_range_of(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{'arg': [2.8, 3.4],
                    'column': SEPAL_WIDTH,
                    'method': 'in the range of'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[
            (X_test[SEPAL_WIDTH] <= 3.4) & (X_test[SEPAL_WIDTH] >= 2.8)]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_rai_insights(validation_data,
                         model,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    @pytest.mark.parametrize('arg, correct_prediction',
                             [([1], False), ([0], True)])
    def test_cohort_filter_multiclass_classification_outcome(
            self, arg, correct_prediction):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        model = create_sklearn_svm_classifier(X_train, y_train)
        model_task = ModelTask.CLASSIFICATION
        categorical_features = []

        # the index 1, corresponds to incorrect prediction
        # the index 0 correspond to correct prediction
        filters = [{'arg': arg,
                    'column': CLASSIFICATION_OUTCOME,
                    'method': 'includes'}]
        pred_y = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, pred_y)
        if correct_prediction:
            validation_filter = validation_data[PRED_Y] == validation_data[
                TRUE_Y]
        else:
            validation_filter = validation_data[PRED_Y] != validation_data[
                TRUE_Y]
        validation_data = validation_data.loc[validation_filter]
        validation_data = validation_data.drop(columns=PRED_Y)
        model_task = ModelTask.CLASSIFICATION
        run_rai_insights(validation_data,
                         model,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters,
                         is_empty_validation_data=(not correct_prediction))

    def test_cohort_filter_includes(self):
        X_train, X_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        feature_names = categorical + numeric
        clf = create_titanic_pipeline(X_train, y_train)
        categorical_features = categorical
        # the indexes 0, 2 correspond to S, C
        filters = [{'arg': [0, 2],
                    'column': EMBARKED,
                    'method': 'includes'}]
        validation_data = create_validation_data(X_test, y_test)
        filter_embarked = X_test[EMBARKED].isin(['S', 'C'])
        validation_data = validation_data.loc[filter_embarked]
        model_task = ModelTask.CLASSIFICATION
        run_rai_insights(validation_data,
                         clf,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    def test_cohort_filter_excludes(self):
        X_train, X_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        feature_names = categorical + numeric
        clf = create_titanic_pipeline(X_train, y_train)
        categorical_features = categorical
        # the indexes other than 0, 2 correspond to Q
        filters = [{'arg': [0, 2],
                    'column': EMBARKED,
                    'method': 'excludes'}]
        validation_data = create_validation_data(X_test, y_test)
        filter_embarked = X_test[EMBARKED].isin(['Q'])
        validation_data = validation_data.loc[filter_embarked]
        model_task = ModelTask.CLASSIFICATION
        run_rai_insights(validation_data,
                         clf,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    @pytest.mark.parametrize('arg, outcome', [([1, 2], False), ([0, 3], True)])
    def test_cohort_filter_binary_classification_outcome(self, arg, outcome):
        X_train, X_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        feature_names = categorical + numeric
        clf = create_titanic_pipeline(X_train, y_train)
        categorical_features = categorical
        # the indexes 1, 2 correspond to false positives and false negatives
        # the indexes 0, 3 correspond to true positives and true negatives
        filters = [{'arg': arg,
                    'column': CLASSIFICATION_OUTCOME,
                    'method': 'includes'}]
        pred_y = clf.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, pred_y)
        if not outcome:
            validation_filter = validation_data[PRED_Y] != validation_data[
                TRUE_Y]
        else:
            validation_filter = validation_data[PRED_Y] == validation_data[
                TRUE_Y]
        validation_data = validation_data.loc[validation_filter]
        validation_data = validation_data.drop(columns=PRED_Y)
        model_task = ModelTask.CLASSIFICATION
        run_rai_insights(validation_data,
                         clf,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    def test_cohort_filter_index(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        # filter on index, which can be done from the RAI dashboard
        filters = [{'arg': [40],
                    'column': ROW_INDEX,
                    'method': 'less and equal'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[validation_data[ROW_INDEX] <= 40]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        model_task = ModelTask.CLASSIFICATION
        run_rai_insights(validation_data,
                         model,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)

    def test_cohort_filter_regression_error(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_housing_data()
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)

        # filter on regression error, which can be done from the
        # RAI dashboard
        filters = [{'arg': [40],
                    'column': REGRESSION_ERROR,
                    'method': 'less and equal'}]

        model = create_sklearn_random_forest_regressor(X_train, y_train)
        pred_y = model.predict(X_test)

        validation_data = create_validation_data(X_test, y_test, pred_y)
        validation_filter = abs(validation_data[PRED_Y] - validation_data[
            TRUE_Y]) <= 40.0
        validation_data = validation_data.loc[validation_filter]
        validation_data = validation_data.drop(columns=PRED_Y)

        model_task = ModelTask.REGRESSION
        categorical_features = []
        run_rai_insights(validation_data,
                         model,
                         X_train,
                         y_train,
                         X_test,
                         y_test,
                         feature_names,
                         categorical_features,
                         model_task,
                         filters=filters)


def create_iris_pandas(use_str_labels=False):
    X_train, X_test, y_train, y_test, feature_names, classes = \
        create_iris_data()

    X_train = pd.DataFrame(X_train, columns=feature_names)
    X_test = pd.DataFrame(X_test, columns=feature_names)

    if use_str_labels:
        y_train = np.array([classes[y] for y in y_train])
        y_test = np.array([classes[y] for y in y_test])

    return X_train, X_test, y_train, y_test, feature_names, classes


def create_validation_data(X_test, y_test, pred_y=None):
    validation_data = X_test.copy()
    validation_data[TRUE_Y] = y_test
    validation_data[ROW_INDEX] = np.arange(0, len(y_test))
    if pred_y is not None:
        validation_data[PRED_Y] = pred_y
    return validation_data


def run_rai_insights(validation_data,
                     model,
                     X_train,
                     y_train,
                     X_test,
                     y_test,
                     feature_names,
                     categorical_features,
                     model_task,
                     filters=None,
                     composite_filters=None,
                     is_empty_validation_data=False):
    train = X_train.copy()
    train["target"] = y_train
    test = X_test.copy()
    test["target"] = y_test
    rai_insights = RAIInsights(
        model, train, test, "target", model_task,
        categorical_features=categorical_features)

    filtered_data = rai_insights.get_filtered_test_data(
        filters,
        composite_filters)

    # validate there is some data selected for each of the filters
    if is_empty_validation_data:
        assert validation_data.shape[0] == 0
    else:
        assert validation_data.shape[0] > 0
    assert validation_data.equals(filtered_data)
