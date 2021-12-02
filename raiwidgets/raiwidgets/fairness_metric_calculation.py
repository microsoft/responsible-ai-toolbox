# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import importlib

import numpy as np
from packaging import version
from sklearn.metrics import confusion_matrix

MODULE_NOT_INSTALLED_ERROR_MESSAGE = "{} is not installed. " \
    "Either install fairlearn or provide another fairness metric module."
FAIRLEARN_PRE_V0_5_0_ERROR_MESSAGE = "fairlearn<0.5.0 is not compatible " \
    "with raiwidgets. Please upgrade to the latest version."
METRICFRAME_NOT_AVAILABLE_ERROR_MESSAGE = "The fairness metric module " \
    "needs to provide a MetricFrame class to calculate metrics. For an " \
    "refer to fairlearn.metrics.MetricFrame"

z_score = 1.959964  # This z-score corresponds to the 95% confidence interval
alpha = 0.95        # Conventional level of power for statistical tests
digits_of_precision = 4


def compute_wilson_bounds(p, n, digits=digits_of_precision, z=z_score):
    """ Returns lower and upper bound (Binomial Proportion)
    """
    denominator = 1 + z**2 / n
    centre_adjusted_probability = p + z * z / (2 * n)
    adjusted_standard_deviation = np.sqrt(
        (p * (1 - p) + z * z / (4 * n))) / np.sqrt(n)
    lower_bound = (centre_adjusted_probability - z *
                   adjusted_standard_deviation) / denominator
    upper_bound = (centre_adjusted_probability + z *
                   adjusted_standard_deviation) / denominator
    return (round(lower_bound, digits), round(upper_bound, digits))


def wilson_wrapper(y_true, y_pred, func):
    assert len(y_true) == len(y_pred)
    p = func(y_true, y_pred)
    n = len(y_true)
    result = compute_wilson_bounds(p, n, digits_of_precision, z_score)
    if float('nan') in result:
        return [None, None]
    return result


def general_cm_wilson(a, b, digits_of_precision, z_score):
    """
    Computes generalized confusion matrix wilson bounds
    Used for rates of the form: a / (a + b)

    This is necessary because the denominators for rates such as
    True Positive Rate need to be out of total positive results
    """
    n = a + b
    return compute_wilson_bounds(a / n, n, digits_of_precision, z_score)


def recall_wilson(y_true, y_pred):
    # aka True Positive Rate
    assert len(y_true) == len(y_pred)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    return general_cm_wilson(tp, fn, digits_of_precision, z_score)


def precision_wilson(y_true, y_pred):
    assert len(y_true) == len(y_pred)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    return general_cm_wilson(tp, fp, digits_of_precision, z_score)


def false_positive_rate_wilson(y_true, y_pred):
    # aka fall-out
    assert len(y_true) == len(y_pred)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    return general_cm_wilson(fp, tn, digits_of_precision, z_score)


def true_negative_rate_wilson(y_true, y_pred):
    # aka specificity
    assert len(y_true) == len(y_pred)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    return general_cm_wilson(tn, fp, digits_of_precision, z_score)


def false_negative_rate_wilson(y_true, y_pred):
    # aka miss rate
    assert len(y_true) == len(y_pred)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    return general_cm_wilson(fn, tp, digits_of_precision, z_score)


def mse_standard_normal(y_true, y_pred):
    assert len(y_true) == len(y_pred)
    squared_error = np.square(y_true - y_pred)
    sample_std = np.std(squared_error)
    mse = np.mean(squared_error)
    standard_error = z_score * sample_std / np.sqrt(len(y_true))
    return mse - standard_error, mse + standard_error


def mae_standard_normal(y_true, y_pred):
    assert len(y_true) == len(y_pred)
    absolute_error = np.abs(y_true - y_pred)
    sample_std = np.std(absolute_error)
    mae = np.mean(absolute_error)
    standard_error = z_score * sample_std / np.sqrt(len(y_true))
    return mae - standard_error, mae + standard_error


class FairnessMetricModule:
    def __init__(self, module_name=None, mapping=None):
        # default to fairlearn if no metrics module was specified
        if module_name is None:
            module_name = 'fairlearn.metrics'

        try:
            module = importlib.import_module(module_name)
        except ModuleNotFoundError:
            raise Exception(MODULE_NOT_INSTALLED_ERROR_MESSAGE
                            .format(module_name))

        try:
            self.MetricFrame = module.MetricFrame
        except AttributeError:
            raise Exception(METRICFRAME_NOT_AVAILABLE_ERROR_MESSAGE)

        # Raise exception if fairlearn pre-v0.5.0 is installed since
        # the metrics API had breaking changes.
        if module_name == 'fairlearn.metrics':
            import fairlearn
            if version.parse(fairlearn.__version__) < version.parse('0.5.0'):
                raise Exception(FAIRLEARN_PRE_V0_5_0_ERROR_MESSAGE)

        # use Fairlearn's metric mapping if no mapping is explicitly provided.
        if mapping is None:
            # The following mappings should match those in the GroupMetricSet
            # Issue 269 has been opened to track the work for unifying the two
            import sklearn.metrics as skm
            from fairlearn.metrics._extra_metrics import (
                _balanced_root_mean_squared_error, _mean_overprediction,
                _mean_underprediction, _root_mean_squared_error,
                false_negative_rate, false_positive_rate, mean_prediction,
                selection_rate, true_negative_rate)

            self._metric_methods = {
                "accuracy_score": {
                    "model_type": ["classification"],
                    "function": skm.accuracy_score,
                    "error_function": lambda y_true, y_pred:
                        wilson_wrapper(y_true, y_pred, skm.accuracy_score)
                },
                "balanced_accuracy_score": {
                    "model_type": ["classification"],
                    "function": skm.balanced_accuracy_score,
                },
                "precision_score": {
                    "model_type": ["classification"],
                    "function": skm.precision_score,
                    "error_function": precision_wilson
                },
                "recall_score": {
                    "model_type": ["classification"],
                    "function": skm.recall_score,
                    "error_function": recall_wilson
                },
                "zero_one_loss": {
                    "model_type": [],
                    "function": skm.zero_one_loss,
                },
                "specificity_score": {
                    "model_type": [],
                    "function": true_negative_rate,
                    "error_function": true_negative_rate_wilson
                },
                "miss_rate": {
                    "model_type": [],
                    "function": false_negative_rate,
                    "error_function": false_negative_rate_wilson
                },
                "fallout_rate": {
                    "model_type": [],
                    "function": false_positive_rate,
                    "error_function": false_positive_rate_wilson
                },
                "selection_rate": {
                    "model_type": [],
                    "function": selection_rate,
                    "error_function": lambda y_true, y_pred:
                        wilson_wrapper(y_true, y_pred, selection_rate)
                },
                "auc": {
                    "model_type": ["probability"],
                    "function": skm.roc_auc_score,
                },
                "root_mean_squared_error": {
                    "model_type": ["regression", "probability"],
                    "function": _root_mean_squared_error,
                },
                "balanced_root_mean_squared_error": {
                    "model_type": ["probability"],
                    "function": _balanced_root_mean_squared_error,
                },
                "mean_squared_error": {
                    "model_type": ["regression", "probability"],
                    "function": skm.mean_squared_error,
                    "error_function": mse_standard_normal
                },
                "mean_absolute_error": {
                    "model_type": ["regression", "probability"],
                    "function": skm.mean_absolute_error,
                    "error_function": mae_standard_normal
                },
                "r2_score": {
                    "model_type": ["regression"],
                    "function": skm.r2_score,
                },
                "f1_score": {
                    "model_type": ["classification"],
                    "function": skm.f1_score,
                },
                "log_loss": {
                    "model_type": ["probability"],
                    "function": skm.log_loss
                },
                "overprediction": {
                    "model_type": [],
                    "function": _mean_overprediction
                },
                "underprediction": {
                    "model_type": [],
                    "function": _mean_underprediction
                },
                "average": {
                    "model_type": [],
                    "function": mean_prediction
                }
            }
        else:
            self._metric_methods = mapping

        self.classification_methods = [
            method[0] for method in self._metric_methods.items()
            if "classification" in method[1]["model_type"]]
        self.regression_methods = [
            method[0] for method in self._metric_methods.items()
            if "regression" in method[1]["model_type"]]
        self.probability_methods = [
            method[0] for method in self._metric_methods.items()
            if "probability" in method[1]["model_type"]]
