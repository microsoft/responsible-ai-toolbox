# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import importlib
from packaging import version
import numpy as np
from sklearn.metrics import confusion_matrix
from scipy import stats

import sklearn.metrics as skm
from fairlearn.metrics._extra_metrics import (
    _balanced_root_mean_squared_error, _mean_overprediction,
    _mean_underprediction, _root_mean_squared_error,
    false_negative_rate, false_positive_rate, mean_prediction,
    selection_rate, true_negative_rate)

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
    """ Returns lower and upper bound 
    
    Binomial Proportion
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


def compute_standard_normal_error_binomial(metric_value, sample_size, z_score):
    """ Standard Error Calculation (Binary Classification)

    Assumes infinitely large population,
    Should be used when the sampling fraction is small.
    For sampling fraction > 5%, may want to use finite population correction
    https://en.wikipedia.org/wiki/Margin_of_error

    Note: 
        Returns absolute error (%)
    """
    return z_score * np.sqrt(metric_value * (1.0 - metric_value)) / np.sqrt(sample_size)

def compute_standard_normal_error(metric_value, y_true, y_pred, sample_size, z_score):
    """ Standard Error Calculation

    Attempting to generalize for regression/probability tasks. Incomplete

    """

    # return z_score * np.sqrt() / np.sqrt(sample_size)
    return

def wilson_wrapper(y_true, y_pred, func):
    assert len(y_true) == len(y_pred)
    p = func(y_true, y_pred)
    n = len(y_true)
    result = compute_wilson_bounds(p, n, digits_of_precision, z_score)
    if float('nan') in result:
        return [None, None]
    return result

# custom recall/precision error bar functions to have n =/= len(y_pred)
# because it should be n = (tp + fn) and n = (tp+fp), respectively
def recall_wilson(y_true, y_pred):
    assert len(y_true) == len(y_pred)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    bounds = compute_wilson_bounds(tp / (tp + fn), tp + fn, digits_of_precision, z_score)
    return bounds

def precision_wilson(y_true, y_pred):
    assert len(y_true) == len(y_pred)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    bounds = compute_wilson_bounds(tp / (tp + fp), tp + fp, digits_of_precision, z_score)
    return bounds

def standard_normal_wrapper(y_true, y_pred, func):
    assert len(y_true) == len(y_pred)
    metric_value = func(y_true, y_pred)
    sample_size = len(y_true)
    error = compute_standard_normal_error(metric_value, sample_size, z_score)
    return (metric_value - error, metric_value + error)

def rmse_standard_normal(y_true, y_pred):
    assert len(y_true) == len(y_pred)
    rmse = _root_mean_squared_error(y_true, y_pred)
    sample_size = len(y_true)

    c1, c2 = stats.chi2.ppf([(1 - alpha) / 2, (1 + alpha) / 2], sample_size)
    return np.sqrt(sample_size / c2) * rmse, np.sqrt(sample_size / c1) * rmse

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
                    "error_function": lambda y_true, y_pred: wilson_wrapper(y_true, y_pred, skm.accuracy_score)
                },
                "balanced_accuracy_score": {
                    "model_type": ["classification"],
                    "function": skm.balanced_accuracy_score,
                    "error_function": lambda y_true, y_pred: wilson_wrapper(y_true, y_pred, skm.balanced_accuracy_score)
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
                    #"error_function": lambda y_true, y_pred: standard_normal_wrapper(y_true, y_pred, skm.zero_one_loss)
                },
                "specificity_score": {
                    "model_type": [],
                    "function": true_negative_rate,
                    "error_function": lambda y_true, y_pred: wilson_wrapper(y_true, y_pred, true_negative_rate)
                },
                "miss_rate": {
                    "model_type": [],
                    "function": false_negative_rate,
                    "error_function": lambda y_true, y_pred: wilson_wrapper(y_true, y_pred, false_negative_rate)
                },
                "fallout_rate": {
                    "model_type": [],
                    "function": false_positive_rate,
                    "error_function": lambda y_true, y_pred: wilson_wrapper(y_true, y_pred, false_positive_rate)
                },
                "selection_rate": {
                    "model_type": [],
                    "function": selection_rate,
                    "error_function": lambda y_true, y_pred: wilson_wrapper(y_true, y_pred, selection_rate)
                },
                "auc": {
                    "model_type": ["probability"],
                    "function": skm.roc_auc_score,
                    #"error_function": lambda y_true, y_pred: standard_normal_wrapper(y_true, y_pred, skm.roc_auc_score)
                },
                "root_mean_squared_error": {
                    "model_type": ["regression", "probability"],
                    "function": _root_mean_squared_error,
                    "error_function": rmse_standard_normal
                },
                "balanced_root_mean_squared_error": {
                    "model_type": ["probability"],
                    "function": _balanced_root_mean_squared_error,
                    #"error_function": lambda y_true, y_pred: standard_normal_wrapper(y_true, y_pred, _balanced_root_mean_squared_error)
                },
                "mean_squared_error": {
                    "model_type": ["regression", "probability"],
                    "function": skm.mean_squared_error,
                    #"error_function": lambda y_true, y_pred: standard_normal_wrapper(y_true, y_pred, skm.mean_squared_error)
                },
                "mean_absolute_error": {
                    "model_type": ["regression", "probability"],
                    "function": skm.mean_absolute_error,
                    #"error_function": lambda y_true, y_pred: standard_normal_wrapper(y_true, y_pred, skm.mean_absolute_error)
                },
                "r2_score": {
                    "model_type": ["regression"],
                    "function": skm.r2_score,
                    #"error_function": lambda y_true, y_pred: standard_normal_wrapper(y_true, y_pred, skm.r2_score)
                },
                "f1_score": {
                    "model_type": ["classification"],
                    "function": skm.f1_score,
                    "error_function": lambda y_true, y_pred: wilson_wrapper(y_true, y_pred, skm.f1_score)
                },
                "log_loss": {
                    "model_type": ["probability"],
                    "function": skm.log_loss,
                    "error_function": lambda y_true, y_pred: wilson_wrapper(y_true, y_pred, skm.log_loss)
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
