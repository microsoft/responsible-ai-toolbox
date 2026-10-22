# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from fractions import Fraction

import numpy as np
import pandas as pd
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             mean_absolute_error, mean_squared_error,
                             median_absolute_error, precision_score, r2_score,
                             recall_score)

from erroranalysis._internal.constants import (Metrics, ModelTask, f1_metrics,
                                               precision_metrics,
                                               recall_metrics)
from erroranalysis._internal.utils import (classification_label_key,
                                           classification_labels_equal,
                                           coerce_integer_array,
                                           compute_integer_residuals,
                                           factorize_label_array,
                                           normalize_single_output_array)

MICRO = 'micro'
MACRO = 'macro'
MISSING_LABEL_KEY = object()
INFERRED_ABSENT_POSITIVE_CLASS = object()


def _confusion_matrix_helper(y_true, y_pred, classes=None):
    """Helper function for computing confusion matrix.

    The second class is positive. If classes are omitted, sklearn's
    sorted label order is used.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :param classes: List of classes.
    :type classes: list
    :return: Tuple of true positive, false positive, false negative
             and true negative.
    :rtype: Tuple[int, int, int, int]
    """
    if classes is not None:
        y_true, y_pred = encode_classification_labels(
            classes, y_true, y_pred)
        classes = np.arange(len(classes))
    tn, fp, fn, tp = confusion_matrix(
        y_true, y_pred, labels=classes).ravel()
    return tp, fp, fn, tn


def false_negative_rate(y_true, y_pred, classes=None):
    """Compute the false negative rate for binary classification tasks.

    The second class is positive, using sorted labels if classes are omitted.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :param classes: List of classes.
    :type classes: list
    :return: False negative rate.
    :rtype: float
    """
    tp, _, fn, _ = _confusion_matrix_helper(y_true, y_pred, classes)
    return fn / (fn + tp)


def false_positive_rate(y_true, y_pred, classes=None):
    """Compute the false positive rate for binary classification tasks.

    The second class is positive, using sorted labels if classes are omitted.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :param classes: List of classes.
    :type classes: list
    :return: False positive rate.
    :rtype: float
    """
    _, fp, _, tn = _confusion_matrix_helper(y_true, y_pred, classes)
    return fp / (fp + tn)


def selection_rate(y_true, y_pred, classes=None):
    """Compute the selection rate for binary classification tasks.

    The second class is positive, using sorted labels if classes are omitted.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted labels.
    :type y_pred: numpy.ndarray
    :return: Selection rate.
    :param classes: List of classes.
    :type classes: list
    :rtype: float
    """
    tp, fp, fn, tn = _confusion_matrix_helper(y_true, y_pred, classes)
    return (fp + tp) / (tp + fp + fn + tn)


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


def mean_prediction(y_true, y_pred):
    """Compute mean value for prediction.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted values.
    :type y_pred: numpy.ndarray
    :return: Mean Prediction.
    :rtype: float
    """
    return np.mean(y_pred)


def error_rate(y_true, y_pred, diff=None):
    """Compute error rate for classification and regression tasks.

    :param y_true: True labels.
    :type y_true: numpy.ndarray
    :param y_pred: Predicted values.
    :type y_pred: numpy.ndarray
    :param diff: Difference between true and predicted values.
    :type diff: numpy.ndarray
    :return: Error rate.
    :rtype: float
    """
    if diff is None:
        diff = abs(y_pred - y_true)
    total = len(diff)
    error = int(diff.sum())
    if total == 0:
        metric_value = 0
    else:
        metric_value = error / total
    return metric_value


def _normalize_label_array(values):
    """Normalize labels without coercing mixed Python values to strings."""
    return normalize_single_output_array(values)


def _is_missing_label(label):
    """Return whether a scalar label is missing."""
    missing = np.asarray(pd.isna(label))
    return missing.ndim == 0 and bool(missing)


def _labels_equal(left, right):
    """Compare scalar labels without ambiguous missing-value booleans."""
    if _is_missing_label(left) or _is_missing_label(right):
        return _is_missing_label(left) and _is_missing_label(right)
    return classification_labels_equal(left, right)


def _contains_label(labels, label):
    """Return whether a scalar label occurs in a class collection."""
    return any(_labels_equal(candidate, label) for candidate in labels)


def _get_label_key(label):
    """Return a hash key that treats all missing scalar labels alike."""
    key = classification_label_key(label)
    return MISSING_LABEL_KEY if key == ("missing",) else key


def encode_classification_labels(classes, *values, allow_unknown=False):
    """Encode label arrays to stable integer class indexes."""
    key_to_index = None
    if _get_label_keys(classes) is not None:
        key_to_index = {
            _get_label_key(label): index
            for index, label in enumerate(classes)
        }
    encoded_values = []
    for value in values:
        array = _normalize_label_array(value).ravel()
        infer_dtype = pd.api.types.infer_dtype(array, skipna=False)
        use_factorization = array.dtype != object or infer_dtype in (
            "boolean", "bytes", "floating", "integer", "string")
        if use_factorization:
            if array.dtype == object:
                codes, unique = factorize_label_array(array)
            else:
                unique, codes = np.unique(array, return_inverse=True)
        else:
            unique = array
            codes = np.arange(len(array))
        unique_indexes = []
        for label in unique:
            index = None
            if key_to_index is not None:
                try:
                    index = key_to_index.get(_get_label_key(label))
                except TypeError:
                    pass
            if index is None:
                index = next((
                    candidate for candidate, class_label in enumerate(classes)
                    if _labels_equal(label, class_label)), None)
            if index is None:
                if not allow_unknown:
                    raise ValueError(
                        "Observed label is not present in the resolved "
                        "classes: {}".format(label))
                index = -1
            unique_indexes.append(index)
        encoded_values.append(
            np.asarray(unique_indexes, dtype=int)[codes])
    return encoded_values


def _get_label_keys(labels):
    """Return hash keys for labels, or None when a label is unhashable."""
    try:
        return {_get_label_key(label) for label in labels}
    except TypeError:
        return None


def _get_invalid_labels(classes, labels):
    """Return observed labels that are absent from the class vocabulary."""
    class_keys = _get_label_keys(classes)
    if class_keys is not None:
        try:
            return [label for label in labels
                    if _get_label_key(label) not in class_keys]
        except TypeError:
            pass
    return [label for label in labels
            if not _contains_label(classes, label)]


def labels_overlap_classes(classes, true_y, pred_y):
    """Return whether observed labels overlap a declared vocabulary."""
    if classes is None:
        return False
    labels = _combine_unique_labels(true_y, pred_y)
    return len(_get_invalid_labels(classes, labels)) < len(labels)


def _get_unique_labels(values, skip_missing=False):
    """Return labels in first-seen order without coercing mixed types."""
    array = _normalize_label_array(values).ravel()
    infer_dtype = pd.api.types.infer_dtype(array, skipna=False)
    if array.dtype != object:
        _, indexes = np.unique(array, return_index=True)
        labels = list(array[np.sort(indexes)])
    elif infer_dtype in (
            "boolean", "bytes", "floating", "integer", "string"):
        _, labels = factorize_label_array(array)
        labels = list(labels)
    else:
        labels = []
        seen = set()
        for label in array:
            try:
                key = _get_label_key(label)
            except TypeError:
                if not _contains_label(labels, label):
                    labels.append(label)
            else:
                if key not in seen:
                    seen.add(key)
                    labels.append(label)
    if skip_missing:
        labels = [label for label in labels if not _is_missing_label(label)]
    return labels


def _combine_unique_labels(*values, skip_missing=False):
    """Return unique labels from multiple arrays in first-seen order."""
    labels = []
    seen = set()
    use_hash_keys = True
    for value in values:
        for label in _get_unique_labels(value, skip_missing=skip_missing):
            if use_hash_keys:
                try:
                    key = _get_label_key(label)
                except TypeError:
                    use_hash_keys = False
                else:
                    if key not in seen:
                        seen.add(key)
                        labels.append(label)
                    continue
            if not _contains_label(labels, label):
                labels.append(label)
    return labels


def _sort_labels(labels):
    """Sort comparable labels and preserve first-seen order otherwise."""
    labels = labels.copy()
    keys = None
    try:
        keys = [classification_label_key(label) for label in labels]
        if any(key[0] == "missing" for key in keys):
            return [
                label for _, label in sorted(
                    zip(keys, labels),
                    key=lambda pair: (
                        0 if pair[0][0] == "missing" else 1,
                        repr(pair[0])))
            ]
        temporal_tags = {
            "datetime", "datetime-instant", "time-aware", "time-naive",
            "timedelta", "timedelta-months"}
        if (keys and len({key[0] for key in keys}) == 1 and
                keys[0][0] in temporal_tags):
            return [
                label for _, label in sorted(
                    zip(keys, labels), key=lambda pair: pair[0])
            ]
        if keys and {key[0] for key in keys}.issubset(
                {"number", "infinity"}):
            def numeric_key(key):
                if key[0] == "infinity":
                    return (0 if key[1] < 0 else 2, Fraction(0))
                return (1, Fraction(key[1], key[2]))

            return [
                label for _, label in sorted(
                    zip(keys, labels),
                    key=lambda pair: numeric_key(pair[0]))
            ]
    except TypeError:
        pass
    try:
        labels.sort()
    except TypeError:
        try:
            if keys is not None and len({key[0] for key in keys}) == 1:
                labels = [
                    label for _, label in sorted(
                        zip(keys, labels), key=lambda pair: pair[0])
                ]
        except TypeError:
            pass
    return labels


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
    labels = _combine_unique_labels(true_y, pred_y)
    labels = _sort_labels(labels)
    if classes is None:
        return labels
    if _get_invalid_labels(classes, labels):
        return labels
    return classes


def resolve_analyzer_classes(analyzer, classes, true_y, pred_y,
                             require_two_classes=True):
    """Resolve one stable vocabulary for the selected cohort."""
    observed = _combine_unique_labels(true_y, pred_y)
    full_true = _get_unique_labels(analyzer.true_y, skip_missing=True)
    observed_outside_full_true = _get_invalid_labels(full_true, observed)
    selected_missing_is_outside_full_true = (
        observed_outside_full_true and
        all(_is_missing_label(label)
            for label in observed_outside_full_true))
    if classes is not None:
        if not observed:
            validate_ordered_classes(
                classes, true_y, pred_y,
                require_two_classes=require_two_classes)
            return classes
        invalid = _get_invalid_labels(classes, observed)
        overlap = len(invalid) < len(observed)
        if overlap:
            validate_ordered_classes(
                classes, true_y, pred_y,
                require_two_classes=require_two_classes)
            return classes
        model_classes = getattr(
            getattr(analyzer, "model", None), "classes_", None)
        if model_classes is not None:
            model_labels = _get_unique_labels(
                model_classes, skip_missing=True)
            reference_labels = observed
            compatible = (
                not _get_invalid_labels(model_labels, reference_labels))
            if compatible and len(model_labels) == 2:
                return model_labels
        if selected_missing_is_outside_full_true and len(observed) >= 2:
            return _sort_labels(observed)
        if len(full_true) == 2:
            return _sort_labels(full_true)
        if not require_two_classes and len(full_true) >= 2:
            cohort_labels = _combine_unique_labels(full_true, observed)
            return _sort_labels(cohort_labels)
        if len(observed) >= 2:
            return _sort_labels(observed)
    else:
        model_classes = getattr(
            getattr(analyzer, "model", None), "classes_", None)
        if model_classes is not None:
            model_labels = _get_unique_labels(
                model_classes, skip_missing=True)
            reference_labels = observed
            compatible = (
                not _get_invalid_labels(model_labels, reference_labels))
            if compatible and len(model_labels) == 2:
                return model_labels
        if selected_missing_is_outside_full_true and len(observed) >= 2:
            return _sort_labels(observed)
        if not require_two_classes:
            if len(full_true) == 1:
                cohort_labels = _combine_unique_labels(full_true, observed)
                return _sort_labels(cohort_labels)
            if len(full_true) >= 2:
                cohort_labels = _combine_unique_labels(full_true, observed)
                return _sort_labels(cohort_labels)
        if len(full_true) == 2:
            return _sort_labels(full_true)
        if len(observed) >= 2:
            return _sort_labels(observed)

    labels = _combine_unique_labels(observed, full_true)
    if len(labels) >= 2:
        return _sort_labels(labels)
    model_classes = getattr(getattr(analyzer, "model", None), "classes_", None)
    if model_classes is not None:
        model_labels = _get_unique_labels(model_classes, skip_missing=True)
        if not _get_invalid_labels(model_labels, labels):
            labels = _combine_unique_labels(labels, model_labels)
    if classes is None and require_two_classes and len(labels) == 1:
        if classification_labels_equal(labels[0], 1):
            labels.insert(0, INFERRED_ABSENT_POSITIVE_CLASS)
        else:
            labels.append(INFERRED_ABSENT_POSITIVE_CLASS)
    return _sort_labels(labels)


def validate_ordered_classes(classes, true_y, pred_y,
                             require_two_classes=True):
    """Return classes after rejecting labels outside the vocabulary."""
    if classes is None:
        return get_ordered_classes(classes, true_y, pred_y)
    labels = _combine_unique_labels(true_y, pred_y)
    invalid = _get_invalid_labels(classes, labels)
    if invalid:
        raise ValueError(
            "Observed labels are not present in the resolved classes: {}"
            .format(invalid))
    if require_two_classes and len(classes) != 2:
        raise ValueError(
            "Binary classification metrics require exactly two classes")
    if not require_two_classes:
        return classes
    if any(label is INFERRED_ABSENT_POSITIVE_CLASS for label in classes):
        return classes
    class_keys = [classification_label_key(label) for label in classes]
    if any(key[0] == "missing" for key in class_keys):
        return classes
    temporal_tags = {
        "datetime", "datetime-instant", "time-aware", "time-naive",
        "timedelta", "timedelta-months"}
    if (len({key[0] for key in class_keys}) == 1 and
            class_keys[0][0] in temporal_tags):
        return classes
    try:
        sorted(classes)
    except TypeError as ex:
        raise ValueError(
            "Binary classification labels must be mutually comparable") \
            from ex
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


def _get_integer_residuals(y_true, y_pred):
    """Return exact residuals for valid single-output integer operands."""
    labels = coerce_integer_array(y_true)
    if labels is None:
        return None
    predictions = coerce_integer_array(y_pred)
    if labels.ndim == 2 and labels.shape[1] == 1:
        labels = labels[:, 0]
    if predictions is not None and predictions.ndim == 2 and \
            predictions.shape[1] == 1:
        predictions = predictions[:, 0]
    if (labels is not None and predictions is not None and
            labels.ndim == predictions.ndim == 1 and
            labels.shape == predictions.shape and labels.size > 0):
        return compute_integer_residuals(predictions, labels)
    return None


def _mean_absolute_error(y_true, y_pred):
    """Compute single-output integer MAE before floating-point presentation.

    Preserve sklearn behavior for other types, shapes and invalid inputs.
    """
    residuals = _get_integer_residuals(y_true, y_pred)
    if residuals is not None:
        # Python scalars keep abs(INT64_MIN) and the sum representable.
        # Convert only the final mean to the existing floating-point metric.
        return sum(abs(value) for value in residuals.tolist()) / residuals.size
    return mean_absolute_error(y_true, y_pred)


def _mean_squared_error(y_true, y_pred):
    """Compute single-output integer MSE without dtype overflow."""
    residuals = _get_integer_residuals(y_true, y_pred)
    if residuals is not None:
        squared = [value * value for value in residuals.tolist()]
        return sum(squared) / residuals.size
    return mean_squared_error(y_true, y_pred)


def _median_absolute_error(y_true, y_pred):
    """Compute single-output integer median absolute error exactly."""
    residuals = _get_integer_residuals(y_true, y_pred)
    if residuals is not None:
        absolute = sorted(abs(value) for value in residuals.tolist())
        midpoint = len(absolute) // 2
        if len(absolute) % 2:
            return float(absolute[midpoint])
        return (absolute[midpoint - 1] + absolute[midpoint]) / 2
    return median_absolute_error(y_true, y_pred)


metric_to_func = {
    Metrics.MEAN_PREDICTION: mean_prediction,
    Metrics.MEAN_ABSOLUTE_ERROR: _mean_absolute_error,
    Metrics.MEAN_SQUARED_ERROR: _mean_squared_error,
    Metrics.MEDIAN_ABSOLUTE_ERROR: _median_absolute_error,
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
    Metrics.SELECTION_RATE: selection_rate,
    Metrics.ERROR_RATE: error_rate
}

metric_to_task = {
    Metrics.MEAN_PREDICTION: ModelTask.REGRESSION,
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
