# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.cohort_filter import filter_from_cohort
from erroranalysis._internal.constants import (ARG, COLUMN, METHOD, ROW_INDEX,
                                               TRUE_Y, MatrixParams, Metrics,
                                               ModelTask, f1_metrics,
                                               metric_to_display_name,
                                               precision_metrics,
                                               recall_metrics)
from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.matrix_filter import (CATEGORY1, CATEGORY2, COUNT,
                                                   FALSE_COUNT, FN, FP,
                                                   INTERVAL_MAX, INTERVAL_MIN,
                                                   MATRIX, METRIC_NAME,
                                                   METRIC_VALUE, TN, TP,
                                                   VALUES, bin_data)
from erroranalysis._internal.metrics import (get_ordered_classes,
                                             is_multi_agg_metric,
                                             metric_to_func)
from rai_test_utils.datasets.tabular import (
    create_adult_census_data, create_binary_classification_dataset,
    create_cancer_data, create_diabetes_data, create_housing_data,
    create_iris_data, create_simple_titanic_data, create_wine_data)
from rai_test_utils.models.model_utils import (create_models_classification,
                                               create_models_regression)
from rai_test_utils.models.sklearn import (create_kneighbors_classifier,
                                           create_titanic_pipeline)
from raiutils.exceptions import UserConfigValidationException

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

        filters = [{ARG: [2.85],
                    COLUMN: feature_names[1],
                    METHOD: 'less and equal'}]

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

        filters = [{ARG: [2.85],
                    COLUMN: feature_names[1],
                    METHOD: 'less and equal'}]

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

    @pytest.mark.parametrize('metric', [Metrics.MEAN_SQUARED_ERROR,
                                        Metrics.MEAN_ABSOLUTE_ERROR])
    @pytest.mark.parametrize('num_bins', [4, 8, 10, 20])
    def test_matrix_filter_diabetes_quantile_binning(self, num_bins, metric):
        # this dataset seemed to have unique errors for quantile binning
        (X_train, X_test, y_train, y_test,
            feature_names) = create_diabetes_data()

        model_task = ModelTask.REGRESSION
        matrix_features = ['age']
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names,
                                     model_task,
                                     matrix_features=matrix_features,
                                     quantile_binning=True,
                                     num_bins=num_bins,
                                     metric=metric)

    @pytest.mark.parametrize('string_labels', [True, False])
    @pytest.mark.parametrize('metric', [Metrics.ERROR_RATE,
                                        Metrics.PRECISION_SCORE,
                                        Metrics.RECALL_SCORE,
                                        Metrics.F1_SCORE,
                                        Metrics.ACCURACY_SCORE])
    def test_matrix_filter_adult_census_quantile_binning(self,
                                                         string_labels,
                                                         metric):
        (X_train, X_test, y_train, y_test,
            categorical_features) = create_adult_census_data(string_labels)

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
                                        Metrics.MICRO_RECALL_SCORE,
                                        Metrics.ACCURACY_SCORE,
                                        Metrics.MACRO_F1_SCORE,
                                        Metrics.MICRO_F1_SCORE])
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
        (X_train, X_test, y_train, y_test,
            feature_names, _) = create_cancer_data()

        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names,
                                     model_task)

    def test_matrix_filter_cancer_filters(self):
        # Validate the shift cohort functionality where base
        # cohort was chosen in matrix view
        (X_train, X_test, y_train, y_test,
            feature_names, _) = create_cancer_data()

        composite_filters = [{'compositeFilters':
                             [{'compositeFilters':
                              [{ARG: [11.364, 13.182],
                                COLUMN: 'mean radius',
                                METHOD: 'in the range of'}],
                               'operation': 'and'},
                              {'compositeFilters':
                               [{ARG: [13.182, 15],
                                 COLUMN: 'mean radius',
                                 METHOD: 'in the range of'}],
                               'operation': 'and'},
                              {'compositeFilters':
                               [{ARG: [15, 16.817],
                                 COLUMN: 'mean radius',
                                 METHOD: 'in the range of'}],
                               'operation': 'and'},
                              {'compositeFilters':
                               [{ARG: [16.817, 18.635],
                                 COLUMN: 'mean radius',
                                 METHOD: 'in the range of'}],
                               'operation': 'and'}],
                             'operation': 'or'}]

        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task,
                                     composite_filters=composite_filters)

    def test_matrix_filter_binary_classification(self):
        (X_train, y_train, X_test,
            y_test, _) = create_binary_classification_dataset()
        feature_names = list(X_train.columns)
        model_task = ModelTask.CLASSIFICATION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task)

    def test_matrix_filter_titanic(self):
        (X_train, X_test, y_train, y_test, numeric,
            categorical) = create_simple_titanic_data()
        feature_names = categorical + numeric
        clf = create_titanic_pipeline(X_train, y_train)
        categorical_features = categorical
        run_error_analyzer(clf, X_test, y_test, feature_names,
                           categorical_features,
                           model_task=ModelTask.CLASSIFICATION)

    def test_matrix_filter_housing(self):
        X_train, X_test, y_train, y_test, feature_names = create_housing_data()

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

    def test_matrix_filter_housing_filters(self):
        X_train, X_test, y_train, y_test, feature_names = create_housing_data()

        filters = [{ARG: [600],
                    COLUMN: 'Population',
                    METHOD: 'less and equal'},
                   {ARG: [6],
                    COLUMN: 'AveRooms',
                    METHOD: 'greater'}]

        model_task = ModelTask.REGRESSION
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names,
                                     model_task, filters=filters)

    def test_matrix_filter_housing_quantile_binning(self):
        # Test quantile binning on CRIM feature in california housing dataset,
        # which errored out due to first category not fitting into bins
        (X_train, X_test, y_train, y_test,
            feature_names) = create_housing_data()

        model_task = ModelTask.REGRESSION
        matrix_features = ['Population']
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task,
                                     matrix_features=matrix_features,
                                     quantile_binning=True)

    def test_matrix_filter_iris_int64(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)

        X_train[feature_names[0]] = X_train[feature_names[0]].astype(np.int64)
        X_test[feature_names[0]] = X_test[feature_names[0]].astype(np.int64)

        model_task = ModelTask.CLASSIFICATION
        matrix_features = [feature_names[0]]
        run_error_analyzer_on_models(X_train, y_train, X_test,
                                     y_test, feature_names, model_task,
                                     matrix_features=matrix_features)

    def test_matrix_filter_titanic_object_dtype_quantile(self):
        (X_train, X_test, y_train, y_test, numeric,
            categorical) = create_simple_titanic_data()
        feature_names = categorical + numeric
        matrix_features = [numeric[0], numeric[1]]
        clf = create_titanic_pipeline(X_train, y_train)
        categorical_features = categorical
        run_error_analyzer(clf, X_test, y_test, feature_names,
                           categorical_features,
                           matrix_features=matrix_features,
                           quantile_binning=True,
                           model_task=ModelTask.CLASSIFICATION)

    def test_bin_data_max_over_left_bound(self):
        max_val = 0.9479200000000001
        # Test bin_data when max value is over right bound of last bin
        df = pd.DataFrame({'a': [0.49928, 0.53104, 0.40528, 0.876,
                                 0.912, max_val]})
        feat1 = 'a'
        binned_data = bin_data(df, feat1, 2)
        assert binned_data.cat.categories[1].right == max_val

    def test_matrix_filter_with_invalid_feature_names(self):
        X_train, X_test, y_train, y_test, feature_names = create_housing_data()

        # Test with invalid feature names
        model_task = ModelTask.REGRESSION
        err = "not found in dataset. Existing features"
        with pytest.raises(UserConfigValidationException, match=err):
            run_error_analyzer_on_models(X_train, y_train, X_test,
                                         y_test, feature_names, model_task,
                                         matrix_features=['invalid_feature'])


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

    # Validate compute_matrix_on_dataset() output
    matrix = error_analyzer.compute_matrix(features,
                                           filters,
                                           composite_filters,
                                           quantile_binning=quantile_binning,
                                           num_bins=num_bins)
    validation_data = X_test.copy()
    y_test_validation = y_test
    if filters is not None or composite_filters is not None:
        validation_data = filter_from_cohort(error_analyzer,
                                             filters,
                                             composite_filters)
        y_test_validation = validation_data[TRUE_Y]
        validation_data = validation_data.drop(columns=[TRUE_Y, ROW_INDEX])
        if not isinstance(X_test, pd.DataFrame):
            validation_data = validation_data.values
    expected_count = len(validation_data)
    metric = error_analyzer.metric
    expected_error = get_expected_metric_error(error_analyzer,
                                               metric,
                                               model,
                                               validation_data,
                                               y_test_validation)
    validate_matrix(matrix,
                    expected_count,
                    expected_error,
                    features,
                    metric=metric)

    # Validate compute_matrix_on_dataset() output
    dataset = X_test.copy()
    if not isinstance(dataset, pd.DataFrame):
        dataset = pd.DataFrame(data=dataset, columns=feature_names)
    dataset[TRUE_Y] = y_test
    dataset[ROW_INDEX] = np.arange(0, len(y_test))

    new_matrix = error_analyzer.compute_matrix_on_dataset(
        features, dataset,
        quantile_binning=quantile_binning,
        num_bins=num_bins)
    expected_count = len(dataset)
    metric = error_analyzer.metric

    if not isinstance(X_test, pd.DataFrame):
        dataset = dataset.drop(columns=[TRUE_Y, ROW_INDEX]).values
    else:
        dataset = dataset.drop(columns=[TRUE_Y, ROW_INDEX])

    expected_error = get_expected_metric_error(
        error_analyzer,
        metric,
        model,
        dataset,
        y_test)
    validate_matrix(new_matrix,
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
          metric in recall_metrics or
          metric in f1_metrics or
          metric == Metrics.ACCURACY_SCORE):
        func = metric_to_func[metric]
        pred_y = model.predict(validation_data)
        can_be_binary = error_analyzer.model_task == ModelTask.CLASSIFICATION
        if can_be_binary and metric != Metrics.ACCURACY_SCORE:
            ordered_labels = get_ordered_classes(error_analyzer.classes,
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
    # Make sure categories are never numpy types but python types
    for value in category[VALUES]:
        assert not isinstance(value, np.generic)
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
    is_accuracy = metric == Metrics.ACCURACY_SCORE
    is_f1_score = metric in f1_metrics
    is_multi_agg = is_multi_agg_metric(metric)
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
    elif is_multi_agg:
        # compute the overall metric from the data in each of the cells
        total_count = 0
        total_metric_value = 0
        cell_tp_value = None
        cell_tn_value = None
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
                if is_precision or is_accuracy or is_f1_score:
                    if cell_fp_value is None:
                        cell_fp_value = np.array(matrix[MATRIX][i][j][FP],
                                                 dtype=FLOAT64)
                    else:
                        cell_fp_value += np.array(matrix[MATRIX][i][j][FP],
                                                  dtype=FLOAT64)
                if is_recall or is_accuracy or is_f1_score:
                    if cell_fn_value is None:
                        cell_fn_value = np.array(matrix[MATRIX][i][j][FN],
                                                 dtype=FLOAT64)
                    else:
                        cell_fn_value += np.array(matrix[MATRIX][i][j][FN],
                                                  dtype=FLOAT64)
                if is_accuracy:
                    if cell_tn_value is None:
                        cell_tn_value = np.array(matrix[MATRIX][i][j][TN],
                                                 dtype=FLOAT64)
                    else:
                        cell_tn_value += np.array(matrix[MATRIX][i][j][TN],
                                                  dtype=FLOAT64)
                metric_name = matrix[MATRIX][i][j][METRIC_NAME]
                assert metric_name == metric_to_display_name[metric]
        tp_sum = cell_tp_value.sum()
        is_overall_precision = (metric == Metrics.MICRO_PRECISION_SCORE or
                                metric == Metrics.PRECISION_SCORE)
        is_overall_recall = (metric == Metrics.MICRO_RECALL_SCORE or
                             metric == Metrics.RECALL_SCORE)
        is_overall_f1_score = (metric == Metrics.MICRO_F1_SCORE or
                               metric == Metrics.F1_SCORE)
        if is_overall_precision:
            total_metric_value = tp_sum / (tp_sum + cell_fp_value.sum())
        elif is_overall_recall:
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
        elif metric == Metrics.ACCURACY_SCORE:
            if len(cell_tn_value) < 2:
                tn_sum = cell_tn_value.sum()
                fn_sum = cell_fn_value.sum()
                fp_sum = cell_fp_value.sum()
                num_correct = tp_sum + tn_sum
                num_total = num_correct + fn_sum + fp_sum
                total_metric_value = num_correct / num_total
            else:
                num_total = (cell_tp_value[0] + cell_tn_value[0] +
                             cell_fn_value[0] + cell_fp_value[0])
                total_metric_value = tp_sum / num_total
        elif is_overall_f1_score:
            fn_sum = cell_fn_value.sum()
            fp_sum = cell_fp_value.sum()
            total_metric_value = tp_sum / (tp_sum + (fp_sum + fn_sum) / 2)
        elif metric == Metrics.MACRO_F1_SCORE:
            pc_precision = cell_tp_value / (cell_tp_value + cell_fp_value)
            pc_recall = cell_tp_value / (cell_tp_value + cell_fn_value)
            num_classes = len(pc_precision)
            pc_f1_score = (2 * (pc_precision * pc_recall) /
                           (pc_precision + pc_recall)).sum()
            total_metric_value = pc_f1_score / num_classes
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
