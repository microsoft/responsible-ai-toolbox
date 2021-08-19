# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum


PRED_Y = 'pred_y'
ROW_INDEX = 'row_index'
TRUE_Y = 'true_y'
DIFF = 'diff'
SPLIT_INDEX = 'split_index'
SPLIT_FEATURE = 'split_feature'
LEAF_INDEX = 'leaf_index'
METHOD = 'method'
METHOD_EXCLUDES = 'excludes'
METHOD_INCLUDES = 'includes'


class ModelTask(str, Enum):
    """Provide model task constants.

    Can be 'classification', 'regression' or 'unknown'.

    Note: Keeping sentence case constants (Classification, Regression)
    for backwards compatibility, please use ALL_UPPER_CASE instead.
    """

    CLASSIFICATION = 'classification'
    REGRESSION = 'regression'
    UNKNOWN = 'unknown'
    Classification = 'classification'
    Regression = 'regression'


class MatrixParams:
    """Provide default parameters for the matrix filter aka heatmap APIs.
    """
    BIN_THRESHOLD = 8


class Metrics(str, Enum):
    """Provide the supported error analysis metrics.

    The regression metrics are 'mean_absolute_error',
    'mean_squared_error', 'median_absolute_error',
    and 'r2_score'.  The classification metrics are
    'f1_score', 'precision_score', 'recall_score' and
    'error_rate'.
    """
    MEAN_ABSOLUTE_ERROR = 'mean_absolute_error'
    MEAN_SQUARED_ERROR = 'mean_squared_error'
    MEDIAN_ABSOLUTE_ERROR = 'median_absolute_error'
    R2_SCORE = 'r2_score'
    F1_SCORE = 'f1_score'
    PRECISION_SCORE = 'precision_score'
    RECALL_SCORE = 'recall_score'
    ERROR_RATE = 'error_rate'


metric_to_display_name = {
    Metrics.MEAN_ABSOLUTE_ERROR: 'Mean absolute error',
    Metrics.MEAN_SQUARED_ERROR: 'Mean squared error',
    Metrics.MEDIAN_ABSOLUTE_ERROR: 'Median absolute error',
    Metrics.R2_SCORE: 'R2 score',
    Metrics.F1_SCORE: 'F1 score',
    Metrics.PRECISION_SCORE: 'Precision score',
    Metrics.RECALL_SCORE: 'Recall score',
    Metrics.ERROR_RATE: 'Error rate'
}


# Note: Error metrics are those for which a higher score is worse, not better
# These should be given a negative value when computing the feature importance
error_metrics = {Metrics.MEAN_ABSOLUTE_ERROR, Metrics.MEAN_SQUARED_ERROR,
                 Metrics.MEDIAN_ABSOLUTE_ERROR, Metrics.ERROR_RATE}
