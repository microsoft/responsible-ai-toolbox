# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
from common_utils import (create_iris_data, create_simple_titanic_data,
                          create_sklearn_svm_classifier,
                          create_titanic_pipeline)

from erroranalysis._internal.cohort_filter import filter_from_cohort
from erroranalysis._internal.constants import ROW_INDEX, TRUE_Y, ModelTask
from erroranalysis._internal.error_analyzer import ModelAnalyzer

TOL = 1e-10
SEPAL_WIDTH = 'sepal width'
EMBARKED = 'embarked'


class TestCohortFilter(object):

    def test_cohort_filter_equal(self):
        X_train, X_test, y_train, y_test, feature_names = create_iris_pandas()
        filters = [{'arg': [2.8],
                    'column': SEPAL_WIDTH,
                    'method': 'equal'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] == 2.8]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_error_analyzer(validation_data,
                           model,
                           X_test,
                           y_test,
                           feature_names,
                           categorical_features,
                           model_task,
                           filters=filters)

    def test_cohort_filter_less(self):
        X_train, X_test, y_train, y_test, feature_names = create_iris_pandas()
        filters = [{'arg': [2.8],
                    'column': SEPAL_WIDTH,
                    'method': 'less'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] < 2.8]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_error_analyzer(validation_data,
                           model,
                           X_test,
                           y_test,
                           feature_names,
                           categorical_features,
                           model_task,
                           filters=filters)

    def test_cohort_filter_less_and_equal(self):
        X_train, X_test, y_train, y_test, feature_names = create_iris_pandas()

        filters = [{'arg': [2.8],
                    'column': SEPAL_WIDTH,
                    'method': 'less and equal'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] <= 2.8]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_error_analyzer(validation_data,
                           model,
                           X_test,
                           y_test,
                           feature_names,
                           categorical_features,
                           model_task,
                           filters=filters)

    def test_cohort_filter_greater(self):
        X_train, X_test, y_train, y_test, feature_names = create_iris_pandas()
        filters = [{'arg': [2.8],
                    'column': SEPAL_WIDTH,
                    'method': 'greater'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] > 2.8]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_error_analyzer(validation_data,
                           model,
                           X_test,
                           y_test,
                           feature_names,
                           categorical_features,
                           model_task,
                           filters=filters)

    def test_cohort_filter_greater_and_equal(self):
        X_train, X_test, y_train, y_test, feature_names = create_iris_pandas()
        filters = [{'arg': [2.8],
                    'column': SEPAL_WIDTH,
                    'method': 'greater and equal'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] >= 2.8]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_error_analyzer(validation_data,
                           model,
                           X_test,
                           y_test,
                           feature_names,
                           categorical_features,
                           model_task,
                           filters=filters)

    def test_cohort_filter_in_the_range_of(self):
        X_train, X_test, y_train, y_test, feature_names = create_iris_pandas()
        filters = [{'arg': [2.8, 3.4],
                    'column': SEPAL_WIDTH,
                    'method': 'in the range of'}]
        validation_data = create_validation_data(X_test, y_test)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] >= 2.8]
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] <= 3.4]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)
        categorical_features = []
        run_error_analyzer(validation_data,
                           model,
                           X_test,
                           y_test,
                           feature_names,
                           categorical_features,
                           model_task,
                           filters=filters)

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
        run_error_analyzer(validation_data,
                           clf,
                           X_test,
                           y_test,
                           feature_names,
                           categorical_features,
                           model_task,
                           filters=filters)


def create_iris_pandas():
    X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

    X_train = pd.DataFrame(X_train, columns=feature_names)
    X_test = pd.DataFrame(X_test, columns=feature_names)

    return X_train, X_test, y_train, y_test, feature_names


def create_validation_data(X_test, y_test):
    validation_data = X_test.copy()
    validation_data[TRUE_Y] = y_test
    validation_data[ROW_INDEX] = np.arange(0, len(y_test))
    return validation_data


def run_error_analyzer(validation_data,
                       model,
                       X_test,
                       y_test,
                       feature_names,
                       categorical_features,
                       model_task,
                       filters=None,
                       composite_filters=None):
    error_analyzer = ModelAnalyzer(model,
                                   X_test,
                                   y_test,
                                   feature_names,
                                   categorical_features,
                                   model_task=model_task)
    filtered_data = filter_from_cohort(X_test,
                                       filters,
                                       composite_filters,
                                       feature_names,
                                       y_test,
                                       categorical_features,
                                       error_analyzer.categories)
    # validate there is some data selected for each of the filters
    assert validation_data.shape[0] > 0
    assert validation_data.equals(filtered_data)
