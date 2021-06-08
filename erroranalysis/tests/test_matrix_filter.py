# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.matrix_filter import (
    CATEGORY1, CATEGORY2, COUNT, FALSE_COUNT, MATRIX, VALUES)
from common_utils import (
    create_iris_data, create_cancer_data, create_simple_titanic_data,
    create_titanic_pipeline, create_binary_classification_dataset,
    create_models)
from erroranalysis._internal.constants import ModelTask


class TestMatrixFilter(object):

    def test_matrix_filter_iris(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        models = create_models(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features,
                               model_task=ModelTask.CLASSIFICATION)

    def test_matrix_filter_cancer(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        models = create_models(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features,
                               model_task=ModelTask.CLASSIFICATION)

    def test_matrix_filter_binary_classification(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()
        feature_names = list(X_train.columns)
        models = create_models(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features,
                               model_task=ModelTask.CLASSIFICATION)

    def test_matrix_filter_titanic(self):
        X_train, X_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        feature_names = categorical + numeric
        clf = create_titanic_pipeline(X_train, y_train)
        categorical_features = categorical
        run_error_analyzer(clf, X_test, y_test, feature_names,
                           categorical_features,
                           model_task=ModelTask.CLASSIFICATION)


def run_error_analyzer(model,
                       X_test,
                       y_test,
                       feature_names,
                       categorical_features,
                       model_task):
    error_analyzer = ModelAnalyzer(model,
                                   X_test,
                                   y_test,
                                   feature_names,
                                   categorical_features,
                                   model_task=model_task)
    # features, filters, composite_filters
    features = [feature_names[0], feature_names[1]]
    filters = None
    composite_filters = None
    json_matrix = error_analyzer.compute_matrix(features, filters,
                                                composite_filters)
    expected_count = len(X_test)
    expected_false_count = sum(model.predict(X_test) != y_test)
    validate_matrix(json_matrix, expected_count, expected_false_count)


def validate_matrix(json_matrix, exp_total_count, exp_total_false_count):
    assert MATRIX in json_matrix
    assert CATEGORY1 in json_matrix
    assert CATEGORY2 in json_matrix
    num_cat1 = len(json_matrix[CATEGORY1][VALUES])
    num_cat2 = len(json_matrix[CATEGORY2][VALUES])
    assert len(json_matrix[MATRIX]) == num_cat1
    assert len(json_matrix[MATRIX][0]) == num_cat2
    # take sum of count, false count
    total_count = 0
    total_false_count = 0
    for i in range(num_cat1):
        for j in range(num_cat2):
            total_count += json_matrix[MATRIX][i][j][COUNT]
            total_false_count += json_matrix[MATRIX][i][j][FALSE_COUNT]
    assert exp_total_count == total_count
    assert exp_total_false_count == total_false_count
