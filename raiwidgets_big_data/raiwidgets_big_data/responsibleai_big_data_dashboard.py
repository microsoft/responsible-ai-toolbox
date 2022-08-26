# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import traceback
from typing import List, Optional

import pandas as pd

from raiwidgets.cohort import Cohort
from raiwidgets.constants import ErrorMessages
from raiwidgets.error_handling import _format_exception
from raiwidgets.interfaces import WidgetRequestResponseConstants
from raiwidgets.model_overview.distribution.box_plot_distribution import \
    _get_box_plot_distribution
from raiwidgets.responsibleai_dashboard_input import \
    ResponsibleAIDashboardInput
from responsibleai import RAIInsights
from responsibleai.exceptions import UserConfigValidationException

EXP_VIZ_ERR_MSG = ErrorMessages.EXP_VIZ_ERR_MSG


class ResponsibleAIBigDataDashboardInput(ResponsibleAIDashboardInput):
    def __init__(
            self,
            analysis: RAIInsights,
            cohort_list: Optional[List[Cohort]] = None):
        """Initialize the ResponsibleAIBigDataDashboardInput class.

        :param analysis:
            A RAIInsights object that represents an explanation.
        :type analysis: RAIInsights
        :param cohort_list:
            List of cohorts defined by the user for the dashboard.
        :type cohort_list: List[Cohort]
        """
        super(ResponsibleAIBigDataDashboardInput, self).__init__(
            analysis=analysis,
            cohort_list=cohort_list)

    def get_local_counterfactuals(self, post_data):
        try:
            id, features = post_data
            counterfactuals = \
                self._analysis.counterfactual.request_counterfactuals(
                    id, pd.DataFrame.from_records(features))
            return {
                WidgetRequestResponseConstants.data: counterfactuals
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate local counterfactuals,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }

    def get_local_explanations(self, post_data):
        try:
            features = post_data
            serialized_local_explanations = \
                self._analysis.explainer.request_explanations(
                    local=True, data=pd.DataFrame.from_records(features))
            return {
                WidgetRequestResponseConstants.data:
                    serialized_local_explanations
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate local explanations,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }

    def get_global_explanations(self, post_data):
        try:
            filters = post_data[0]
            composite_filters = post_data[1]
            filtered_data_df = self._analysis.get_filtered_test_data(
                filters=filters,
                composite_filters=composite_filters,
                include_original_columns_only=True)

            serialized_global_explanations = \
                self._analysis.explainer.request_explanations(
                    local=False, data=filtered_data_df)
            return {
                WidgetRequestResponseConstants.data:
                    serialized_global_explanations
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate global explanations,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }

    def get_local_causal_effects(self, post_data):
        try:
            id, data = post_data
            data = pd.DataFrame(
                data, columns=self.dashboard_input.dataset.feature_names)

            local_effects = \
                self._analysis.causal.request_local_instance_effects(
                    id, data)
            return {
                WidgetRequestResponseConstants.data: local_effects
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate local causal effects,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }

    def get_model_overview_probability_distribution(self, post_data):
        try:
            filters = post_data[0]
            composite_filters = post_data[1]
            query_class = post_data[2]
            if self._analysis._classes is None:
                raise UserConfigValidationException(
                    "Classes are not defined for the model")

            class_index = None
            for index, class_name in enumerate(self._analysis._classes):
                if class_name == query_class:
                    class_index = index
                    break

            if class_index is None:
                raise UserConfigValidationException(
                    "Class {} is not defined for the model".format(
                        query_class))

            filtered_data_df = self._analysis.get_filtered_test_data(
                filters=filters,
                composite_filters=composite_filters,
                include_original_columns_only=True)
            predict_proba = self._analysis.model.predict_proba(
                filtered_data_df)

            probability_distribution = \
                _get_box_plot_distribution(
                    predict_proba[class_index])
            return {
                WidgetRequestResponseConstants.data: probability_distribution
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate the probability distribution,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }
