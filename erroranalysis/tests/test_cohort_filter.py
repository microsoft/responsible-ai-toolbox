# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.cohort_filter import filter_from_cohort
from erroranalysis._internal.constants import (ARG, COLUMN, METHOD, PRED_Y,
                                               ROW_INDEX, TRUE_Y, ModelTask)
from erroranalysis._internal.error_analyzer import (ModelAnalyzer,
                                                    PredictionsAnalyzer)
from rai_test_utils.datasets.tabular import (create_diabetes_data,
                                             create_iris_data,
                                             create_simple_titanic_data)
from rai_test_utils.models.sklearn import (
    create_sklearn_random_forest_regressor, create_sklearn_svm_classifier,
    create_titanic_pipeline)
from raiutils.cohort import CohortFilterMethods

TOL = 1e-10
SEPAL_WIDTH = 'sepal width'
EMBARKED = 'embarked'
CLASSIFICATION_OUTCOME = 'Classification outcome'
REGRESSION_ERROR = 'Regression error'


class TestCohortFilter(object):

    def test_cohort_filter_equal(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{ARG: [2.8],
                    COLUMN: SEPAL_WIDTH,
                    METHOD: CohortFilterMethods.METHOD_EQUAL}]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)

        y_pred = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, y_pred)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] == 2.8]

        model_task = ModelTask.CLASSIFICATION
        categorical_features = []
        run_different_error_analyzers(validation_data,
                                      model,
                                      X_test,
                                      y_test,
                                      feature_names,
                                      categorical_features,
                                      model_task,
                                      filters=filters)

    def test_cohort_filter_predicted_y(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{'arg': [2],
                    'column': 'Predicted Y',
                    'method': 'includes'}]
        model = create_sklearn_svm_classifier(X_train, y_train)

        y_pred = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, y_pred)
        validation_data = validation_data.loc[y_test == 2]

        model_task = ModelTask.CLASSIFICATION
        categorical_features = []
        run_different_error_analyzers(validation_data,
                                      model,
                                      X_test,
                                      y_test,
                                      feature_names,
                                      categorical_features,
                                      model_task,
                                      filters=filters)

    def test_cohort_filter_true_y(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{'arg': [2],
                    'column': 'True Y',
                    'method': 'includes'}]
        model = create_sklearn_svm_classifier(X_train, y_train)

        y_pred = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, y_pred)
        validation_data = validation_data.loc[y_test == 2]

        model_task = ModelTask.CLASSIFICATION
        categorical_features = []
        run_different_error_analyzers(validation_data,
                                      model,
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
        model = create_sklearn_svm_classifier(X_train, y_train)

        y_pred = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, y_pred)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] < 2.8]

        model_task = ModelTask.CLASSIFICATION
        categorical_features = []
        run_different_error_analyzers(validation_data,
                                      model,
                                      X_test,
                                      y_test,
                                      feature_names,
                                      categorical_features,
                                      model_task,
                                      filters=filters)

    def test_cohort_filter_less_and_equal(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()

        filters = [{ARG: [2.8],
                    COLUMN: SEPAL_WIDTH,
                    METHOD: CohortFilterMethods.METHOD_LESS_AND_EQUAL}]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)

        y_pred = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, y_pred)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] <= 2.8]

        model_task = ModelTask.CLASSIFICATION
        categorical_features = []
        run_different_error_analyzers(validation_data,
                                      model,
                                      X_test,
                                      y_test,
                                      feature_names,
                                      categorical_features,
                                      model_task,
                                      filters=filters)

    def test_cohort_filter_greater(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{ARG: [2.8],
                    COLUMN: SEPAL_WIDTH,
                    METHOD: CohortFilterMethods.METHOD_GREATER}]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)

        y_pred = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, y_pred)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] > 2.8]

        model_task = ModelTask.CLASSIFICATION
        categorical_features = []
        run_different_error_analyzers(validation_data,
                                      model,
                                      X_test,
                                      y_test,
                                      feature_names,
                                      categorical_features,
                                      model_task,
                                      filters=filters)

    def test_cohort_filter_greater_and_equal(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{ARG: [2.8],
                    COLUMN: SEPAL_WIDTH,
                    METHOD: CohortFilterMethods.METHOD_GREATER_AND_EQUAL}]
        model_task = ModelTask.CLASSIFICATION
        model = create_sklearn_svm_classifier(X_train, y_train)

        y_pred = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, y_pred)
        validation_data = validation_data.loc[X_test[SEPAL_WIDTH] >= 2.8]

        model_task = ModelTask.CLASSIFICATION
        categorical_features = []
        run_different_error_analyzers(validation_data,
                                      model,
                                      X_test,
                                      y_test,
                                      feature_names,
                                      categorical_features,
                                      model_task,
                                      filters=filters)

    def test_cohort_filter_in_the_range_of(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_iris_pandas()
        filters = [{ARG: [2.8, 3.4],
                    COLUMN: SEPAL_WIDTH,
                    METHOD: CohortFilterMethods.METHOD_RANGE}]
        model = create_sklearn_svm_classifier(X_train, y_train)

        y_pred = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, y_pred)
        validation_data = validation_data.loc[
            (X_test[SEPAL_WIDTH] <= 3.4) & (X_test[SEPAL_WIDTH] >= 2.8)]

        model_task = ModelTask.CLASSIFICATION
        categorical_features = []
        run_different_error_analyzers(validation_data,
                                      model,
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
        filters = [{ARG: arg,
                    COLUMN: CLASSIFICATION_OUTCOME,
                    METHOD: CohortFilterMethods.METHOD_INCLUDES}]
        pred_y = model.predict(X_test)

        validation_data = create_validation_data(X_test, y_test, pred_y)
        if correct_prediction:
            validation_filter = validation_data[PRED_Y] == validation_data[
                TRUE_Y]
        else:
            validation_filter = validation_data[PRED_Y] != validation_data[
                TRUE_Y]
        validation_data = validation_data.loc[validation_filter]

        model_task = ModelTask.CLASSIFICATION
        run_different_error_analyzers(
            validation_data,
            model,
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
        clf = create_titanic_pipeline(X_train, y_train)

        # the indexes 0, 2 correspond to S, C
        filters = [{ARG: [0, 2],
                    COLUMN: EMBARKED,
                    METHOD: CohortFilterMethods.METHOD_INCLUDES}]
        pred_y = clf.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, pred_y)
        filter_embarked = X_test[EMBARKED].isin(['S', 'C'])
        validation_data = validation_data.loc[filter_embarked]

        model_task = ModelTask.CLASSIFICATION
        feature_names = categorical + numeric
        categorical_features = categorical
        run_different_error_analyzers(validation_data,
                                      clf,
                                      X_test,
                                      y_test,
                                      feature_names,
                                      categorical_features,
                                      model_task,
                                      filters=filters)

    def test_cohort_filter_excludes(self):
        X_train, X_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        clf = create_titanic_pipeline(X_train, y_train)

        # the indexes other than 0, 2 correspond to Q
        filters = [{ARG: [0, 2],
                    COLUMN: EMBARKED,
                    METHOD: CohortFilterMethods.METHOD_EXCLUDES}]
        pred_y = clf.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, pred_y)
        filter_embarked = X_test[EMBARKED].isin(['Q'])
        validation_data = validation_data.loc[filter_embarked]

        model_task = ModelTask.CLASSIFICATION
        feature_names = categorical + numeric
        categorical_features = categorical
        run_different_error_analyzers(validation_data,
                                      clf,
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
        clf = create_titanic_pipeline(X_train, y_train)

        # the indexes 1, 2 correspond to false positives and false negatives
        # the indexes 0, 3 correspond to true positives and true negatives
        filters = [{ARG: arg,
                    COLUMN: CLASSIFICATION_OUTCOME,
                    METHOD: CohortFilterMethods.METHOD_INCLUDES}]
        pred_y = clf.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, pred_y)
        if not outcome:
            validation_filter = validation_data[PRED_Y] != validation_data[
                TRUE_Y]
        else:
            validation_filter = validation_data[PRED_Y] == validation_data[
                TRUE_Y]
        validation_data = validation_data.loc[validation_filter]

        model_task = ModelTask.CLASSIFICATION
        feature_names = categorical + numeric
        categorical_features = categorical
        run_different_error_analyzers(validation_data,
                                      clf,
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
        filters = [{ARG: [40],
                    COLUMN: ROW_INDEX,
                    METHOD: CohortFilterMethods.METHOD_LESS_AND_EQUAL}]
        model = create_sklearn_svm_classifier(X_train, y_train)

        pred_y = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, pred_y)
        validation_data = validation_data.loc[validation_data[ROW_INDEX] <= 40]

        model_task = ModelTask.CLASSIFICATION
        categorical_features = []
        run_different_error_analyzers(validation_data,
                                      model,
                                      X_test,
                                      y_test,
                                      feature_names,
                                      categorical_features,
                                      model_task,
                                      filters=filters)

    def test_cohort_filter_regression_error(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_diabetes_data()
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        model = create_sklearn_random_forest_regressor(X_train, y_train)

        # filter on regression error, which can be done from the
        # RAI dashboard
        filters = [{ARG: [40],
                    COLUMN: REGRESSION_ERROR,
                    METHOD: CohortFilterMethods.METHOD_LESS_AND_EQUAL}]

        pred_y = model.predict(X_test)
        validation_data = create_validation_data(X_test, y_test, pred_y)
        validation_filter = abs(validation_data[PRED_Y] - validation_data[
            TRUE_Y]) <= 40.0
        validation_data = validation_data.loc[validation_filter]

        model_task = ModelTask.REGRESSION
        categorical_features = []
        run_different_error_analyzers(validation_data,
                                      model,
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


def create_validation_data(X_test, y_test, pred_y):
    validation_data = X_test.copy()
    validation_data[TRUE_Y] = y_test
    validation_data[ROW_INDEX] = np.arange(0, len(y_test))
    validation_data[PRED_Y] = pred_y
    return validation_data


def run_different_error_analyzers(validation_data,
                                  model,
                                  X_test,
                                  y_test,
                                  feature_names,
                                  categorical_features,
                                  model_task,
                                  filters=None,
                                  composite_filters=None,
                                  is_empty_validation_data=False):
    run_error_analyzer(validation_data,
                       model,
                       X_test,
                       y_test,
                       feature_names,
                       categorical_features,
                       model_task,
                       filters=filters,
                       composite_filters=composite_filters,
                       is_empty_validation_data=is_empty_validation_data)

    run_prediction_analyzer(validation_data,
                            model,
                            X_test,
                            y_test,
                            feature_names,
                            categorical_features,
                            model_task,
                            filters=filters,
                            composite_filters=composite_filters,
                            is_empty_validation_data=is_empty_validation_data)


def run_error_analyzer(validation_data,
                       model,
                       X_test,
                       y_test,
                       feature_names,
                       categorical_features,
                       model_task,
                       filters=None,
                       composite_filters=None,
                       is_empty_validation_data=False,
                       classes=None):
    error_analyzer = ModelAnalyzer(model,
                                   X_test,
                                   y_test,
                                   feature_names,
                                   categorical_features,
                                   model_task=model_task)

    filtered_data = filter_from_cohort(error_analyzer,
                                       filters,
                                       composite_filters)

    # validate there is some data selected for each of the filters
    if is_empty_validation_data:
        assert validation_data.shape[0] == 0
    else:
        assert validation_data.shape[0] > 0
    assert validation_data.equals(filtered_data)


def run_prediction_analyzer(validation_data,
                            model,
                            X_test,
                            y_test,
                            feature_names,
                            categorical_features,
                            model_task,
                            filters=None,
                            composite_filters=None,
                            is_empty_validation_data=False):

    y_pred = model.predict(X_test)
    error_analyzer = PredictionsAnalyzer(y_pred,
                                         X_test,
                                         y_test,
                                         feature_names,
                                         categorical_features,
                                         model_task=model_task)
    filtered_data = filter_from_cohort(error_analyzer,
                                       filters,
                                       composite_filters)

    # validate there is some data selected for each of the filters
    if is_empty_validation_data:
        assert validation_data.shape[0] == 0
    else:
        assert validation_data.shape[0] > 0
    assert validation_data.equals(filtered_data)
