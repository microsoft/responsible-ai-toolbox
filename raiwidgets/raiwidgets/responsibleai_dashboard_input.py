# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import traceback

import pandas as pd

from erroranalysis._internal.constants import display_name_to_metric
from responsibleai import RAIInsights
from responsibleai._input_processing import _convert_to_list

from .constants import ErrorMessages
from .interfaces import WidgetRequestResponseConstants
from .utils import _is_classifier

EXP_VIZ_ERR_MSG = ErrorMessages.EXP_VIZ_ERR_MSG


class ResponsibleAIDashboardInput:
    def __init__(
            self,
            analysis: RAIInsights):
        """Initialize the Explanation Dashboard Input.

        :param analysis:
            A RAIInsights object that represents an explanation.
        :type analysis: RAIInsights
        """
        self._analysis = analysis
        model = analysis.model
        self._is_classifier = _is_classifier(model)
        self.dashboard_input = analysis.get_data()
        self._feature_length = len(self.dashboard_input.dataset.feature_names)
        self._row_length = len(self.dashboard_input.dataset.features)
        self._error_analyzer = analysis.error_analysis._analyzer

    def on_predict(self, data):
        try:
            data = pd.DataFrame(
                data, columns=self.dashboard_input.dataset.feature_names)
            if (self._is_classifier):
                prediction = _convert_to_list(
                    self._analysis.model.predict_proba(data), EXP_VIZ_ERR_MSG)
            else:
                prediction = _convert_to_list(
                    self._analysis.model.predict(data), EXP_VIZ_ERR_MSG)
            return {
                WidgetRequestResponseConstants.data: prediction
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.error: "Model threw exception"
                " while predicting...",
                WidgetRequestResponseConstants.data: []
            }

    def debug_ml(self, data):
        try:
            features = data[0]
            filters = data[1]
            composite_filters = data[2]
            max_depth = data[3]
            num_leaves = data[4]
            min_child_samples = data[5]
            metric = display_name_to_metric[data[6]]
            self._error_analyzer.update_metric(metric)
            tree = self._error_analyzer.compute_error_tree(
                features, filters, composite_filters,
                max_depth, num_leaves, min_child_samples)
            return {
                WidgetRequestResponseConstants.data: tree
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.error:
                    f"Failed to generate json tree representation:{str(e)}",
                WidgetRequestResponseConstants.data: []
            }

    def matrix(self, data):
        try:
            features = data[0]
            if features[0] is None and features[1] is None:
                return {WidgetRequestResponseConstants.data: []}
            filters = data[1]
            composite_filters = data[2]
            quantile_binning = data[3]
            num_bins = data[4]
            metric = display_name_to_metric[data[5]]
            self._error_analyzer.update_metric(metric)
            matrix = self._error_analyzer.compute_matrix(
                features, filters, composite_filters,
                quantile_binning, num_bins)
            return {
                WidgetRequestResponseConstants.data: matrix
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate json matrix representation",
                WidgetRequestResponseConstants.data: []
            }

    def importances(self):
        try:
            scores = self._error_analyzer.compute_importances()
            return {
                WidgetRequestResponseConstants.data: scores
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate feature importances",
                WidgetRequestResponseConstants.data: []
            }

    def causal_whatif(self, post_data):
        try:
            id, features, feature_name, new_value, target = post_data
            whatif = self._analysis.causal._whatif(
                id, pd.DataFrame.from_records(features), new_value,
                feature_name, target)
            return {
                WidgetRequestResponseConstants.data: whatif
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate causal what-if",
                WidgetRequestResponseConstants.data: []
            }
