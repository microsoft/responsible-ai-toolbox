# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, median_absolute_error,
    r2_score, f1_score, precision_score, recall_score)
from erroranalysis._internal.constants import ModelTask, Metrics

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


metric_to_func = {
    Metrics.MEAN_ABSOLUTE_ERROR: mean_absolute_error,
    Metrics.MEAN_SQUARED_ERROR: mean_squared_error,
    Metrics.MEDIAN_ABSOLUTE_ERROR: median_absolute_error,
    Metrics.R2_SCORE: r2_score,
    Metrics.F1_SCORE: f1_score,
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
    Metrics.PRECISION_SCORE: ModelTask.CLASSIFICATION,
    Metrics.RECALL_SCORE: ModelTask.CLASSIFICATION,
    Metrics.MICRO_PRECISION_SCORE: ModelTask.CLASSIFICATION,
    Metrics.MICRO_RECALL_SCORE: ModelTask.CLASSIFICATION,
    Metrics.MACRO_PRECISION_SCORE: ModelTask.CLASSIFICATION,
    Metrics.MACRO_RECALL_SCORE: ModelTask.CLASSIFICATION
}
