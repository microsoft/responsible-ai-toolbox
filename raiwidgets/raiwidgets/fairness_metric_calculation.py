# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import importlib
from packaging import version


MODULE_NOT_INSTALLED_ERROR_MESSAGE = "{} is not installed. " \
    "Either install fairlearn or provide another fairness metric module."
FAIRLEARN_PRE_V0_5_0_ERROR_MESSAGE = "fairlearn<0.5.0 is not compatible " \
    "with raiwidgets. Please upgrade to the latest version."
METRICFRAME_NOT_AVAILABLE_ERROR_MESSAGE = "The fairness metric module " \
    "needs to provide a MetricFrame class to calculate metrics. For an " \
    "refer to fairlearn.metrics.MetricFrame"


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
                    "function": skm.accuracy_score
                },
                "balanced_accuracy_score": {
                    "model_type": ["classification"],
                    "function": skm.balanced_accuracy_score
                },
                "precision_score": {
                    "model_type": ["classification"],
                    "function": skm.precision_score
                },
                "recall_score": {
                    "model_type": ["classification"],
                    "function": skm.recall_score
                },
                "zero_one_loss": {
                    "model_type": [],
                    "function": skm.zero_one_loss
                },
                "specificity_score": {
                    "model_type": [],
                    "function": true_negative_rate
                },
                "miss_rate": {
                    "model_type": [],
                    "function": false_negative_rate
                },
                "fallout_rate": {
                    "model_type": [],
                    "function": false_positive_rate
                },
                "selection_rate": {
                    "model_type": [],
                    "function": selection_rate
                },
                "auc": {
                    "model_type": ["probability"],
                    "function": skm.roc_auc_score
                },
                "root_mean_squared_error": {
                    "model_type": ["regression", "probability"],
                    "function": _root_mean_squared_error
                },
                "balanced_root_mean_squared_error": {
                    "model_type": ["probability"],
                    "function": _balanced_root_mean_squared_error
                },
                "mean_squared_error": {
                    "model_type": ["regression", "probability"],
                    "function": skm.mean_squared_error
                },
                "mean_absolute_error": {
                    "model_type": ["regression", "probability"],
                    "function": skm.mean_absolute_error
                },
                "r2_score": {
                    "model_type": ["regression"],
                    "function": skm.r2_score
                },
                "f1_score": {
                    "model_type": ["classification"],
                    "function": skm.f1_score
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
