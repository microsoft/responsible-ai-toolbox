# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import traceback
from typing import List, Optional

import numpy as np
import pandas as pd

from erroranalysis._internal.constants import display_name_to_metric
from raiutils.cohort import Cohort, CohortFilter, CohortFilterMethods
from raiutils.data_processing import convert_to_list, serialize_json_safe
from raiutils.exceptions import UserConfigValidationException
from raiutils.models import ModelTask, is_classifier
from raiwidgets.constants import ErrorMessages
from raiwidgets.error_handling import _format_exception
from raiwidgets.interfaces import WidgetRequestResponseConstants
from responsibleai import RAIInsights
from responsibleai._internal.constants import ManagerNames

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
        self._is_classifier = is_classifier(model)
        self.dashboard_input = analysis.get_data()

        self._validate_cohort_list(cohort_list)

        self._feature_length = len(self.dashboard_input.dataset.feature_names)
        if hasattr(analysis, ManagerNames.ERROR_ANALYSIS):
            self._error_analyzer = analysis.error_analysis._analyzer

    def _generate_time_series_cohorts(self):
        """Generate time series cohorts based on time series ID columns."""
        cohort_list = []
        ts_id_cols = self._analysis._feature_metadata.time_series_id_features
        all_time_series = self._analysis.test[ts_id_cols].value_counts().index
        for time_series_id_values in all_time_series:
            column_value_combinations = zip(
                ts_id_cols,
                time_series_id_values)
            id_columns_name_value_mapping = []
            filters = []
            for (col, val) in column_value_combinations:
                id_columns_name_value_mapping.append(f"{col} = {val}")
                filters.append(CohortFilter(
                    method=CohortFilterMethods.METHOD_INCLUDES,
                    arg=[val],
                    column=col))
            time_series = Cohort(", ".join(id_columns_name_value_mapping))
            for filter in filters:
                time_series.add_cohort_filter(filter)
            cohort_list.append(time_series)
        return cohort_list

    def _validate_cohort_list(self, cohort_list=None):
        task_type = self.dashboard_input.dataset.task_type
        if (task_type != ModelTask.FORECASTING and
                cohort_list is None):
            self.dashboard_input.cohortData = []
            return

        if task_type == ModelTask.FORECASTING:
            # Ensure user did not pass cohort_list and
            # use the generated time series.
            if cohort_list is not None:
                raise UserConfigValidationException(
                    "cohort_list is not supported for forecasting analysis.")
            # use generated time series
            cohort_list = self._generate_time_series_cohorts()

        if not isinstance(cohort_list, list):
            raise UserConfigValidationException(
                "cohort_list parameter should be a list.")

        if not all(isinstance(entry, Cohort) for entry in cohort_list):
            raise UserConfigValidationException(
                "All entries in cohort_list should be of type Cohort.")

        all_cohort_names = [cohort.name for cohort in cohort_list]
        unique_cohort_names = np.unique(all_cohort_names).tolist()

        if len(unique_cohort_names) != len(all_cohort_names):
            raise UserConfigValidationException(
                "Found cohorts with duplicate names. "
                "All pre-defined cohorts need to have distinct names.")

        test_data = pd.DataFrame(
            data=self.dashboard_input.dataset.features,
            columns=self.dashboard_input.dataset.feature_names)
        if task_type == ModelTask.CLASSIFICATION:
            class_names_list = self.dashboard_input.dataset.class_names
            true_y_array = self.dashboard_input.dataset.true_y
            true_class_array = np.array(
                [class_names_list[index] for index in true_y_array])
            test_data[self.dashboard_input.dataset.target_column] = \
                true_class_array
        else:
            test_data[self.dashboard_input.dataset.target_column] = \
                self.dashboard_input.dataset.true_y

        categorical_features = \
            self.dashboard_input.dataset.categorical_features
        for cohort in cohort_list:
            cohort._validate_with_test_data(
                test_data=test_data,
                target_column=self.dashboard_input.dataset.target_column,
                categorical_features=categorical_features,
                is_classification=self._is_classifier)

        self.dashboard_input.cohortData = cohort_list

    def on_predict(self, data):
        try:
            data = pd.DataFrame(
                data, columns=self.dashboard_input.dataset.feature_names)
            data = self._analysis.get_test_data(test_data=data)
            if (self._is_classifier):
                prediction = convert_to_list(
                    self._analysis.model.predict_proba(data), EXP_VIZ_ERR_MSG)
            else:
                prediction = convert_to_list(
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

    def _prepare_filtered_error_analysis_data(self, features, filters,
                                              composite_filters, metric):
        filtered_data_df = self._analysis.get_filtered_test_data(
            filters=filters,
            composite_filters=composite_filters,
            include_original_columns_only=False)

        msg = "Feature {} not found in dataset. Existing features: {}"
        for feature in features:
            if feature is None:
                continue
            if feature not in filtered_data_df.columns:
                raise UserConfigValidationException(
                    msg.format(feature, filtered_data_df.columns))

        self._error_analyzer.update_metric(metric)
        return filtered_data_df

    def debug_ml(self, data):
        try:
            features = data[0]
            filters = data[1]
            composite_filters = data[2]
            max_depth = data[3]
            num_leaves = data[4]
            min_child_samples = data[5]
            metric = display_name_to_metric[data[6]]

            filtered_data_df = self._prepare_filtered_error_analysis_data(
                features, filters, composite_filters, metric)

            tree = self._error_analyzer.compute_error_tree_on_dataset(
                features, filtered_data_df,
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

            filtered_data_df = self._prepare_filtered_error_analysis_data(
                features, filters, composite_filters, metric)

            matrix = self._error_analyzer.compute_matrix_on_dataset(
                features, filtered_data_df,
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
                id, self._analysis.get_test_data(
                    test_data=pd.DataFrame.from_records(features)), new_value,
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

    def get_exp(self, index):
        try:
            # index 0 = index of the image
            # index 1 = index of the object
            if self.dashboard_input.dataset.task_type == "object_detection":
                exp = self._analysis.explainer.compute_single_explanation(
                    index=index[0],
                    object_index=index[1])
            else:
                exp = self._analysis.explainer.compute_single_explanation(
                    index)
            return {
                WidgetRequestResponseConstants.data: exp
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate image explanation,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }

    def get_global_causal_effects(self, post_data):
        try:
            id = post_data[0]
            filters = post_data[1]
            composite_filters = post_data[2]
            filtered_data_df = self._analysis.get_filtered_test_data(
                filters=filters,
                composite_filters=composite_filters,
                include_original_columns_only=True)

            global_effects = \
                serialize_json_safe(
                    self._analysis.causal.request_global_cohort_effects(
                        id, filtered_data_df))
            return {
                WidgetRequestResponseConstants.data: global_effects
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate global causal effects for cohort,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }

    def get_global_causal_policy(self, post_data):
        try:
            id = post_data[0]
            filters = post_data[1]
            composite_filters = post_data[2]
            filtered_data_df = self._analysis.get_filtered_test_data(
                filters=filters,
                composite_filters=composite_filters,
                include_original_columns_only=True)

            global_policy = \
                serialize_json_safe(
                    self._analysis.causal.request_global_cohort_policy(
                        id, filtered_data_df))
            return {
                WidgetRequestResponseConstants.data: global_policy
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate global causal policy for cohort,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }

    def get_object_detection_metrics(self, post_data):
        """Flask endpoint function to get Model Overview metrics
        for the Object Detection scenario.

        :param post_data: List of inputs in the order
        [true_y, predicted_y, aggregate_method, class_name, iou_threshold].
        :type post_data: List

        :return: JSON/dict data response
        :rtype: Dict[str, List]
        """
        try:
            selection_indexes = post_data[0]
            aggregate_method = post_data[1]
            class_name = post_data[2]
            iou_threshold = post_data[3]
            object_detection_cache = post_data[4]
            exp = self._analysis.compute_object_detection_metrics(
                selection_indexes,
                aggregate_method,
                class_name,
                iou_threshold,
                object_detection_cache
            )
            return {
                WidgetRequestResponseConstants.data: exp
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to get Object Detection Model Overview metrics,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }

    def forecast(self, post_data):
        # This is a separate function from predict since we apply
        # transformations to an entire time series. That enables us
        # to only send the transformation information from UI to backend
        # rather than having to send the entire time series across.
        try:
            filters = post_data[0]
            composite_filters = post_data[1]
            transformation = post_data[2]
            filtered_data_df = self._analysis.get_filtered_test_data(
                filters=filters,
                composite_filters=composite_filters,
                include_original_columns_only=True)

            transformation_func = None
            # transforming with pandas
            if len(transformation) > 0:
                op, feature, value = transformation
                if op == "add":
                    def add(x):
                        return x + float(value)
                    transformation_func = add
                elif op == "subtract":
                    def subtract(x):
                        return x - float(value)
                    transformation_func = subtract
                elif op == "multiply":
                    def multiply(x):
                        return x * float(value)
                    transformation_func = multiply
                elif op == "divide":
                    def divide(x):
                        return x / float(value)
                    transformation_func = divide
                elif op == "change":
                    def change(x):
                        return float(value)
                    transformation_func = change
                else:
                    raise ValueError(
                        f"An invalid transformation operation {op} "
                        "was provided.")

                filtered_data_df[feature] = \
                    filtered_data_df[feature].map(transformation_func)

            predictions = convert_to_list(
                self._analysis.model.forecast(filtered_data_df),
                EXP_VIZ_ERR_MSG)
            # forecast should return a flat list of predictions
            if all([len(p) == 1 for p in predictions]):
                predictions = [p[0] for p in predictions]
            return {
                WidgetRequestResponseConstants.data: predictions
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate forecast for time series, "
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }

    def get_question_answering_metrics(self, post_data):
        """Flask endpoint function to get Model Overview metrics
        for the Question Answering scenario.

        :param post_data: List of inputs in the order
        [true_y, predicted_y, aggregate_method, class_name, iou_threshold].
        :type post_data: List

        :return: JSON/dict data response
        :rtype: Dict[str, List]
        """
        try:
            selection_indexes = post_data[0]
            question_answering_cache = post_data[1]
            exp = self._analysis.compute_question_answering_metrics(
                selection_indexes,
                question_answering_cache
            )
            return {
                WidgetRequestResponseConstants.data: exp
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            e_str = _format_exception(e)
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to get Question Answering Model Overview metrics,"
                    "inner error: {}".format(e_str),
                WidgetRequestResponseConstants.data: []
            }
