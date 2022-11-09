# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
from typing import Optional

import numpy as np
import pandas as pd

from raiwidgets.interfaces import WidgetRequestResponseConstants
from responsibleai.exceptions import SystemErrorException

TARGET = 'target'


class CheckResponsibleAIDashboardInputTestResult:
    def check_success_criteria(self, flask_server_prediction_output):
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert WidgetRequestResponseConstants.error not in \
            flask_server_prediction_output

        json.dumps(flask_server_prediction_output[
            WidgetRequestResponseConstants.data])

    def check_failure_criteria(self, flask_server_prediction_output,
                               expected_error_message):
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert len(
            flask_server_prediction_output[
                WidgetRequestResponseConstants.data]) == 0
        assert WidgetRequestResponseConstants.error in \
            flask_server_prediction_output
        assert expected_error_message in \
            flask_server_prediction_output[
                WidgetRequestResponseConstants.error]


class EmptyDataFrameException(SystemErrorException):
    """An exception indicating that some an empty dataframe
    is being used for prediction.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Empty data exception'


class ModelWrapperPredictions:
    """Model wrapper to wrap the samples used to train the models
    and the predictions of the model. This wrapper is useful when
    it is not possible to load the model.
    """
    def __init__(self, test_data: pd.DataFrame, y_pred: np.ndarray):
        """Creates an ModelWrapper object.

        :param test_data: The data that was used to train the model.
        :type test_data: pd.DataFrame
        :param y_pred: Predictions of the model.
        :type y_pred: np.ndarray
        """
        self._combined_data = test_data.copy()
        self._combined_data[TARGET] = y_pred

    def _get_filtered_data(
            self, query_test_data_row: pd.Series) -> pd.DataFrame:
        """Return the filtered data based on the query data.

        :param query_test_data_row: The query data instance.
        :type query_test_data_row: pd.Series
        :return: The filtered dataframe based on the values in query data.
        :rtype: pd.DataFrame
        """
        queries = []
        for column_name, column_data in query_test_data_row.iteritems():
            if isinstance(column_data, str):
                queries.append("`{}` == '{}'".format(
                    column_name, column_data))
            else:
                queries.append("`{}` == {}".format(
                    column_name, column_data))

        queries_str = '(' + ') & ('.join(queries) + ')'
        filtered_df = self._combined_data.query(queries_str)

        if len(filtered_df) == 0:
            raise EmptyDataFrameException(
                "The query data was not found in the combined dataset")

        return filtered_df

    def predict(self, query_test_data: pd.DataFrame) -> np.ndarray:
        """Return the predictions based on the query data.

        :param query_test_data: The data for which the predictions need to
            be returned.
        :type query_test_data: pd.DataFrame
        :return: Predictions of the model.
        :rtype: np.ndarray
        """
        prediction_output = []
        for _, row in query_test_data.iterrows():
            filtered_df = self._get_filtered_data(row)
            prediction_output.append(filtered_df[TARGET].values[0])

        return np.array(prediction_output)

    def __setstate__(self, state):
        """Set the state so that the wrapped model is
        serializable via pickle."""
        self._combined_data = state["_combined_data"]

    def __getstate__(self):
        """Return the state so that the wrapped model is
        serializable via pickle."""
        state = {}
        state["_combined_data"] = self._combined_data
        return state


class ModelWrapperPredictionsRegression(ModelWrapperPredictions):
    """Model wrapper to wrap the samples used to train the models
    and the predictions of the model for regression tasks.
    """
    def __init__(self, test_data: pd.DataFrame, y_pred: np.ndarray):
        """Creates an ModelWrapperPredictionsRegression object.

        :param test_data: The data that was used to train the model.
        :type test_data: pd.DataFrame
        :param y_pred: Predictions of the model.
        :type y_pred: np.ndarray
        """
        super(ModelWrapperPredictionsRegression, self).__init__(
            test_data, y_pred)


class ModelWrapperPredictionsClassification(ModelWrapperPredictions):
    """Model wrapper to wrap the samples used to train the models
    and the predictions of the model for classification tasks.
    """
    def __init__(self, test_data: pd.DataFrame, y_pred: np.ndarray,
                 y_pred_proba: Optional[np.ndarray] = None):
        """Creates an ModelWrapperPredictionsClassification object.

        :param test_data: The data that was used to train the model.
        :type test_data: pd.DataFrame
        :param y_pred: Predictions of the model.
        :type y_pred: np.ndarray
        :param y_pred_proba: Prediction probabilities of the model.
        :type y_pred_proba: np.ndarray
        """
        super(ModelWrapperPredictionsClassification, self).__init__(
            test_data, y_pred)
        self._num_classes = None
        if y_pred_proba is not None:
            for i in range(0, len(y_pred_proba[0])):
                self._combined_data[
                    TARGET + '_' + str(i)] = y_pred_proba[:, i]
            self._num_classes = len(y_pred_proba[0])

    def predict_proba(self, query_test_data: pd.DataFrame) -> np.ndarray:
        """Return the prediction probabilities based on the query data.

        :param query_test_data: The data for which the prediction
            probabilities need to be returned.
        :type query_test_data: pd.DataFrame
        :return: Prediction probabilities of the model.
        :rtype: np.ndarray
        """
        prediction_output = []
        for _, row in query_test_data.iterrows():
            filtered_df = self._get_filtered_data(row)
            classes_output = []
            for i in range(self._num_classes):
                classes_output.append(
                    filtered_df[TARGET + '_' + str(i)].values[0])
            prediction_output.append(classes_output)

        return np.array(prediction_output)

    def __setstate__(self, state):
        """Set the state so that the wrapped model is
        serializable via pickle."""
        super().__setstate__(state)
        self._num_classes = state["_num_classes"]

    def __getstate__(self):
        """Return the state so that the wrapped model is
        serializable via pickle."""
        state = super().__getstate__()
        state["_num_classes"] = self._num_classes
        return state
