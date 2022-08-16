# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             mean_absolute_error, mean_squared_error,
                             median_absolute_error, precision_score, r2_score,
                             recall_score)

from erroranalysis._internal.constants import (Metrics, ModelTask, f1_metrics,
                                               precision_metrics,
                                               recall_metrics)

MICRO = 'micro'
MACRO = 'macro'


def false_negative_rate(y_true, y_pred):
    """Compute the false negative rate for binary classification tasks.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :return: False negative rate.
    :rtype: float
    """
    tp, _, fn, _ = confusion_matrix(y_true, y_pred).ravel()
    return fn / (fn + tp)


def false_positive_rate(y_true, y_pred):
    """Compute the false positive rate for binary classification tasks.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :return: False positive rate.
    :rtype: float
    """
    _, fp, _, tn = confusion_matrix(y_true, y_pred).ravel()
    return fp / (fp + tn)


def selection_rate(y_true, y_pred):
    """Compute the selection rate for binary classification tasks.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :return: Selection rate.
    :rtype: float
    """
    tp, fp, fn, tn = confusion_matrix(y_true, y_pred).ravel()
    return (fn + tp) / (tp + fp + fn + tn)


def micro_precision_score(y_true, y_pred):
    """Compute micro precision score for multi-class classification tasks.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :return: Micro precision score.
    :rtype: float
    """
    return precision_score(y_true, y_pred, average=MICRO)


def macro_precision_score(y_true, y_pred):
    """Compute macro precision score for multi-class classification tasks.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :return: Macro precision score.
    :rtype: float
    """
    return precision_score(y_true, y_pred, average=MACRO)


def micro_recall_score(y_true, y_pred):
    """Compute micro recall score for multi-class classification tasks.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :return: Micro recall score.
    :rtype: float
    """
    return recall_score(y_true, y_pred, average=MICRO)


def macro_recall_score(y_true, y_pred):
    """Compute macro recall score for multi-class classification tasks.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :return: Macro recall score.
    :rtype: float
    """
    return recall_score(y_true, y_pred, average=MACRO)


def micro_f1_score(y_true, y_pred):
    """Compute micro f1 score for multi-class classification tasks.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :return: Micro f1 score.
    :rtype: float
    """
    return f1_score(y_true, y_pred, average=MICRO)


def macro_f1_score(y_true, y_pred):
    """Compute macro f1 score for multi-class classification tasks.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :return: Macro f1 score.
    :rtype: float
    """
    return f1_score(y_true, y_pred, average=MACRO)


def get_ordered_classes(classes, true_y, pred_y):
    """Get the ordered classes for the given true and predicted labels.

    :param classes: List of classes.
    :type classes: list
    :param true_y: True labels.
    :type true_y: numpy.ndarray
    :param pred_y: Predicted labels.
    :type pred_y: numpy.ndarray
    :return: Ordered classes.
    :rtype: list
    """
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
    """Returns if the given metric is a multi-aggregation metric.

    The metric will be a multi-aggregation metric if it is a precision,
    recall, accuracy or f1 score metric.

    :param metric: Metric to check.
    :type metric: str
    :return: True if metric is a multi-agg metric.
    :rtype: bool
    """
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
    Metrics.MACRO_RECALL_SCORE: macro_recall_score,
    Metrics.FALSE_POSITIVE_RATE: false_positive_rate,
    Metrics.FALSE_NEGATIVE_RATE: false_negative_rate,
    Metrics.SELECTION_RATE: selection_rate
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
    Metrics.MACRO_RECALL_SCORE: ModelTask.CLASSIFICATION,
    Metrics.FALSE_NEGATIVE_RATE: ModelTask.CLASSIFICATION,
    Metrics.FALSE_POSITIVE_RATE: ModelTask.CLASSIFICATION,
    Metrics.SELECTION_RATE: ModelTask.CLASSIFICATION
}
