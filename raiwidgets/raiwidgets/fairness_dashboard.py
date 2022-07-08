# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the fairness dashboard class."""

import numpy as np
from flask import jsonify, request

from raiutils.data_processing import (convert_to_list,
                                      convert_to_string_list_dict)

from .dashboard import Dashboard
from .fairness_metric_calculation import FairnessMetricModule


class FairnessDashboard(Dashboard):
    """The dashboard class, wraps the dashboard component.

    :param sensitive_features: The sensitive features
        These can be from the initial dataset, or reserved from training.
        If the input type provides names, they will be used. Otherwise,
        names of "Sensitive Feature <n>" are generated
    :type sensitive_features: pandas.Series, pandas.DataFrame, list,
        Dict[str,1d array] or something convertible to numpy.ndarray
    :param y_true: The true labels or values for the provided dataset.
    :type y_true: numpy.ndarray or list[]
    :param y_pred: Array of output predictions from models to be evaluated.
        If the input type provides names, they will be used. Otherwise,
        names of "Model <n>" are generated
    :type y_pred: pandas.Series, pandas.DataFrame, list, Dict[str,1d array]
        or something convertible to numpy.ndarray
    :param locale: The language in which user wants to load and access the
        Fairness Dashboard. The default language is english ("en").
    :type locale: str
    :param public_ip: Optional. If running on a remote vm,
        the external public ip address of the VM.
    :type public_ip: str
    :param port: The port to use on locally hosted service.
    :type port: int
    """
    def __init__(
            self, *,
            sensitive_features,
            y_true,
            y_pred,
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

        model_dict = convert_to_string_list_dict("Model {0}",
                                                 y_pred,
                                                 y_true)
        sf_dict = convert_to_string_list_dict("Sensitive Feature {0}",
                                              sensitive_features,
                                              y_true)

        # Make sure that things are as the TS layer expects
        self._y_true = convert_to_list(y_true)
        self._y_pred = list(model_dict.values())
        # Note transpose in the following
        dataset = (np.array(list(sf_dict.values())).T).tolist()

        if np.shape(self._y_true)[0] != np.shape(self._y_pred)[1]:
            raise ValueError("Predicted y does not match true y shape")

        if np.shape(self._y_true)[0] != np.shape(dataset)[0]:
            raise ValueError("Sensitive features shape does not match true y "
                             "shape")

        fairness_input = {
            "true_y": self._y_true,
            "model_names": list(model_dict.keys()),
            "predicted_ys": self._y_pred,
            "features": list(sf_dict.keys()),
            "dataset": dataset,
            "classification_methods":
                metrics_module.classification_methods,
            "regression_methods":
                metrics_module.regression_methods,
            "probability_methods":
                metrics_module.probability_methods,
        }

        super(FairnessDashboard, self).__init__(
            dashboard_type="Fairness",
            model_data=fairness_input,
            public_ip=public_ip,
            port=port,
            locale=locale)

        self.fairness_metrics_module = metrics_module

        def metrics():
            """
            Note:
                This function always calculates the error_function,
                if available, so that the value is cached in the MetricsCache

            Request attributes:
                binVector: the sensitive features binning vector
                metricKey: the metricKey that corresponds to the function that
                    will be calculated
                modelIndex: the model index used to index the predicted y's
                    by that model
            """
            try:
                data = request.get_json(force=True)

                if type(data["binVector"][0]) == np.int32:
                    data['binVector'] = [
                        str(bin_) for bin_ in data['binVector']]

                metric_name = data['metricKey']
                error_function_name = f"{metric_name} bounds"
                metric_function = \
                    self.fairness_metrics_module._metric_methods.get(
                        data["metricKey"]).get("function")
                metric_method = {
                    metric_name: metric_function
                }
                error_function = \
                    self.fairness_metrics_module._metric_methods.get(
                        data["metricKey"]).get("error_function")
                if error_function is not None:
                    metric_method.update({error_function_name: error_function})

                metric_frame = self.fairness_metrics_module.MetricFrame(
                    metrics=metric_method,
                    y_true=self.model_data['true_y'],
                    y_pred=self.model_data['predicted_ys'][data["modelIndex"]],
                    sensitive_features=data["binVector"])

                result = {"data": {
                    "global": metric_frame.overall[metric_name],
                    "bins": list([
                        entry for entry in
                        list(metric_frame.by_group.to_dict().values())
                        if not isinstance(entry[0], tuple)
                    ][0].values()),
                }}
                if error_function_name in metric_method:
                    result["data"].update({
                        "bounds": {
                            "lower":
                            metric_frame.overall[error_function_name][0],
                            "upper":
                            metric_frame.overall[error_function_name][1],
                        },
                        # [(x1, y1), (x2, y2), (x3, y3)...]
                        "binBounds": [{
                            "lower": bounds[0],
                            "upper": bounds[1]
                        }
                            for bounds in list(
                                metric_frame.by_group[error_function_name]\
                                .to_dict().values())]
                    })
                return jsonify(result)
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
