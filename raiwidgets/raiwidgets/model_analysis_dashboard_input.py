# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from responsibleai import ModelAnalysis
from .constants import SKLearn
import pandas as pd
import numpy as np
from scipy.sparse import issparse
from .interfaces import WidgetRequestResponseConstants
import traceback


class ModelAnalysisDashboardInput:
    def __init__(
            self,
            analysis: ModelAnalysis):
        """Initialize the Explanation Dashboard Input.

        :param analysis:
            An ModelAnalysis object that represents an explanation.
        :type analysis: ModelAnalysis
        """
        self._analysis = analysis
        model = analysis.model
        self._is_classifier = model is not None\
            and hasattr(model, SKLearn.PREDICT_PROBA) and \
            model.predict_proba is not None
        self._dataframeColumns = None
        self.dashboard_input = analysis.get_data()
        self._feature_length = len(self.dashboard_input.dataset.featureNames)
        self._row_length = len(self.dashboard_input.dataset.features)
        self._error_analyzer = analysis.error_analysis.analyzer

    def on_predict(self, data):
        try:
            if self._dataframeColumns is not None:
                data = pd.DataFrame(data, columns=self._dataframeColumns)
            if (self._is_classifier):
                prediction = self._convert_to_list(
                    self._analysis.model.predict_proba(data))
            else:
                prediction = self._convert_to_list(
                    self._analysis.model.predict(data))
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
            features, filters, composite_filters, max_depth, num_leaves = data
            json_tree = self._error_analyzer.compute_error_tree(
                features, filters, composite_filters,
                max_depth, num_leaves)
            return {
                WidgetRequestResponseConstants.data: json_tree
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate json tree representation",
                WidgetRequestResponseConstants.data: []
            }

    def matrix(self, data):
        try:
            features, filters, composite_filters = data
            if features[0] is None and features[1] is None:
                return {WidgetRequestResponseConstants.data: []}
            json_matrix = self._error_analyzer.compute_matrix(
                features, filters, composite_filters)
            return {
                WidgetRequestResponseConstants.data: json_matrix
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

    def _convert_to_list(self, array):
        if issparse(array):
            if array.shape[1] > 1000:
                raise ValueError("Exceeds maximum number of features"
                                 " for visualization (1000). Please regenerate"
                                 " the explanation using fewer features"
                                 " or initialize the dashboard without passing"
                                 " a dataset.")
            return array.toarray().tolist()
        if (isinstance(array, pd.DataFrame)):
            return array.values.tolist()
        if (isinstance(array, pd.Series)):
            return array.values.tolist()
        if (isinstance(array, np.ndarray)):
            return array.tolist()
        if (isinstance(array, pd.Index)):
            return array.tolist()
        return array
