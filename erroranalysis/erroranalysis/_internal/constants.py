# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum

ARG = 'arg'
COLUMN = 'column'
COMPOSITE_FILTERS = 'compositeFilters'
DIFF = 'diff'
LEAF_INDEX = 'leaf_index'
METHOD = 'method'
OPERATION = 'operation'
PRED_Y = 'pred_y'
ROW_INDEX = 'Index'
SPLIT_FEATURE = 'split_feature'
SPLIT_INDEX = 'split_index'
TRUE_Y = 'true_y'


class CohortFilterMethods:
    """Cohort filter methods.
    """

    METHOD_INCLUDES = 'includes'
    METHOD_EXCLUDES = 'excludes'
    METHOD_EQUAL = 'equal'
    METHOD_GREATER = 'greater'
    METHOD_LESS = 'less'
    METHOD_LESS_AND_EQUAL = 'less and equal'
    METHOD_GREATER_AND_EQUAL = 'greater and equal'
    METHOD_RANGE = 'in the range of'


class CohortFilterOps:
    """Cohort filter operations.
    """

    AND = 'and'
    OR = 'or'


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

    The regression metrics are 'mean_prediction',
    'mean_absolute_error', 'mean_squared_error',
    'median_absolute_error' and 'r2_score'.
    The binary classification metrics are
    'f1_score', 'precision_score',
    'recall_score', 'accuracy_score', 'error_rate',
    'false negative rate', 'false positive rate' and
    'selection rate'. The multiclass classification
    metrics are 'macro_precision_score',
    'micro_precision_score', 'macro_recall_score',
    'micro_recall_score', 'macro_f1_score',
    'micro_f1_score', 'accuracy_score' and 'error_rate'.
    """
    ACCURACY_SCORE = 'accuracy_score'
    MEAN_PREDICTION = 'mean_prediction'
    MEAN_ABSOLUTE_ERROR = 'mean_absolute_error'
    MEAN_SQUARED_ERROR = 'mean_squared_error'
    MEDIAN_ABSOLUTE_ERROR = 'median_absolute_error'
    R2_SCORE = 'r2_score'
    F1_SCORE = 'f1_score'
    MACRO_F1_SCORE = 'macro_f1_score'
    MICRO_F1_SCORE = 'micro_f1_score'
    PRECISION_SCORE = 'precision_score'
    MACRO_PRECISION_SCORE = 'macro_precision_score'
    MICRO_PRECISION_SCORE = 'micro_precision_score'
    RECALL_SCORE = 'recall_score'
    MACRO_RECALL_SCORE = 'macro_recall_score'
    MICRO_RECALL_SCORE = 'micro_recall_score'
    ERROR_RATE = 'error_rate'
    FALSE_POSITIVE_RATE = 'false_positive_rate'
    FALSE_NEGATIVE_RATE = 'false_negative_rate'
    SELECTION_RATE = 'selection_rate'


class MetricKeys(str, Enum):
    """Provide keys for properties related to metrics.
    """
    METRIC_NAME = 'metricName'
    METRIC_VALUE = 'metricValue'


class RootKeys(str, Enum):
    """Provide keys for the root cohort.
    """
    METRIC_NAME = MetricKeys.METRIC_NAME.value
    METRIC_VALUE = MetricKeys.METRIC_VALUE.value
    TOTAL_SIZE = 'totalSize'
    ERROR_COVERAGE = 'errorCoverage'


class TreeNode(str, Enum):
    """Provide the tree node properties.
    """
    METRIC_NAME = MetricKeys.METRIC_NAME.value
    METRIC_VALUE = MetricKeys.METRIC_VALUE.value


metric_to_display_name = {
    Metrics.ACCURACY_SCORE: 'Accuracy score',
    Metrics.MEAN_PREDICTION: 'Mean prediction',
    Metrics.MEAN_ABSOLUTE_ERROR: 'Mean absolute error',
    Metrics.MEAN_SQUARED_ERROR: 'Mean squared error',
    Metrics.MEDIAN_ABSOLUTE_ERROR: 'Median absolute error',
    Metrics.R2_SCORE: 'R2 score',
    Metrics.F1_SCORE: 'F1 score',
    Metrics.MACRO_F1_SCORE: 'Macro F1 score',
    Metrics.MICRO_F1_SCORE: 'Micro F1 score',
    Metrics.PRECISION_SCORE: 'Precision score',
    Metrics.MACRO_PRECISION_SCORE: 'Macro precision score',
    Metrics.MICRO_PRECISION_SCORE: 'Micro precision score',
    Metrics.RECALL_SCORE: 'Recall score',
    Metrics.MACRO_RECALL_SCORE: 'Macro recall score',
    Metrics.MICRO_RECALL_SCORE: 'Micro recall score',
    Metrics.ERROR_RATE: 'Error rate',
    Metrics.FALSE_POSITIVE_RATE: 'False positive rate',
    Metrics.FALSE_NEGATIVE_RATE: 'False negative rate',
    Metrics.SELECTION_RATE: 'Selection rate'
}


display_name_to_metric = {v: k for k, v in metric_to_display_name.items()}


# Note: Error metrics are those for which a higher score is worse, not better
# These should be given a negative value when computing the feature importance
error_metrics = {Metrics.MEAN_ABSOLUTE_ERROR, Metrics.MEAN_SQUARED_ERROR,
                 Metrics.MEDIAN_ABSOLUTE_ERROR, Metrics.ERROR_RATE}


precision_metrics = {Metrics.PRECISION_SCORE,
                     Metrics.MACRO_PRECISION_SCORE,
                     Metrics.MICRO_PRECISION_SCORE}


recall_metrics = {Metrics.RECALL_SCORE,
                  Metrics.MACRO_RECALL_SCORE,
                  Metrics.MICRO_RECALL_SCORE}


f1_metrics = {Metrics.F1_SCORE,
              Metrics.MACRO_F1_SCORE,
              Metrics.MICRO_F1_SCORE}


binary_classification_metrics = [
    Metrics.ACCURACY_SCORE,
    Metrics.F1_SCORE, Metrics.PRECISION_SCORE,
    Metrics.RECALL_SCORE, Metrics.ERROR_RATE,
    Metrics.FALSE_POSITIVE_RATE,
    Metrics.FALSE_NEGATIVE_RATE,
    Metrics.SELECTION_RATE]


regression_metrics = [
    Metrics.MEAN_PREDICTION,
    Metrics.MEAN_ABSOLUTE_ERROR,
    Metrics.MEAN_SQUARED_ERROR,
    Metrics.MEDIAN_ABSOLUTE_ERROR,
    Metrics.R2_SCORE]


multiclass_classification_metrics = [
    Metrics.MACRO_PRECISION_SCORE,
    Metrics.MICRO_PRECISION_SCORE,
    Metrics.MACRO_RECALL_SCORE,
    Metrics.MICRO_RECALL_SCORE,
    Metrics.MACRO_F1_SCORE,
    Metrics.MICRO_F1_SCORE,
    Metrics.ACCURACY_SCORE,
    Metrics.ERROR_RATE]
