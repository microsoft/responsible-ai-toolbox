# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.matrix_filter import (
    CATEGORY1, CATEGORY2, COUNT, FALSE_COUNT, MATRIX,
    VALUES, METRIC_NAME, METRIC_VALUE)
from erroranalysis._internal.cohort_filter import filter_from_cohort
from common_utils import (
    create_boston_data, create_iris_data, create_cancer_data,
    create_simple_titanic_data, create_titanic_pipeline,
    create_binary_classification_dataset,
    create_models_classification,
    create_models_regression)
from erroranalysis._internal.constants import (
    ModelTask, TRUE_Y, ROW_INDEX, Metrics, metric_to_display_name)
from erroranalysis._internal.metrics import metric_to_func

TOLERANCE = 1e-5


class TestMatrixFilter(object):

    def test_matrix_filter_iris(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task)

    def test_matrix_filter_iris_filters(self):
        # Validate the shift cohort functionality where base
        # cohort was chosen in tree view
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        filters = [{'arg': [2.85],
                    'column': feature_names[1],
                    'method': 'less and equal'}]

        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names,
                                     model_task, filters=filters)

    def test_matrix_filter_iris_filters_pandas(self):
        # Validate the shift cohort functionality where base
        # cohort was chosen in tree view
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)

        filters = [{'arg': [2.85],
                    'column': feature_names[1],
                    'method': 'less and equal'}]

        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names,
                                     model_task, filters=filters)

    def test_matrix_filter_cancer(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names,
                                     model_task)

    def test_matrix_filter_cancer_filters(self):
        # Validate the shift cohort functionality where base
        # cohort was chosen in matrix view
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        composite_filters = [{'compositeFilters':
                             [{'compositeFilters':
                              [{'arg': [11.364, 13.182],
                                'column': 'mean radius',
                                'method': 'in the range of'}],
                               'operation': 'and'},
                              {'compositeFilters':
                               [{'arg': [13.182, 15],
                                 'column': 'mean radius',
                                 'method': 'in the range of'}],
                               'operation': 'and'},
                              {'compositeFilters':
                               [{'arg': [15, 16.817],
                                 'column': 'mean radius',
                                 'method': 'in the range of'}],
                               'operation': 'and'},
                              {'compositeFilters':
                               [{'arg': [16.817, 18.635],
                                 'column': 'mean radius',
                                 'method': 'in the range of'}],
                               'operation': 'and'}],
                             'operation': 'or'}]

        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task,
                                     composite_filters=composite_filters)

    def test_matrix_filter_binary_classification(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()
        feature_names = list(X_train.columns)
        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task)

    def test_matrix_filter_titanic(self):
        X_train, X_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        feature_names = categorical + numeric
        clf = create_titanic_pipeline(X_train, y_train)
        categorical_features = categorical
        run_error_analyzer(clf, X_test, y_test, feature_names,
                           categorical_features,
                           model_task=ModelTask.CLASSIFICATION)

    def test_matrix_filter_boston(self):
        X_train, X_test, y_train, y_test, feature_names = create_boston_data()

        model_task = ModelTask.REGRESSION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task)

    def test_matrix_filter_boston_filters(self):
        X_train, X_test, y_train, y_test, feature_names = create_boston_data()

        filters = [{'arg': [0.675],
                    'column': 'NOX',
                    'method': 'less and equal'},
                   {'arg': [7.141000000000001],
                    'column': 'RM',
                    'method': 'greater'}]

        model_task = ModelTask.REGRESSION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names,
                                     model_task, filters=filters)


def run_error_analyzer_on_models(X_train,
                                 y_train,
                                 X_test,
                                 y_test,
                                 feature_names,
                                 model_task,
                                 filters=None,
                                 composite_filters=None):
    if model_task == ModelTask.CLASSIFICATION:
        models = create_models_classification(X_train, y_train)
    else:
        models = create_models_regression(X_train, y_train)

    for model in models:
        categorical_features = []
        run_error_analyzer(model, X_test, y_test, feature_names,
                           categorical_features, model_task=model_task,
                           filters=filters,
                           composite_filters=composite_filters)


def run_error_analyzer(model,
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
    # features, filters, composite_filters
    features = [feature_names[0], feature_names[1]]
    json_matrix = error_analyzer.compute_matrix(features, filters,
                                                composite_filters)
    validation_data = X_test
    if filters is not None or composite_filters is not None:
        validation_data = filter_from_cohort(X_test,
                                             filters,
                                             composite_filters,
                                             feature_names,
                                             y_test,
                                             categorical_features,
                                             error_analyzer.categories)
        y_test = validation_data[TRUE_Y]
        validation_data = validation_data.drop(columns=[TRUE_Y, ROW_INDEX])
        if not isinstance(X_test, pd.DataFrame):
            validation_data = validation_data.values
    expected_count = len(validation_data)
    metric = error_analyzer.metric
    if metric == Metrics.ERROR_RATE:
        expected_error = sum(model.predict(validation_data) != y_test)
    elif metric == Metrics.MEAN_SQUARED_ERROR:
        func = metric_to_func[metric]
        expected_error = func(model.predict(validation_data), y_test)
    else:
        raise NotImplementedError(
            "Metric {} validation not supported yet".format(metric))
    validate_matrix(json_matrix,
                    expected_count,
                    expected_error,
                    metric=metric)


def validate_matrix(json_matrix, exp_total_count,
                    exp_total_error,
                    metric=Metrics.ERROR_RATE):
    assert MATRIX in json_matrix
    assert CATEGORY1 in json_matrix
    assert CATEGORY2 in json_matrix
    num_cat1 = len(json_matrix[CATEGORY1][VALUES])
    num_cat2 = len(json_matrix[CATEGORY2][VALUES])
    assert len(json_matrix[MATRIX]) == num_cat1
    assert len(json_matrix[MATRIX][0]) == num_cat2
    validate_matrix_metric(json_matrix, exp_total_count,
                           exp_total_error, metric,
                           num_cat1, num_cat2)


def validate_matrix_metric(json_matrix, exp_total_count,
                           exp_total_error, metric,
                           num_cat1, num_cat2):
    if metric == Metrics.ERROR_RATE:
        # take sum of count, false count
        total_count = 0
        total_false_count = 0
        for i in range(num_cat1):
            for j in range(num_cat2):
                total_count += json_matrix[MATRIX][i][j][COUNT]
                total_false_count += json_matrix[MATRIX][i][j][FALSE_COUNT]
        assert exp_total_count == total_count
        assert exp_total_error == total_false_count
    elif metric == Metrics.MEAN_SQUARED_ERROR:
        # take sum of count, metric value
        total_count = 0
        total_metric_value = 0
        for i in range(num_cat1):
            for j in range(num_cat2):
                count = json_matrix[MATRIX][i][j][COUNT]
                total_count += count
                cell_value = json_matrix[MATRIX][i][j][METRIC_VALUE] * count
                total_metric_value += cell_value
                metric_name = json_matrix[MATRIX][i][j][METRIC_NAME]
                assert metric_name == metric_to_display_name[metric]
        total_metric_value = total_metric_value / total_count
        assert exp_total_count == total_count
        assert abs(exp_total_error - total_metric_value) < TOLERANCE
    else:
        raise NotImplementedError(
            "Metric {} validation not supported yet".format(metric))
