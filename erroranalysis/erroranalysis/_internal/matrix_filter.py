# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import math
from erroranalysis._internal.cohort_filter import filter_from_cohort
from erroranalysis._internal.constants import (PRED_Y,
                                               TRUE_Y,
                                               ROW_INDEX,
                                               DIFF,
                                               ModelTask,
                                               MatrixParams,
                                               Metrics,
                                               metric_to_display_name)
from erroranalysis._internal.metrics import metric_to_func


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
    is_model_analyzer = hasattr(analyzer, 'model')
    if is_model_analyzer:
        filtered_df = filter_from_cohort(analyzer.dataset,
                                         filters,
                                         composite_filters,
                                         analyzer.feature_names,
                                         analyzer.true_y,
                                         analyzer.categorical_features,
                                         analyzer.categories)
    else:
        filtered_df = filter_from_cohort(analyzer.dataset,
                                         filters,
                                         composite_filters,
                                         analyzer.feature_names,
                                         analyzer.true_y,
                                         analyzer.categorical_features,
                                         analyzer.categories,
                                         analyzer.pred_y)
    true_y = filtered_df[TRUE_Y]
    dropped_cols = [TRUE_Y, ROW_INDEX]
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
    if analyzer.model_task == ModelTask.CLASSIFICATION:
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
            tabdf1, bins = bin_data(df,
                                    feat1,
                                    num_bins,
                                    retbins=True,
                                    quantile_binning=quantile_binning)
            tabdf1_err = bin_data(df_err,
                                  feat1,
                                  bins,
                                  quantile_binning=quantile_binning)
            categories1 = tabdf1.cat.categories
            # Note: use exact same object so that the line:
            # cat1 in matrix_err_counts.index
            # does not fail below, categories are same regardless
            tabdf1_err.cat.categories = categories1
        else:
            tabdf1 = df[feat1]
            tabdf1_err = df_err[feat1]
            categories1 = np.unique(tabdf1.to_numpy(),
                                    return_counts=True)[0]
        if unique_count2 > num_bins and not f2_is_cat:
            tabdf2, bins = bin_data(df,
                                    feat2,
                                    num_bins,
                                    retbins=True,
                                    quantile_binning=quantile_binning)
            tabdf2_err = bin_data(df_err,
                                  feat2,
                                  bins,
                                  quantile_binning=quantile_binning)
            categories2 = tabdf2.cat.categories
            # Note: use exact same object so that the line:
            # cat2 in matrix_err_counts.columns
            # does not fail below, categories are same regardless
            tabdf2_err.cat.categories = categories2
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
            matrix_total = matrix_total.fillna(0)
            matrix_error = matrix_error.fillna(0)
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
            cutdf, bins = bin_data(df,
                                   feat1,
                                   num_bins,
                                   retbins=True,
                                   quantile_binning=quantile_binning)
            bin_range = range(num_bins)
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
                               bins,
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
            aggfunc = _AggFunc(metric_to_func[metric])
            cutdf_err = pd.DataFrame(cut_err)
            cutdf_err['metric_values'] = list(zip(df_err[TRUE_Y],
                                                  df_err[PRED_Y]))
            grouped = cutdf_err.groupby([feat1])
            counts_err = grouped.agg(aggfunc._agg_func_triplet)
            counts_err = counts_err.values.ravel()
        matrix = matrix_1d(categories, val_err, counts,
                           counts_err, metric)
    return matrix


def bin_data(df, feat, bins, retbins=False, quantile_binning=False):
    feat_col = df[feat]
    # Note: if column is empty pd.qcut raises error but pd.cut does not
    # and just returns the correct binned data and bins if retbins=True,
    # also if using existing array of bins pd.cut must be used as pd.qcut
    # cannot bin based on specified binning edges (I know it's complicated!)
    is_bins_constant = not isinstance(bins, np.ndarray)
    if quantile_binning and not feat_col.empty and is_bins_constant:
        return pd.qcut(feat_col, bins, retbins=retbins)
    else:
        return pd.cut(feat_col, bins, retbins=retbins)


class _AggFunc(object):
    def __init__(self, aggfunc):
        self.aggfunc = aggfunc

    def _agg_func_pair(self, pair):
        true_y, pred_y = zip(*pair.values.tolist())
        return self.aggfunc(true_y, pred_y)

    def _agg_func_triplet(self, pair):
        if pair.empty:
            return 0
        (true_y, pred_y) = zip(*pair.values.tolist())
        return self.aggfunc(true_y, pred_y)


def matrix_2d(categories1, categories2, matrix_counts,
              matrix_err_counts, metric):
    matrix = []
    category1 = []
    category1_min_interval = []
    category1_max_interval = []
    for row_index in range(len(categories1)):
        matrix_row = []
        cat1 = categories1[row_index]
        if isinstance(categories1, pd.IntervalIndex):
            category1_min_interval.append(cat1.left)
            category1_max_interval.append(cat1.right)
            category1.append(str(cat1))
        else:
            category1.append(cat1)
        for col_index in range(len(categories2)):
            cat2 = categories2[col_index]
            index_exists_err = cat1 in matrix_err_counts.index
            col_exists_err = cat2 in matrix_err_counts.columns
            if metric == Metrics.ERROR_RATE:
                false_count = 0
                if index_exists_err and col_exists_err:
                    false_count = int(matrix_err_counts.loc[cat1, cat2])
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
            category2.append(cat2)
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
    for col_idx in range(len(categories)):
        cat = categories[col_idx]
        if metric == Metrics.ERROR_RATE:
            false_count = 0
            if cat in values_err:
                index_err = list(values_err).index(cat)
                false_count = int(counts_err[index_err])
            matrix_row.append({
                FALSE_COUNT: false_count,
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
    for cat in categories:
        if isinstance(categories, pd.IntervalIndex):
            category_min_interval.append(cat.left)
            category_max_interval.append(cat.right)
            category.append(str(cat))
        else:
            category.append(cat)
    category1 = {VALUES: category,
                 INTERVAL_MIN: category_min_interval,
                 INTERVAL_MAX: category_max_interval}
    return {MATRIX: matrix, CATEGORY1: category1}
