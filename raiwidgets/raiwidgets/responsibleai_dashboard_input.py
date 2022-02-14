# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import traceback
from typing import List, Optional

import numpy as np
import pandas as pd

from erroranalysis._internal.constants import ModelTask, display_name_to_metric
from responsibleai import RAIInsights
from responsibleai._input_processing import _convert_to_list

from ._cohort import Cohort, cohort_filter_json_converter
from .constants import ErrorMessages
from .error_handling import _format_exception
from .interfaces import WidgetRequestResponseConstants
from .utils import _is_classifier

EXP_VIZ_ERR_MSG = ErrorMessages.EXP_VIZ_ERR_MSG


class ResponsibleAIDashboardInput:
    def __init__(
            self,
            analysis: RAIInsights,
            cohort_list: Optional[List[Cohort]] = None):
        """Initialize the Explanation Dashboard Input.

        :param analysis:
            A RAIInsights object that represents an explanation.
        :type analysis: RAIInsights
        :param cohort_list:
            List of cohorts defined by the user for the dashboard.
        :type cohort_list: List[Cohort]
        """
        self._analysis = analysis
        model = analysis.model
        self._is_classifier = _is_classifier(model)
        self.dashboard_input = analysis.get_data()

        if cohort_list is not None:
            test_data = pd.DataFrame(
                data=self.dashboard_input.dataset.features,
                columns=self.dashboard_input.dataset.feature_names)
            if self.dashboard_input.dataset.task_type == \
                    ModelTask.CLASSIFICATION:
                class_names_list = self.dashboard_input.dataset.class_names
                true_y_array = self.dashboard_input.dataset.true_y
                true_class_array = np.array(
                    [class_names_list[index] for index in true_y_array])
                test_data[self.dashboard_input.dataset.target_column] = \
                    true_class_array
            else:
                test_data[self.dashboard_input.dataset.target_column] = \
                    self.dashboard_input.dataset.true_y

            for cohort in cohort_list:
                cohort._validate_with_test_data(
                    test_data=test_data,
                    target_column=self.dashboard_input.dataset.target_column,
                    is_classification=self._is_classifier)

        # Add cohort_list to dashboard_input
        self.dashboard_input.cohortData = json.loads(
            json.dumps(cohort_list,
                       default=cohort_filter_json_converter)
        )
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
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error: "Model threw exception"
                " while predicting..."
                "inner error: {}".format(e_str),
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
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate json tree representation,"
                    "inner error: {}".format(e_str),
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
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate json matrix representation,"
                    "inner error: {}".format(e_str),
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
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate feature importances,"
                    "inner error: {}".format(e_str),
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
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate causal what-if,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }
