# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
import pandas as pd
import numpy as np
from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.matrix_filter import (
    CATEGORY1, CATEGORY2, COUNT, FALSE_COUNT,
    INTERVAL_MAX, INTERVAL_MIN, MATRIX, VALUES,
    METRIC_NAME, METRIC_VALUE, TP, FP, FN)
from erroranalysis._internal.cohort_filter import filter_from_cohort
from common_utils import (
    create_adult_census_data, create_boston_data, create_iris_data,
    create_kneighbors_classifier, create_cancer_data,
    create_simple_titanic_data, create_titanic_pipeline,
    create_binary_classification_dataset,
    create_models_classification,
    create_models_regression,
    create_wine_data)
from erroranalysis._internal.constants import (
    ModelTask, TRUE_Y, ROW_INDEX, MatrixParams, Metrics,
    metric_to_display_name, precision_metrics, recall_metrics)
from erroranalysis._internal.metrics import metric_to_func, get_ordered_labels

TOLERANCE = 1e-5
BIN_THRESHOLD = MatrixParams.BIN_THRESHOLD
FLOAT64 = 'float64'


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

    @pytest.mark.parametrize('string_labels', [True, False])
    @pytest.mark.parametrize('metric', [Metrics.ERROR_RATE,
                                        Metrics.PRECISION_SCORE,
                                        Metrics.RECALL_SCORE])
    def test_matrix_filter_adult_census_quantile_binning(self,
                                                         string_labels,
                                                         metric):
        X_train, X_test, y_train, y_test, categorical_features = \
            create_adult_census_data(string_labels)

        model_task = ModelTask.CLASSIFICATION
        feature_names = X_test.columns.tolist()
        matrix_features = ['Capital Gain']
        # validate quantile binning for column with many zero values
        model = create_kneighbors_classifier(X_train, y_train)

        # validate warning printed
        err_capg = ("Removing duplicate bin edges for quantile binning of "
                    "feature Capital Gain. There are too many duplicate "
                    "values for the specified number of bins.")
        with pytest.warns(UserWarning, match=err_capg):
            run_error_analyzer(model, X_test, y_test,
                               feature_names, categorical_features,
                               model_task=model_task,
                               matrix_features=matrix_features,
                               quantile_binning=True,
                               metric=metric)
        matrix_features = ['Capital Gain', 'Capital Loss']
        err_capl = ("Removing duplicate bin edges for quantile binning of "
                    "feature Capital Loss. There are too many duplicate "
                    "values for the specified number of bins.")
        with pytest.warns(UserWarning) as warninfo:
            run_error_analyzer(model, X_test, y_test,
                               feature_names, categorical_features,
                               model_task=model_task,
                               matrix_features=matrix_features,
                               quantile_binning=True,
                               metric=metric)
        warns = {(warn.category, warn.message.args[0]) for warn in warninfo}
        expected = {
            (UserWarning, err_capg),
            (UserWarning, err_capl)
        }
        for expected_warning in expected:
            assert expected_warning in warns

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

    @pytest.mark.parametrize('metric', [Metrics.ERROR_RATE,
                                        Metrics.MACRO_PRECISION_SCORE,
                                        Metrics.MICRO_PRECISION_SCORE,
                                        Metrics.MACRO_RECALL_SCORE,
                                        Metrics.MICRO_RECALL_SCORE])
    def test_matrix_filter_wine_quantile_binning(self, metric):
        X_train, X_test, y_train, y_test, feature_names, _ = create_wine_data()

        model_task = ModelTask.CLASSIFICATION
        one_feature_matrix = [feature_names[0]]
        # validate quantile binning on wine dataset for one and two
        # features note wine dataset has some cells with zero error
        # in heatmap
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names,
                                     model_task,
                                     quantile_binning=True,
                                     matrix_features=one_feature_matrix,
                                     metric=metric)
        two_feature_matrix = [feature_names[0], feature_names[2]]
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names,
                                     model_task,
                                     quantile_binning=True,
                                     matrix_features=two_feature_matrix,
                                     metric=metric)

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

        metrics = [Metrics.MEAN_SQUARED_ERROR,
                   Metrics.MEAN_ABSOLUTE_ERROR]
        for metric in metrics:
            model_task = ModelTask.REGRESSION
            run_error_analyzer_on_models(X_train, y_train, X_test,
                                         y_test, feature_names, model_task,
                                         metric=metric)

            # Test with single feature instead of two features
            run_error_analyzer_on_models(X_train, y_train, X_test,
                                         y_test, feature_names, model_task,
                                         matrix_features=[feature_names[0]],
                                         metric=metric)

            # Note: Third feature has few unique values, tests code path
            # without binning data
            run_error_analyzer_on_models(X_train, y_train, X_test,
                                         y_test, feature_names, model_task,
                                         matrix_features=[feature_names[3]],
                                         metric=metric)

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

    def test_matrix_filter_boston_quantile_binning(self):
        # Test quantile binning on CRIM feature in boston dataset,
        # which errored out due to first category not fitting into bins
        X_train, X_test, y_train, y_test, feature_names = \
            create_boston_data(test_size=0.5)

        model_task = ModelTask.REGRESSION
        matrix_features = ['CRIM']
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task,
                                     matrix_features=matrix_features,
                                     quantile_binning=True)


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
                                 num_bins=BIN_THRESHOLD,
                                 metric=None):
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
                           num_bins=num_bins,
                           metric=metric)


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
                       num_bins=BIN_THRESHOLD,
                       metric=None):
    error_analyzer = ModelAnalyzer(model,
                                   X_test,
                                   y_test,
                                   feature_names,
                                   categorical_features,
                                   model_task=model_task,
                                   metric=metric)
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
    expected_error = get_expected_metric_error(error_analyzer,
                                               metric,
                                               model,
                                               validation_data,
                                               y_test)
    validate_matrix(matrix,
                    expected_count,
                    expected_error,
                    features,
                    metric=metric)


def get_expected_metric_error(error_analyzer, metric, model,
                              validation_data, y_test):
    if metric == Metrics.ERROR_RATE:
        return sum(model.predict(validation_data) != y_test)
    elif (metric == Metrics.MEAN_SQUARED_ERROR or
          metric == Metrics.MEAN_ABSOLUTE_ERROR or
          metric in precision_metrics or
          metric in recall_metrics):
        func = metric_to_func[metric]
        pred_y = model.predict(validation_data)
        if error_analyzer.model_task == ModelTask.CLASSIFICATION:
            ordered_labels = get_ordered_labels(error_analyzer.classes,
                                                y_test,
                                                pred_y)
            if len(ordered_labels) == 2:
                return func(y_test, pred_y, pos_label=ordered_labels[1])
        return func(y_test, pred_y)
    else:
        raise NotImplementedError(
            "Metric {} validation not supported yet".format(metric))


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
        validate_matrix_category(matrix[CATEGORY1])
        validate_matrix_category(matrix[CATEGORY2], reverse_order=False)
        validate_matrix_metric(matrix, exp_total_count,
                               exp_total_error, metric,
                               num_cat1, num_cat2)
    else:
        assert len(matrix[MATRIX][0]) == num_cat1
        assert len(matrix[MATRIX]) == 1
        validate_matrix_category(matrix[CATEGORY1])
        validate_matrix_metric(matrix, exp_total_count,
                               exp_total_error, metric,
                               1, num_cat1)


def validate_matrix_category(category, reverse_order=True):
    assert VALUES in category
    if INTERVAL_MIN in category:
        assert INTERVAL_MAX in category
        intervals = category[INTERVAL_MIN]
        if reverse_order:
            assert is_sorted(intervals, reverse_order)
        intervals = category[INTERVAL_MAX]
        if reverse_order:
            assert is_sorted(intervals, reverse_order)


def validate_matrix_metric(matrix, exp_total_count,
                           exp_total_error, metric,
                           num_cat1, num_cat2):
    is_precision = metric in precision_metrics
    is_recall = metric in recall_metrics
    if metric == Metrics.ERROR_RATE:
        # take sum of count, false count
        total_count = 0
        total_false_count = 0
        for i in range(num_cat1):
            for j in range(num_cat2):
                cell_count = matrix[MATRIX][i][j][COUNT]
                assert cell_count >= 0
                total_count += cell_count
                cell_false_count = matrix[MATRIX][i][j][FALSE_COUNT]
                assert cell_false_count >= 0
                total_false_count += cell_false_count
        assert exp_total_count == total_count
        assert exp_total_error == total_false_count
    elif (metric == Metrics.MEAN_SQUARED_ERROR or
          metric == Metrics.MEAN_ABSOLUTE_ERROR):
        # take sum of count, metric value
        total_count = 0
        total_metric_value = 0
        for i in range(num_cat1):
            for j in range(num_cat2):
                count = matrix[MATRIX][i][j][COUNT]
                assert count >= 0
                total_count += count
                cell_metric_value = matrix[MATRIX][i][j][METRIC_VALUE]
                assert cell_metric_value >= 0
                cell_value = cell_metric_value * count
                total_metric_value += cell_value
                metric_name = matrix[MATRIX][i][j][METRIC_NAME]
                assert metric_name == metric_to_display_name[metric]
        total_metric_value = total_metric_value / total_count
        assert exp_total_count == total_count
        assert abs(exp_total_error - total_metric_value) < TOLERANCE
    elif is_precision or is_recall:
        # compute the overall metric from the data in each of the cells
        total_count = 0
        total_metric_value = 0
        cell_tp_value = None
        cell_fp_value = None
        cell_fn_value = None
        for i in range(num_cat1):
            for j in range(num_cat2):
                count = matrix[MATRIX][i][j][COUNT]
                assert count >= 0
                total_count += count
                cell_metric_value = matrix[MATRIX][i][j][METRIC_VALUE]
                assert cell_metric_value >= 0
                if cell_tp_value is None:
                    cell_tp_value = np.array(matrix[MATRIX][i][j][TP],
                                             dtype=FLOAT64)
                else:
                    cell_tp_value += np.array(matrix[MATRIX][i][j][TP],
                                              dtype=FLOAT64)
                if is_precision:
                    if cell_fp_value is None:
                        cell_fp_value = np.array(matrix[MATRIX][i][j][FP],
                                                 dtype=FLOAT64)
                    else:
                        cell_fp_value += np.array(matrix[MATRIX][i][j][FP],
                                                  dtype=FLOAT64)
                elif is_recall:
                    if cell_fn_value is None:
                        cell_fn_value = np.array(matrix[MATRIX][i][j][FN],
                                                 dtype=FLOAT64)
                    else:
                        cell_fn_value += np.array(matrix[MATRIX][i][j][FN],
                                                  dtype=FLOAT64)
                metric_name = matrix[MATRIX][i][j][METRIC_NAME]
                assert metric_name == metric_to_display_name[metric]
        tp_sum = cell_tp_value.sum()
        if metric == Metrics.MICRO_PRECISION_SCORE:
            total_metric_value = tp_sum / (tp_sum + cell_fp_value.sum())
        elif metric == Metrics.MICRO_RECALL_SCORE:
            total_metric_value = tp_sum / (tp_sum + cell_fn_value.sum())
        elif metric == Metrics.MACRO_PRECISION_SCORE:
            per_class_metrics = cell_tp_value / (cell_tp_value + cell_fp_value)
            num_classes = len(per_class_metrics)
            total_metric_value = per_class_metrics.sum() / num_classes
        elif metric == Metrics.MACRO_RECALL_SCORE:
            per_class_metrics = cell_tp_value / (cell_tp_value + cell_fn_value)
            num_classes = len(per_class_metrics)
            total_metric_value = per_class_metrics.sum() / num_classes
        elif metric == Metrics.PRECISION_SCORE:
            total_metric_value = tp_sum / (tp_sum + cell_fp_value.sum())
        elif metric == Metrics.RECALL_SCORE:
            total_metric_value = tp_sum / (tp_sum + cell_fn_value.sum())
        assert exp_total_count == total_count
        assert abs(exp_total_error - total_metric_value) < TOLERANCE
    else:
        raise NotImplementedError(
            "Metric {} validation not supported yet".format(metric))


def is_sorted(category, reverse_order=True):
    if reverse_order:
        return np.all(category[:-1] >= category[1:])
    else:
        return np.all(category[:-1] <= category[1:])
