# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import importlib


FAIRLEARN_NOT_INSTALLED_ERROR_MESSAGE = "fairlearn is not installed. " \
    "Either install fairlearn or provide another fairness metric module."


class FairnessMetricModule:
    def __init__(self, module_name=None, mapping=None):
        if module_name is None:
            module_name = 'fairlearn.metrics'

        try:
            module = importlib.import_module(module_name)
        except ModuleNotFoundError:
            raise Exception(FAIRLEARN_NOT_INSTALLED_ERROR_MESSAGE)

        # use Fairlearn's metric mapping if no mapping is explicitly provided.
        if mapping is None:
            # The following mappings should match those in the GroupMetricSet
            # Issue 269 has been opened to track the work for unifying the two
            self._metric_methods = {
                "accuracy_score": {
                    "model_type": ["classification"],
                    "function": module.accuracy_score_group_summary
                },
                "balanced_accuracy_score": {
                    "model_type": ["classification"],
                    "function": module.roc_auc_score_group_summary
                },
                "precision_score": {
                    "model_type": ["classification"],
                    "function": module.precision_score_group_summary
                },
                "recall_score": {
                    "model_type": ["classification"],
                    "function": module.recall_score_group_summary
                },
                "zero_one_loss": {
                    "model_type": [],
                    "function": module.zero_one_loss_group_summary
                },
                "specificity_score": {
                    "model_type": [],
                    "function": module.true_negative_rate_group_summary
                },
                "miss_rate": {
                    "model_type": [],
                    "function": module.false_negative_rate_group_summary
                },
                "fallout_rate": {
                    "model_type": [],
                    "function": module.false_positive_rate_group_summary
                },
                "false_positive_rate": {
                    "model_type": [],
                    "function": module.false_positive_rate_group_summary
                },
                "false_negative_rate": {
                    "model_type": [],
                    "function": module.false_negative_rate_group_summary
                },
                "selection_rate": {
                    "model_type": [],
                    "function": module.selection_rate_group_summary
                },
                "auc": {
                    "model_type": ["probability"],
                    "function": module.roc_auc_score_group_summary
                },
                "root_mean_squared_error": {
                    "model_type": ["regression", "probability"],
                    "function": module._root_mean_squared_error_group_summary
                },
                "balanced_root_mean_squared_error": {
                    "model_type": ["probability"],
                    "function":
                        module._balanced_root_mean_squared_error_group_summary
                },
                "mean_squared_error": {
                    "model_type": ["regression", "probability"],
                    "function": module.mean_squared_error_group_summary
                },
                "mean_absolute_error": {
                    "model_type": ["regression", "probability"],
                    "function": module.mean_absolute_error_group_summary
                },
                "r2_score": {
                    "model_type": ["regression"],
                    "function": module.r2_score_group_summary
                },
                # Issue #37 tracks the addition of new metrics.
                # "f1_score": {
                #     "model_type": ["classification"],
                #     "function": module.f1_score_group_summary
                # },
                # "log_loss": {
                #     "model_type": ["probability"],
                #     "function": module.log_loss_group_summary
                # },
                "overprediction": {
                    "model_type": [],
                    "function": module._mean_overprediction_group_summary
                },
                "underprediction": {
                    "model_type": [],
                    "function": module._mean_underprediction_group_summary
                },
                "average": {
                    "model_type": [],
                    "function": module.mean_prediction_group_summary
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
