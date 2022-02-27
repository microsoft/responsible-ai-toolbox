# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import math
import warnings
from abc import ABC, abstractmethod

import numpy as np
import pandas as pd
from sklearn.metrics import multilabel_confusion_matrix

from erroranalysis._internal.cohort_filter import filter_from_cohort
from erroranalysis._internal.constants import (DIFF, PRED_Y, ROW_INDEX, TRUE_Y,
                                               MatrixParams, Metrics,
                                               ModelTask,
                                               metric_to_display_name)
from erroranalysis._internal.metrics import (get_ordered_classes,
                                             is_multi_agg_metric,
                                             metric_to_func)

BIN_THRESHOLD = MatrixParams.BIN_THRESHOLD
CATEGORY1 = 'category1'
CATEGORY2 = 'category2'
COUNT = 'count'
FALSE_COUNT = 'falseCount'
INTERVAL_MIN = 'intervalMin'
INTERVAL_MAX = 'intervalMax'
MATRIX = 'matrix'
METRIC_VALUE = 'metricValue'
METRIC_NAME = 'metricName'
VALUES = 'values'
PRECISION = 100
TP = 'tp'
FP = 'fp'
FN = 'fn'
TN = 'tn'
ERROR = 'error'
DROP = 'drop'
ZERO_BIN_TOL = 0.01


def compute_json_matrix(analyzer, features, filters, composite_filters):
    # Note: this is for backcompat for older versions
    # of raiwidgets pypi package
    compute_matrix(analyzer, features, filters, composite_filters)


def compute_matrix(analyzer, features, filters, composite_filters,
                   quantile_binning=False, num_bins=BIN_THRESHOLD):
    if num_bins <= 0:
        raise ValueError(
            'Number of bins parameter must be greater than 0 for the heatmap')
    if features[0] is None and features[1] is None:
        raise ValueError(
            'One or two features must be specified to compute the heat map')
    filtered_df = filter_from_cohort(analyzer,
                                     filters,
                                     composite_filters)
    true_y = filtered_df[TRUE_Y]
    dropped_cols = [TRUE_Y, ROW_INDEX]
    is_model_analyzer = hasattr(analyzer, 'model')
    if not is_model_analyzer:
        pred_y = filtered_df[PRED_Y]
        dropped_cols.append(PRED_Y)
    input_data = filtered_df.drop(columns=dropped_cols)
    is_pandas = isinstance(analyzer.dataset, pd.DataFrame)
    metric = analyzer.metric
    if is_pandas:
        true_y = true_y.to_numpy()
    else:
        input_data = input_data.to_numpy()
    if is_model_analyzer:
        pred_y = analyzer.model.predict(input_data)
    if is_model_analyzer:
        if analyzer.model_task == ModelTask.CLASSIFICATION:
            diff = analyzer.model.predict(input_data) != true_y
        else:
            diff = analyzer.model.predict(input_data) - true_y
    else:
        if analyzer.model_task == ModelTask.CLASSIFICATION:
            diff = pred_y != true_y
        else:
            diff = pred_y - true_y
    if not isinstance(diff, np.ndarray):
        diff = np.array(diff)
    if not isinstance(pred_y, np.ndarray):
        pred_y = np.array(pred_y)
    if not isinstance(true_y, np.ndarray):
        true_y = np.array(true_y)
    indexes = []
    for feature in features:
        if feature is None:
            continue
        indexes.append(analyzer.feature_names.index(feature))
    if is_pandas:
        input_data = input_data.to_numpy()
    dataset_sub_features = input_data[:, indexes]
    dataset_sub_names = np.array(analyzer.feature_names)[np.array(indexes)]
    df = pd.DataFrame(dataset_sub_features, columns=dataset_sub_names)
    df_err = df.copy()
    df_err[DIFF] = diff
    if metric == Metrics.ERROR_RATE:
        df_err = df_err[df_err[DIFF]]
    else:
        df_err[TRUE_Y] = true_y
        df_err[PRED_Y] = pred_y
    # construct matrix
    matrix = []
    if len(dataset_sub_names) == 2:
        feat1 = dataset_sub_names[0]
        feat2 = dataset_sub_names[1]
        unique_count1 = len(df[feat1].unique())
        unique_count2 = len(df[feat2].unique())
        f1_is_cat = False
        f2_is_cat = False
        if analyzer.categorical_features is not None:
            f1_is_cat = feat1 in analyzer.categorical_features
            f2_is_cat = feat2 in analyzer.categorical_features
        if unique_count1 > num_bins and not f1_is_cat:
            tabdf1 = bin_data(df,
                              feat1,
                              num_bins,
                              quantile_binning=quantile_binning)
            categories1 = tabdf1.cat.categories
            if len(categories1) < num_bins:
                warn_duplicate_edges(feat1)
            tabdf1_err = bin_data(df_err,
                                  feat1,
                                  categories1,
                                  quantile_binning=quantile_binning)
        else:
            tabdf1 = df[feat1]
            tabdf1_err = df_err[feat1]
            categories1 = np.unique(tabdf1.to_numpy(),
                                    return_counts=True)[0]
        if unique_count2 > num_bins and not f2_is_cat:
            tabdf2 = bin_data(df,
                              feat2,
                              num_bins,
                              quantile_binning=quantile_binning)
            categories2 = tabdf2.cat.categories
            if len(categories2) < num_bins:
                warn_duplicate_edges(feat2)
            tabdf2_err = bin_data(df_err,
                                  feat2,
                                  categories2,
                                  quantile_binning=quantile_binning)
        else:
            tabdf2 = df[feat2]
            tabdf2_err = df_err[feat2]
            categories2 = np.unique(tabdf2.to_numpy(),
                                    return_counts=True)[0]
        if metric == Metrics.ERROR_RATE:
            matrix_total = pd.crosstab(tabdf1,
                                       tabdf2,
                                       rownames=[feat1],
                                       colnames=[feat2])
            matrix_error = pd.crosstab(tabdf1_err,
                                       tabdf2_err,
                                       rownames=[feat1],
                                       colnames=[feat2])
        else:
            if is_multi_agg_metric(metric):
                ordered_labels = get_ordered_classes(analyzer.classes,
                                                     true_y, pred_y)
                aggfunc = _MultiMetricAggFunc(metric_to_func[metric],
                                              ordered_labels, metric)
            else:
                aggfunc = _AggFunc(metric_to_func[metric])
            matrix_total = pd.crosstab(tabdf1,
                                       tabdf2,
                                       rownames=[feat1],
                                       colnames=[feat2])
            matrix_error = pd.crosstab(tabdf1_err,
                                       tabdf2_err,
                                       rownames=[feat1],
                                       colnames=[feat2],
                                       values=list(zip(df_err[TRUE_Y],
                                                       df_err[PRED_Y])),
                                       aggfunc=aggfunc._agg_func_pair)
            fill_matrix_nulls(matrix_total, aggfunc._fill_na_value())
            fill_matrix_nulls(matrix_error, aggfunc._fill_na_value())
        matrix = matrix_2d(categories1, categories2,
                           matrix_total, matrix_error,
                           metric)
    else:
        feat1 = dataset_sub_names[0]
        unique_count1 = len(df[feat1].unique())
        f1_is_cat = False
        if analyzer.categorical_features is not None:
            f1_is_cat = feat1 in analyzer.categorical_features
        if unique_count1 > num_bins and not f1_is_cat:
            cutdf = bin_data(df,
                             feat1,
                             num_bins,
                             quantile_binning=quantile_binning)
            num_categories = len(cutdf.cat.categories)
            bin_range = range(num_categories)
            if len(cutdf.cat.categories) < num_bins:
                warn_duplicate_edges(feat1)
            catr = cutdf.cat.rename_categories(bin_range)
            catn, counts = np.unique(catr.to_numpy(),
                                     return_counts=True)
            # fix counts to include skipped categories
            fix_counts = []
            counts_idx = 0
            for idx, catdf in enumerate(cutdf.cat.categories):
                if idx not in catn:
                    fix_counts.append(0)
                else:
                    fix_counts.append(counts[counts_idx])
                    counts_idx += 1
            counts = fix_counts
            cut_err = bin_data(df_err,
                               feat1,
                               cutdf.cat.categories,
                               quantile_binning=quantile_binning)
            catr_err = cut_err.cat.rename_categories(bin_range)
            val_err, counts_err = np.unique(catr_err.to_numpy(),
                                            return_counts=True)
            val_err = cut_err.cat.categories[val_err]
            categories = cutdf.cat.categories
        else:
            categories, counts = np.unique(df[feat1].to_numpy(),
                                           return_counts=True)
            val_err, counts_err = np.unique(df_err[feat1].to_numpy(),
                                            return_counts=True)
            cut_err = df_err
        # Compute the given metric for each group, if not using error rate
        if metric != Metrics.ERROR_RATE:
            if is_multi_agg_metric(metric):
                ordered_labels = get_ordered_classes(analyzer.classes,
                                                     true_y, pred_y)
                aggfunc = _MultiMetricAggFunc(metric_to_func[metric],
                                              ordered_labels, metric)
            else:
                aggfunc = _AggFunc(metric_to_func[metric])
            cutdf_err = pd.DataFrame(cut_err)
            cutdf_err['metric_values'] = list(zip(df_err[TRUE_Y],
                                                  df_err[PRED_Y]))
            grouped = cutdf_err.groupby([feat1])
            agg_func = {'metric_values': aggfunc._agg_func_triplet}
            counts_err = grouped.agg(agg_func)
            counts_err = counts_err.values.ravel()
        matrix = matrix_1d(categories, val_err, counts,
                           counts_err, metric)
    return matrix


def warn_duplicate_edges(feat):
    warnings.warn(("Removing duplicate bin edges for "
                   "quantile binning of feature {}"
                   ". There are too many "
                   "duplicate values for the specified "
                   "number of bins.").format(feat), UserWarning)


def bin_data(df, feat, bins, quantile_binning=False):
    feat_col = df[feat]
    # Note: if column is empty pd.qcut raises error but pd.cut does not
    # and just returns the correct binned data and bins if retbins=True.
    # If using existing array of bins we manually compute the bins
    # so the same categories are used.
    is_bins_constant = not isinstance(bins, pd.IntervalIndex)
    if not is_bins_constant:
        bin_indexes = bins.get_indexer(feat_col)
        cat = pd.Categorical.from_codes(bin_indexes,
                                        categories=bins,
                                        ordered=True)
        cat_typed = feat_col._constructor(cat,
                                          index=feat_col.index,
                                          name=feat_col.name)
        return cat_typed
    if quantile_binning and not feat_col.empty:
        bindf = pd.qcut(feat_col, bins, precision=PRECISION, duplicates=DROP)
        zero_interval = bindf.cat.categories[0]
        left_abs = abs(zero_interval.left)
        left = zero_interval.left - ZERO_BIN_TOL * left_abs
        zero_interval = pd.Interval(left=left, right=zero_interval.right,
                                    closed=zero_interval.closed)
        indexes = [zero_interval]
        for idx in range(1, len(bindf.cat.categories)):
            indexes.append(bindf.cat.categories[idx])
        cats = pd.IntervalIndex(indexes, closed=zero_interval.closed,
                                dtype=bindf.cat.categories.dtype,
                                name=bindf.cat.categories.name)
        bindf.cat.categories = cats
        # re-bin data according to new categories, otherwise can have
        # issues with precision when using pd.qcut.
        # Specifically, it can bin some points incorrectly for low precision,
        # for example a point with value -0.0127796318808497
        # will be binned incorrectly in interval
        # (-0.0309423241359475, -0.012779631880849702]
        # even though it should be binned in the interval above since
        # -0.0127796318808497 > -0.012779631880849702
        bindf = bin_data(df, feat, bindf.cat.categories, quantile_binning)
        return bindf
    else:
        return pd.cut(feat_col, bins, precision=PRECISION)


class _BaseAggFunc(ABC):
    def __init__(self, aggfunc):
        self.aggfunc = aggfunc

    @abstractmethod
    def _agg_func_pair(self, pair):
        pass

    @abstractmethod
    def _agg_func_triplet(self, pair):
        pass

    @abstractmethod
    def _fill_na_value(self):
        pass


class _AggFunc(_BaseAggFunc):
    def __init__(self, aggfunc):
        super(_AggFunc, self).__init__(aggfunc)

    def _agg_func_pair(self, pair):
        true_y, pred_y = zip(*pair.values.tolist())
        return self.aggfunc(true_y, pred_y)

    def _agg_func_triplet(self, pair):
        if pair.empty:
            return 0
        (true_y, pred_y) = zip(*pair.values.tolist())
        return self.aggfunc(true_y, pred_y)

    def _fill_na_value(self):
        return 0


class _MultiMetricAggFunc(_BaseAggFunc):
    def __init__(self, aggfunc, labels, metric):
        super(_MultiMetricAggFunc, self).__init__(aggfunc)
        self.num_labels = len(labels)
        if self.num_labels == 2:
            # for binary classification case, choose positive class label
            self.labels = [labels[1]]
        else:
            self.labels = labels
        self.metric = metric

    def _multi_metric_result(self, true_y, pred_y):
        pred_y = np.array(pred_y)
        true_y = np.array(true_y)
        conf_matrix = multilabel_confusion_matrix(true_y, pred_y,
                                                  labels=self.labels)
        tp_sum = conf_matrix[:, 1, 1]
        diff = pred_y != true_y
        error = diff.sum()
        # needed for precision metrics
        fp_sum = conf_matrix[:, 0, 1]
        # needed for recall metrics
        fn_sum = conf_matrix[:, 1, 0]
        tn_sum = conf_matrix[:, 0, 0]
        if self.num_labels == 2 and self.metric != Metrics.ACCURACY_SCORE:
            metric_value = self.aggfunc(true_y, pred_y,
                                        pos_label=self.labels[0])
        else:
            metric_value = self.aggfunc(true_y, pred_y)
        return (metric_value, tp_sum.tolist(),
                fp_sum.tolist(), fn_sum.tolist(),
                tn_sum.tolist(), error)

    def _agg_func_pair(self, pair):
        true_y, pred_y = zip(*pair.values.tolist())
        return self._multi_metric_result(true_y, pred_y)

    def _agg_func_triplet(self, pair):
        if pair.empty:
            return self._fill_na_value()
        (true_y, pred_y) = zip(*pair.values.tolist())
        return self._multi_metric_result(true_y, pred_y)

    def _fill_na_value(self):
        zero_array = [0]
        if self.num_labels > 2:
            zero_array = zero_array * self.num_labels
        return (0, zero_array, zero_array, zero_array, zero_array, 0)


def matrix_2d(categories1, categories2, matrix_counts,
              matrix_err_counts, metric):
    matrix = []
    category1 = []
    category1_min_interval = []
    category1_max_interval = []
    is_multi_agg = is_multi_agg_metric(metric)
    for row_index in reversed(range(len(categories1))):
        matrix_row = []
        cat1 = categories1[row_index]
        if isinstance(categories1, pd.IntervalIndex):
            category1_min_interval.append(cat1.left)
            category1_max_interval.append(cat1.right)
            category1.append(str(cat1))
        else:
            category1.append(get_py_value(cat1))
        for col_index in range(len(categories2)):
            cat2 = categories2[col_index]
            index_exists_err = cat1 in matrix_err_counts.index
            col_exists_err = cat2 in matrix_err_counts.columns
            if metric == Metrics.ERROR_RATE:
                false_count = 0
                if index_exists_err and col_exists_err:
                    false_count = int(matrix_err_counts.loc[cat1, cat2])
            elif is_multi_agg:
                tp_sum = []
                fp_sum = []
                fn_sum = []
                tn_sum = []
                metric_value = 0
                if index_exists_err and col_exists_err:
                    metric_value = float(matrix_err_counts.loc[cat1, cat2][0])
                    tp_sum = matrix_err_counts.loc[cat1, cat2][1]
                    fp_sum = matrix_err_counts.loc[cat1, cat2][2]
                    fn_sum = matrix_err_counts.loc[cat1, cat2][3]
                    tn_sum = matrix_err_counts.loc[cat1, cat2][4]
                    error = float(matrix_err_counts.loc[cat1, cat2][5])
            else:
                metric_value = 0
                if index_exists_err and col_exists_err:
                    metric_value = float(matrix_err_counts.loc[cat1, cat2])
            index_exists = cat1 in matrix_counts.index
            col_exists = cat2 in matrix_counts.columns
            total_count = 0
            if index_exists and col_exists:
                total_count = int(matrix_counts.loc[cat1, cat2])
            if metric == Metrics.ERROR_RATE:
                matrix_row.append({
                    FALSE_COUNT: false_count,
                    COUNT: total_count,
                    METRIC_NAME: metric_to_display_name[metric]
                })
            elif is_multi_agg:
                matrix_row.append({
                    METRIC_VALUE: metric_value,
                    TP: tp_sum,
                    FP: fp_sum,
                    FN: fn_sum,
                    TN: tn_sum,
                    ERROR: error,
                    METRIC_NAME: metric_to_display_name[metric],
                    COUNT: total_count
                })
            else:
                matrix_row.append({
                    METRIC_VALUE: metric_value,
                    METRIC_NAME: metric_to_display_name[metric],
                    COUNT: total_count
                })
        matrix.append(matrix_row)

    category2 = []
    category2_min_interval = []
    category2_max_interval = []
    for cat2 in categories2:
        if isinstance(categories2, pd.IntervalIndex):
            category2_min_interval.append(cat2.left)
            category2_max_interval.append(cat2.right)
            category2.append(str(cat2))
        else:
            category2.append(get_py_value(cat2))
    category1 = {VALUES: category1,
                 INTERVAL_MIN: category1_min_interval,
                 INTERVAL_MAX: category1_max_interval}
    category2 = {VALUES: category2,
                 INTERVAL_MIN: category2_min_interval,
                 INTERVAL_MAX: category2_max_interval}
    return {MATRIX: matrix, CATEGORY1: category1,
            CATEGORY2: category2}


def matrix_1d(categories, values_err, counts, counts_err,
              metric):
    matrix = []
    matrix_row = []
    for col_idx in reversed(range(len(categories))):
        cat = categories[col_idx]
        if metric == Metrics.ERROR_RATE:
            false_count = 0
            if cat in values_err:
                index_err = list(values_err).index(cat)
                false_count = int(counts_err[index_err])
            matrix_row.append({
                FALSE_COUNT: false_count,
                COUNT: int(counts[col_idx]),
                METRIC_NAME: metric_to_display_name[metric]
            })
        elif is_multi_agg_metric(metric):
            tp_sum = []
            fp_sum = []
            fn_sum = []
            tn_sum = []
            metric_value = 0
            error = 0
            if cat in values_err:
                metric_value = float(counts_err[col_idx][0])
                tp_sum = counts_err[col_idx][1]
                fp_sum = counts_err[col_idx][2]
                fn_sum = counts_err[col_idx][3]
                tn_sum = counts_err[col_idx][4]
                error = float(counts_err[col_idx][5])
                if math.isnan(metric_value):
                    metric_value = 0.0
            matrix_row.append({
                METRIC_VALUE: metric_value,
                TP: tp_sum,
                FP: fp_sum,
                FN: fn_sum,
                TN: tn_sum,
                ERROR: error,
                METRIC_NAME: metric_to_display_name[metric],
                COUNT: int(counts[col_idx])
            })
        else:
            metric_value = 0
            if cat in values_err:
                metric_value = float(counts_err[col_idx])
                if math.isnan(metric_value):
                    metric_value = 0.0
            matrix_row.append({
                METRIC_VALUE: metric_value,
                METRIC_NAME: metric_to_display_name[metric],
                COUNT: int(counts[col_idx])
            })
    matrix.append(matrix_row)
    category = []
    category_min_interval = []
    category_max_interval = []
    for cat in reversed(categories):
        if isinstance(categories, pd.IntervalIndex):
            category_min_interval.append(cat.left)
            category_max_interval.append(cat.right)
            category.append(str(cat))
        else:
            category.append(get_py_value(cat))
    category1 = {VALUES: category,
                 INTERVAL_MIN: category_min_interval,
                 INTERVAL_MAX: category_max_interval}
    return {MATRIX: matrix, CATEGORY1: category1}


def fill_matrix_nulls(matrix, null_value):
    idx_arrays = np.where(matrix.isnull())
    idx_tuples = list(zip(idx_arrays[0], idx_arrays[1]))
    for tuple in idx_tuples:
        matrix.iloc[tuple] = null_value


def get_py_value(value):
    if isinstance(value, np.generic):
        return value.item()
    return value
