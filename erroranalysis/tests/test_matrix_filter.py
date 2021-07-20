# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
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
    ModelTask, TRUE_Y, ROW_INDEX, MatrixParams, Metrics,
    metric_to_display_name)
from erroranalysis._internal.metrics import metric_to_func

TOLERANCE = 1e-5
BIN_THRESHOLD = MatrixParams.BIN_THRESHOLD


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

    def test_matrix_filter_iris_quantile_binning(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names,
                                     model_task,
                                     quantile_binning=True)

    def test_matrix_filter_iris_num_bins(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        model_task = ModelTask.CLASSIFICATION
        num_bins_list = [2, 4, 10, 12]
        for num_bins in num_bins_list:
            run_error_analyzer_on_models(X_train, y_train, X_test,
                                         y_test, feature_names,
                                         model_task,
                                         num_bins=num_bins)

    def test_matrix_filter_iris_invalid_num_bins(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        model_task = ModelTask.CLASSIFICATION
        invalid_num_bins_list = [-10, -1, 0]
        err = 'Number of bins parameter must be greater than 0 for the heatmap'
        for num_bins in invalid_num_bins_list:
            with pytest.raises(ValueError, match=err):
                run_error_analyzer_on_models(X_train, y_train, X_test,
                                             y_test, feature_names,
                                             model_task,
                                             num_bins=num_bins)

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

        # Test with single feature instead of two features
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task,
                                     matrix_features=[feature_names[0]])

        # Note: Third feature has few unique values, tests code path
        # without binning data
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task,
                                     matrix_features=[feature_names[3]])

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
                                 composite_filters=None,
                                 matrix_features=None,
                                 quantile_binning=False,
                                 num_bins=BIN_THRESHOLD):
    if model_task == ModelTask.CLASSIFICATION:
        models = create_models_classification(X_train, y_train)
    else:
        models = create_models_regression(X_train, y_train)

    for model in models:
        categorical_features = []
        run_error_analyzer(model, X_test, y_test, feature_names,
                           categorical_features, model_task=model_task,
                           filters=filters,
                           composite_filters=composite_filters,
                           matrix_features=matrix_features,
                           quantile_binning=quantile_binning,
                           num_bins=num_bins)


def run_error_analyzer(model,
                       X_test,
                       y_test,
                       feature_names,
                       categorical_features,
                       model_task,
                       filters=None,
                       composite_filters=None,
                       matrix_features=None,
                       quantile_binning=False,
                       num_bins=BIN_THRESHOLD):
    error_analyzer = ModelAnalyzer(model,
                                   X_test,
                                   y_test,
                                   feature_names,
                                   categorical_features,
                                   model_task=model_task)
    # features, filters, composite_filters
    if matrix_features is None:
        features = [feature_names[0], feature_names[1]]
    else:
        features = matrix_features
    matrix = error_analyzer.compute_matrix(features,
                                           filters,
                                           composite_filters,
                                           quantile_binning=quantile_binning,
                                           num_bins=num_bins)
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
        pred_y = model.predict(validation_data)
        expected_error = func(y_test, pred_y)
    else:
        raise NotImplementedError(
            "Metric {} validation not supported yet".format(metric))
    validate_matrix(matrix,
                    expected_count,
                    expected_error,
                    features,
                    metric=metric)


def validate_matrix(matrix, exp_total_count,
                    exp_total_error,
                    features,
                    metric=Metrics.ERROR_RATE):
    assert MATRIX in matrix
    assert CATEGORY1 in matrix
    num_cat1 = len(matrix[CATEGORY1][VALUES])
    if len(features) == 2:
        assert len(matrix[MATRIX]) == num_cat1
        assert CATEGORY2 in matrix
        num_cat2 = len(matrix[CATEGORY2][VALUES])
        assert len(matrix[MATRIX][0]) == num_cat2
        validate_matrix_metric(matrix, exp_total_count,
                               exp_total_error, metric,
                               num_cat1, num_cat2)
    else:
        assert len(matrix[MATRIX][0]) == num_cat1
        assert len(matrix[MATRIX]) == 1
        validate_matrix_metric(matrix, exp_total_count,
                               exp_total_error, metric,
                               1, num_cat1)


def validate_matrix_metric(matrix, exp_total_count,
                           exp_total_error, metric,
                           num_cat1, num_cat2):
    if metric == Metrics.ERROR_RATE:
        # take sum of count, false count
        total_count = 0
        total_false_count = 0
        for i in range(num_cat1):
            for j in range(num_cat2):
                total_count += matrix[MATRIX][i][j][COUNT]
                total_false_count += matrix[MATRIX][i][j][FALSE_COUNT]
        assert exp_total_count == total_count
        assert exp_total_error == total_false_count
    elif metric == Metrics.MEAN_SQUARED_ERROR:
        # take sum of count, metric value
        total_count = 0
        total_metric_value = 0
        for i in range(num_cat1):
            for j in range(num_cat2):
                count = matrix[MATRIX][i][j][COUNT]
                total_count += count
                cell_value = matrix[MATRIX][i][j][METRIC_VALUE] * count
                total_metric_value += cell_value
                metric_name = matrix[MATRIX][i][j][METRIC_NAME]
                assert metric_name == metric_to_display_name[metric]
        total_metric_value = total_metric_value / total_count
        assert exp_total_count == total_count
        assert abs(exp_total_error - total_metric_value) < TOLERANCE
    else:
        raise NotImplementedError(
            "Metric {} validation not supported yet".format(metric))
