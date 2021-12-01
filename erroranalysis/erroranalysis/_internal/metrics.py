# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from sklearn.metrics import (accuracy_score, f1_score, mean_absolute_error,
                             mean_squared_error, median_absolute_error,
                             precision_score, r2_score, recall_score)

from erroranalysis._internal.constants import (Metrics, ModelTask, f1_metrics,
                                               precision_metrics,
                                               recall_metrics)

MICRO = 'micro'
MACRO = 'macro'


def micro_precision_score(y_true, y_pred):
    return precision_score(y_true, y_pred, average=MICRO)


def macro_precision_score(y_true, y_pred):
    return precision_score(y_true, y_pred, average=MACRO)


def micro_recall_score(y_true, y_pred):
    return recall_score(y_true, y_pred, average=MICRO)


def macro_recall_score(y_true, y_pred):
    return recall_score(y_true, y_pred, average=MACRO)


def micro_f1_score(y_true, y_pred):
    return f1_score(y_true, y_pred, average=MICRO)


def macro_f1_score(y_true, y_pred):
    return f1_score(y_true, y_pred, average=MACRO)


def get_ordered_classes(classes, true_y, pred_y):
    # If classes is none, or disagrees with labels from true and predicted
    # arrays, return the sorted set of labels.
    # Otherwise return classes as it provides the correct ordering and any
    # classes we may be missing for the subset of data evaluated.
    labels = list(set(true_y) | set(pred_y))
    labels.sort()
    if classes is None:
        return labels
    for label in labels:
        if label not in classes:
            return labels
    return classes


def is_multi_agg_metric(metric):
    return (metric in precision_metrics or
            metric in recall_metrics or
            metric == Metrics.ACCURACY_SCORE or
            metric in f1_metrics)


metric_to_func = {
    Metrics.MEAN_ABSOLUTE_ERROR: mean_absolute_error,
    Metrics.MEAN_SQUARED_ERROR: mean_squared_error,
    Metrics.MEDIAN_ABSOLUTE_ERROR: median_absolute_error,
    Metrics.R2_SCORE: r2_score,
    Metrics.F1_SCORE: f1_score,
    Metrics.MICRO_F1_SCORE: micro_f1_score,
    Metrics.MACRO_F1_SCORE: macro_f1_score,
    Metrics.ACCURACY_SCORE: accuracy_score,
    Metrics.PRECISION_SCORE: precision_score,
    Metrics.MICRO_PRECISION_SCORE: micro_precision_score,
    Metrics.MACRO_PRECISION_SCORE: macro_precision_score,
    Metrics.RECALL_SCORE: recall_score,
    Metrics.MICRO_RECALL_SCORE: micro_recall_score,
    Metrics.MACRO_RECALL_SCORE: macro_recall_score
}

metric_to_task = {
    Metrics.MEAN_ABSOLUTE_ERROR: ModelTask.REGRESSION,
    Metrics.MEAN_SQUARED_ERROR: ModelTask.REGRESSION,
    Metrics.MEDIAN_ABSOLUTE_ERROR: ModelTask.REGRESSION,
    Metrics.R2_SCORE: ModelTask.REGRESSION,
    Metrics.F1_SCORE: ModelTask.CLASSIFICATION,
    Metrics.MICRO_F1_SCORE: ModelTask.CLASSIFICATION,
    Metrics.MACRO_F1_SCORE: ModelTask.CLASSIFICATION,
    Metrics.PRECISION_SCORE: ModelTask.CLASSIFICATION,
    Metrics.RECALL_SCORE: ModelTask.CLASSIFICATION,
    Metrics.MICRO_PRECISION_SCORE: ModelTask.CLASSIFICATION,
    Metrics.MICRO_RECALL_SCORE: ModelTask.CLASSIFICATION,
    Metrics.MACRO_PRECISION_SCORE: ModelTask.CLASSIFICATION,
    Metrics.MACRO_RECALL_SCORE: ModelTask.CLASSIFICATION
}
