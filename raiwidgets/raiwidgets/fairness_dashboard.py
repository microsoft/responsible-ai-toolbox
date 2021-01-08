# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the fairness dashboard class."""

from .dashboard import Dashboard
from .fairness_metric_calculation import FairnessMetricModule

from flask import jsonify, request
import numpy as np
import pandas as pd
from scipy.sparse import issparse


class FairnessDashboard(Dashboard):
    """The dashboard class, wraps the dashboard component.

    :param sensitive_features: A matrix of feature vector examples
        (# examples x # features), these can be from the initial dataset,
        or reserved from training.
    :type sensitive_features: numpy.array or list[][] or pandas.DataFrame
        or pandas.Series
    :param y_true: The true labels or values for the provided dataset.
    :type y_true: numpy.array or list[]
    :param y_pred: Array of output predictions from models to be evaluated.
        Can be a single array of predictions, or a 2D list over multiple
        models. Can be a dictionary of named model predictions.
    :type y_pred: numpy.array or list[][] or list[] or dict {string: list[]}
    :param sensitive_feature_names: Feature names
    :type sensitive_feature_names: numpy.array or list[]
    """

    def __init__(
            self, *,
            sensitive_features,
            y_true,
            y_pred,
            sensitive_feature_names=None,
            locale=None,
            public_ip=None,
            port=None,
            fairness_metric_module=None,
            fairness_metric_mapping=None):
        """Initialize the fairness dashboard."""

        metrics_module = FairnessMetricModule(
            module_name=fairness_metric_module,
            mapping=fairness_metric_mapping)

        if sensitive_features is None or y_true is None or y_pred is None:
            raise ValueError("Required parameters not provided")

        dataset = self._sanitize_data_shape(sensitive_features)
        model_names = None
        if isinstance(y_pred, dict):
            model_names = []
            self._y_pred = []
            for k, v in y_pred.items():
                model_names.append(k)
                self._y_pred.append(self._convert_to_list(v))
        else:
            self._y_pred = self._convert_to_list(y_pred)
        if len(np.shape(self._y_pred)) == 1:
            self._y_pred = [self._y_pred]
        self._y_true = self._convert_to_list(y_true)

        if np.shape(self._y_true)[0] != np.shape(self._y_pred)[1]:
            raise ValueError("Predicted y does not match true y shape")

        if np.shape(self._y_true)[0] != np.shape(dataset)[0]:
            raise ValueError("Sensitive features shape does not match true y "
                             "shape")

        fairness_input = {
            "true_y": self._y_true,
            "predicted_ys": self._y_pred,
            "dataset": dataset,
            "classification_methods":
                metrics_module.classification_methods,
            "regression_methods":
                metrics_module.regression_methods,
            "probability_methods":
                metrics_module.probability_methods,
        }

        if model_names is not None:
            fairness_input['model_names'] = model_names

        if locale is not None:
            fairness_input['locale'] = locale

        if sensitive_feature_names is not None:
            sensitive_feature_names = self._convert_to_list(
                sensitive_feature_names)
            if np.shape(dataset)[1] != np.shape(sensitive_feature_names)[0]:
                raise Warning("Feature names shape does not match dataset, "
                              "ignoring")
            fairness_input["features"] = sensitive_feature_names

        super(FairnessDashboard, self).__init__(
            dashboard_type="Fairness",
            model_data=fairness_input,
            public_ip=public_ip,
            port=port)

        self.fairness_metrics_module = metrics_module

        def metrics():
            try:
                data = request.get_json(force=True)

                if type(data["binVector"][0]) == np.int32:
                    data['binVector'] = [
                        str(bin_) for bin_ in data['binVector']]

                metric_method = self.fairness_metrics_module.\
                    _metric_methods.get(data["metricKey"]).get("function")
                metric_frame = self.fairness_metrics_module.MetricFrame(
                    metric_method,
                    self.model_data['true_y'],
                    self.model_data['predicted_ys'][data["modelIndex"]],
                    sensitive_features=data["binVector"])
                return jsonify({"data": {
                    "global": metric_frame.overall,
                    "bins": list(metric_frame.by_group.to_dict().values())
                }})
            except Exception as ex:
                import sys
                import traceback
                exc_type, exc_value, exc_traceback = sys.exc_info()

                return jsonify({
                    "error": str(ex),
                    "stacktrace": str(repr(traceback.format_exception(
                        exc_type, exc_value, exc_traceback))),
                    "locals": str(locals()),
                })

        self.add_url_rule(metrics, '/metrics', methods=["POST"])

    def _sanitize_data_shape(self, dataset):
        result = self._convert_to_list(dataset)
        # Dataset should be 2d, if not we need to map
        if (len(np.shape(result)) == 2):
            return result
        return list(map(lambda x: [x], result))

    def _convert_to_list(self, array):
        if issparse(array):
            if array.shape[1] > 1000:
                raise ValueError("Exceeds maximum number of features for "
                                 "visualization (1000)")
            return array.toarray().tolist()

        if (isinstance(array, pd.DataFrame) or isinstance(array, pd.Series)):
            return array.values.tolist()
        if (isinstance(array, np.ndarray)):
            return array.tolist()
        return array
