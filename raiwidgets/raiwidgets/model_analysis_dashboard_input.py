# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from .explanation_constants import \
    ExplanationDashboardInterface, WidgetRequestResponseConstants
from scipy.sparse import issparse
import numpy as np
import pandas as pd
from .constants import SKLearn
from .error_handling import _format_exception
from ._input_processing import _serialize_json_safe
from responsibleai import ModelAnalysis


class ModelAnalysisDashboardInput:
    def __init__(
            self,
            analysis: ModelAnalysis):
        """Initialize the Explanation Dashboard Input.

        :param analysis: An ModelAnalysis object that represents an explanation.
        :type analysis: ModelAnalysis
        """
        model = analysis.model
        self._analysis = analysis
        self._is_classifier = model is not None\
            and hasattr(model, SKLearn.PREDICT_PROBA) and \
            model.predict_proba is not None
        self._dataframeColumns = None
        self.dashboard_input = {}

        predicted_y = None
        feature_length = None

        dataset: pd.DataFrame = analysis.test.drop(
            [analysis.target_column], axis=1)

        if isinstance(dataset, pd.DataFrame) and hasattr(dataset, 'columns'):
            self._dataframeColumns = dataset.columns
        try:
            list_dataset = self._convert_to_list(dataset)
        except Exception as ex:
            ex_str = _format_exception(ex)
            raise ValueError(
                "Unsupported dataset type, inner error: {}".format(ex_str))
        if dataset is not None and model is not None:
            try:
                predicted_y = model.predict(dataset)
            except Exception as ex:
                ex_str = _format_exception(ex)
                msg = "Model does not support predict method for given"
                "dataset type, inner error: {}".format(
                    ex_str)
                raise ValueError(msg)
            try:
                predicted_y = self._convert_to_list(predicted_y)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Model prediction output of unsupported type,"
                    "inner error: {}".format(ex_str))
        if predicted_y is not None:
            self.dashboard_input[
                ExplanationDashboardInterface.PREDICTED_Y
            ] = predicted_y
        row_length = 0

        if list_dataset is not None:
            row_length, feature_length = np.shape(list_dataset)
            if row_length > 100000:
                raise ValueError(
                    "Exceeds maximum number of rows"
                    "for visualization (100000)")
            if feature_length > 1000:
                raise ValueError("Exceeds maximum number of features for"
                                 " visualization (1000). Please regenerate the"
                                 " explanation using fewer features or"
                                 " initialize the dashboard without passing a"
                                 " dataset.")
            self.dashboard_input[
                ExplanationDashboardInterface.TRAINING_DATA
            ] = _serialize_json_safe(list_dataset)

            self.dashboard_input[
                ExplanationDashboardInterface.IS_CLASSIFIER
            ] = self._is_classifier

        local_dim = None
        true_y = analysis.test[analysis.target_column]

        if true_y is not None and len(true_y) == row_length:
            self.dashboard_input[
                ExplanationDashboardInterface.TRUE_Y
            ] = self._convert_to_list(true_y)

        features = dataset.columns

        if features is not None:
            features = self._convert_to_list(features)
            if feature_length is not None and len(features) != feature_length:
                raise ValueError("Feature vector length mismatch:"
                                 " feature names length differs"
                                 " from local explanations dimension")
            self.dashboard_input[
                ExplanationDashboardInterface.FEATURE_NAMES
            ] = features

        classes = true_y.unique()
        if classes is not None:
            classes = self._convert_to_list(classes)
            if local_dim is not None and len(classes) != local_dim[0]:
                raise ValueError("Class vector length mismatch:"
                                 "class names length differs from"
                                 "local explanations dimension")
            self.dashboard_input[
                ExplanationDashboardInterface.CLASS_NAMES
            ] = classes
        if model is not None and hasattr(model, SKLearn.PREDICT_PROBA) \
                and model.predict_proba is not None and dataset is not None:
            try:
                probability_y = model.predict_proba(dataset)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError("Model does not support predict_proba method"
                                 " for given dataset type,"
                                 " inner error: {}".format(ex_str))
            try:
                probability_y = self._convert_to_list(probability_y)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Model predict_proba output of unsupported type,"
                    "inner error: {}".format(ex_str))
            self.dashboard_input[
                ExplanationDashboardInterface.PROBABILITY_Y
            ] = probability_y

    def on_predict(self, data):
        try:
            if self._dataframeColumns is not None:
                data = pd.DataFrame(data, columns=self._dataframeColumns)
            if (self._is_classifier):
                prediction = self._convert_to_list(
                    self._model.predict_proba(data))
            else:
                prediction = self._convert_to_list(self._model.predict(data))
            return {
                WidgetRequestResponseConstants.DATA: prediction
            }
        except Exception:
            return {
                WidgetRequestResponseConstants.ERROR: "Model threw exception"
                " while predicting...",
                WidgetRequestResponseConstants.DATA: []
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
