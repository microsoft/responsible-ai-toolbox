# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import warnings

import numpy as np
import pandas as pd

from raiutils.data_processing import convert_to_list, serialize_json_safe
from raiutils.models import is_classifier

from .constants import ErrorMessages
from .error_handling import _format_exception
from .explanation_constants import (ExplanationDashboardInterface,
                                    WidgetRequestResponseConstants)

EXP_VIZ_ERR_MSG = ErrorMessages.EXP_VIZ_ERR_MSG


class ExplanationDashboardInput:
    def __init__(
            self,
            explanation,
            model,
            dataset,
            true_y,
            classes,
            features):
        """Initialize the Explanation Dashboard Input.

        :param explanation: An object that represents an explanation.
        :type explanation: ExplanationMixin
        :param model: An object that represents a model.
        It is assumed that for the classification case
            it has a method of predict_proba() returning
            the prediction probabilities for each
            class and for the regression case a method of predict()
            returning the prediction value.
        :type model: object
        :param dataset: A matrix of feature vector examples
        (# examples x # features), the same samples
            used to build the explanation.
            Will overwrite any set on explanation object already.
            Must have fewer than
            100000 rows and fewer than 1000 columns.
            Note dashboard may become slow or crash for more than 10000 rows.
        :type dataset: numpy.ndarray or list[][]
        :param true_y: The true labels for the provided dataset.
            Will overwrite any set on
            explanation object already.
        :type true_y: numpy.ndarray or list[]
        :param classes: The class names.
        :type classes: numpy.ndarray or list[]
        :param features: Feature names.
        :type features: numpy.ndarray or list[]
        """
        self._model = model
        self._is_classifier = is_classifier(model)
        self._dataframeColumns = None
        self.dashboard_input = {}
        # List of explanations, key of explanation type is "explanation_type"
        if explanation is not None:
            self._mli_explanations = explanation.data(-1)["mli"]
        else:
            self._mli_explanations = None
        local_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_LOCAL_EXPLANATION_KEY)
        global_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_GLOBAL_EXPLANATION_KEY)
        ebm_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_EBM_GLOBAL_EXPLANATION_KEY)
        dataset_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_EXPLANATION_DATASET_KEY)

        if explanation is not None and hasattr(explanation, 'method'):
            self.dashboard_input[
                ExplanationDashboardInterface.EXPLANATION_METHOD
            ] = explanation.method

        predicted_y = None
        feature_length = None
        if dataset_explanation is not None:
            if dataset is None:
                dataset = dataset_explanation[
                    ExplanationDashboardInterface.MLI_DATASET_X_KEY
                ]
            if true_y is None:
                true_y = dataset_explanation[
                    ExplanationDashboardInterface.MLI_DATASET_Y_KEY
                ]

        if isinstance(dataset, pd.DataFrame) and hasattr(dataset, 'columns'):
            self._dataframeColumns = dataset.columns
            self._dfdtypes = dataset.dtypes
        try:
            list_dataset = convert_to_list(dataset, EXP_VIZ_ERR_MSG)
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
                predicted_y = convert_to_list(predicted_y, EXP_VIZ_ERR_MSG)
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
                warnings.warn("Exceeds maximum number of features for"
                              " visualization (1000)."
                              " Please regenerate the"
                              " explanation using fewer features or"
                              " initialize the dashboard without"
                              " passing a dataset. Dashboard will"
                              " show limited view.")
            else:
                self.dashboard_input[
                    ExplanationDashboardInterface.TRAINING_DATA
                ] = serialize_json_safe(list_dataset)
            self.dashboard_input[
                ExplanationDashboardInterface.IS_CLASSIFIER
            ] = self._is_classifier

        local_dim = None

        if true_y is not None and len(true_y) == row_length:
            self.dashboard_input[
                ExplanationDashboardInterface.TRUE_Y
            ] = convert_to_list(true_y, EXP_VIZ_ERR_MSG)

        if local_explanation is not None:
            try:
                local_explanation["scores"] = convert_to_list(
                    local_explanation["scores"], EXP_VIZ_ERR_MSG)
                local_explanation["intercept"] = convert_to_list(
                    local_explanation["intercept"], EXP_VIZ_ERR_MSG)
                # We can ignore perf explanation data.
                # Note if it is added back at any point,
                # the numpy values will need to be converted to python,
                # otherwise serialization fails.
                local_explanation["perf"] = None
                self.dashboard_input[
                    ExplanationDashboardInterface.LOCAL_EXPLANATIONS
                ] = local_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Unsupported local explanation type,"
                    "inner error: {}".format(ex_str))
            if list_dataset is not None:
                local_dim = np.shape(local_explanation["scores"])
                if len(local_dim) != 2 and len(local_dim) != 3:
                    raise ValueError(
                        "Local explanation expected to be a 2D or 3D list")
                if len(local_dim) == 2 and (local_dim[1] != feature_length or
                                            local_dim[0] != row_length):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        "length differs from dataset")
                if len(local_dim) == 3 and (local_dim[2] != feature_length or
                                            local_dim[1] != row_length):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        " length differs from dataset")
        if local_explanation is None and global_explanation is not None:
            try:
                global_explanation["scores"] = convert_to_list(
                    global_explanation["scores"], EXP_VIZ_ERR_MSG)
                if 'intercept' in global_explanation:
                    global_explanation["intercept"] = convert_to_list(
                        global_explanation["intercept"], EXP_VIZ_ERR_MSG)
                self.dashboard_input[
                    ExplanationDashboardInterface.GLOBAL_EXPLANATION
                ] = global_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError("Unsupported global explanation type,"
                                 "inner error: {}".format(ex_str))
        if ebm_explanation is not None:
            try:
                self.dashboard_input[
                    ExplanationDashboardInterface.EBM_EXPLANATION
                ] = ebm_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Unsupported ebm explanation type: {}".format(ex_str))

        if features is None\
                and explanation is not None\
                and hasattr(explanation, 'features')\
                and explanation.features is not None:
            features = explanation.features
        if features is not None:
            features = convert_to_list(features, EXP_VIZ_ERR_MSG)
            if feature_length is not None and len(features) != feature_length:
                raise ValueError("Feature vector length mismatch:"
                                 " feature names length differs"
                                 " from local explanations dimension")
            self.dashboard_input[
                ExplanationDashboardInterface.FEATURE_NAMES
            ] = features
        if classes is None\
                and explanation is not None\
                and hasattr(explanation, 'classes')\
                and explanation.classes is not None:
            classes = explanation.classes
        if classes is not None:
            classes = convert_to_list(classes, EXP_VIZ_ERR_MSG)
            if local_dim is not None and len(classes) != local_dim[0]:
                raise ValueError("Class vector length mismatch:"
                                 "class names length differs from"
                                 "local explanations dimension")
            self.dashboard_input[
                ExplanationDashboardInterface.CLASS_NAMES
            ] = classes
        if is_classifier(model) and dataset is not None:
            try:
                probability_y = model.predict_proba(dataset)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError("Model does not support predict_proba method"
                                 " for given dataset type,"
                                 " inner error: {}".format(ex_str))
            try:
                probability_y = convert_to_list(probability_y,
                                                EXP_VIZ_ERR_MSG)
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
                data = data.astype(dict(self._dfdtypes))
            if (self._is_classifier):
                prediction = convert_to_list(
                    self._model.predict_proba(data), EXP_VIZ_ERR_MSG)
            else:
                prediction = convert_to_list(self._model.predict(data),
                                             EXP_VIZ_ERR_MSG)
            return {
                WidgetRequestResponseConstants.DATA: prediction
            }
        except Exception:
            return {
                WidgetRequestResponseConstants.ERROR: "Model threw exception"
                " while predicting...",
                WidgetRequestResponseConstants.DATA: []
            }

    def _find_first_explanation(self, key):
        if self._mli_explanations is None:
            return None
        new_array = [explanation for explanation
                     in self._mli_explanations
                     if explanation[
                         ExplanationDashboardInterface.MLI_EXPLANATION_TYPE_KEY
                     ] == key]
        if len(new_array) > 0:
            return new_array[0]["value"]
        return None
