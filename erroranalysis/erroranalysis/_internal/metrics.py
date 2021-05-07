# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, median_absolute_error,
    r2_score, f1_score, precision_score, recall_score)
from erroranalysis._internal.constants import ModelTask, Metrics

metric_to_func = {
    Metrics.MEAN_ABSOLUTE_ERROR: mean_absolute_error,
    Metrics.MEAN_SQUARED_ERROR: mean_squared_error,
    Metrics.MEDIAN_ABSOLUTE_ERROR: median_absolute_error,
    Metrics.R2_SCORE: r2_score,
    Metrics.F1_SCORE: f1_score,
    Metrics.PRECISION_SCORE: precision_score,
    Metrics.RECALL_SCORE: recall_score
}

metric_to_task = {
    Metrics.MEAN_ABSOLUTE_ERROR: ModelTask.REGRESSION,
    Metrics.MEAN_SQUARED_ERROR: ModelTask.REGRESSION,
    Metrics.MEDIAN_ABSOLUTE_ERROR: ModelTask.REGRESSION,
    Metrics.R2_SCORE: ModelTask.REGRESSION,
    Metrics.F1_SCORE: ModelTask.CLASSIFICATION,
    Metrics.PRECISION_SCORE: ModelTask.CLASSIFICATION,
    Metrics.RECALL_SCORE: ModelTask.CLASSIFICATION
}
