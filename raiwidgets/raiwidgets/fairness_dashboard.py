# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the fairness dashboard class."""

from .dashboard import Dashboard
from .fairness_metric_calculation import FairnessMetricModule
from ._input_processing import _convert_to_string_list_dict, _convert_to_list

from flask import jsonify, request
import numpy as np

from sklearn.metrics import recall_score, accuracy_score, confusion_matrix
z_score = 1.959964
digits_of_precision = 4


def wilson(p, n, digits=digits_of_precision, z=z_score):
    """ Returns lower and upper bound """
    denominator = 1 + z**2 / n
    centre_adjusted_probability = p + z * z / (2 * n)
    adjusted_standard_deviation = np.sqrt(
        (p * (1 - p) + z * z / (4 * n))) / np.sqrt(n)
    lower_bound = (centre_adjusted_probability - z *
                   adjusted_standard_deviation) / denominator
    upper_bound = (centre_adjusted_probability + z *
                   adjusted_standard_deviation) / denominator
    return (round(lower_bound, digits), round(upper_bound, digits))


def compute_error_metric(metric_value, sample_size, z_score):
    """ Standard Error Calculation (Binary Classification)

    Assumes infinitely large population,
    Should be used when the sampling fraction is small.
    For sampling fraction > 5%, may want to use finite population correction
    https://en.wikipedia.org/wiki/Margin_of_error

    Note: 
        Returns absolute error (%)
    """
    return z_score * np.sqrt(metric_value * (1.0 - metric_value)) / np.sqrt(sample_size)


def recall_wilson(y_true, y_pred):
    assert len(y_true) == len(y_pred)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    bounds = wilson(tp / (tp + fn), tp + fn, digits_of_precision, z_score)
    return bounds


def recall_normal_err(y_t, y_p):
    assert len(y_t) == len(y_p)
    tn, fp, fn, tp = confusion_matrix(y_t, y_p).ravel()
    error = compute_error_metric(tp / (tp + fn), tp + fn, z_score=z_score)
    return (error, error)


def accuracy_wilson(y_true, y_pred):
    assert len(y_true) == len(y_pred)
    score = accuracy_score(y_true, y_pred)
    bounds = wilson(score, len(y_true), digits_of_precision, z_score)
    return bounds


def accuracy_normal_err(y_true, y_pred):
    assert len(y_true) == len(y_pred)
    score = accuracy_score(y_true, y_pred)
    error = compute_error_metric(score, len(y_true), z_score)
    return (error, error)


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
            fairness_metric_mapping=None,
            custom_metric_functions={"Recall Wilson": 
                {
                    "model_type": ["error"],
                    "function": recall_wilson
                }
            }):
        """Initialize the fairness dashboard."""

        metrics_module = FairnessMetricModule(
            module_name=fairness_metric_module,
            mapping=fairness_metric_mapping)

        metrics_module._metric_methods.update(custom_metric_functions)
        metrics_module.error_methods = [
            method[0] for method in metrics_module._metric_methods.items()
            if "method" in method[1]["model_type"]]

        if sensitive_features is None or y_true is None or y_pred is None:
            raise ValueError("Required parameters not provided")

        model_dict = _convert_to_string_list_dict("Model {0}",
                                                  y_pred,
                                                  y_true)
        sf_dict = _convert_to_string_list_dict("Sensitive Feature {0}",
                                               sensitive_features,
                                               y_true)

        # Make sure that things are as the TS layer expects
        self._y_true = _convert_to_list(y_true)
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
            "error_methods":
                metrics_module.error_methods
        }

        super(FairnessDashboard, self).__init__(
            dashboard_type="Fairness",
            model_data=fairness_input,
            public_ip=public_ip,
            port=port,
            locale=locale)

        self.fairness_metrics_module = metrics_module

        def metrics():
            try:
                data = request.get_json(force=True)

                if type(data["binVector"][0]) == np.int32:
                    data['binVector'] = [
                        str(bin_) for bin_ in data['binVector']]

                custom_metric_function = True
                if custom_metric_function is not None:
                    metric_method = {
                        data["metricKey"]: self.fairness_metrics_module._metric_methods.get(data["metricKey"]).get("function"),
                        "Recall Wilson": recall_wilson
                    }
                else:
                    metric_method = self.fairness_metrics_module.\
                        _metric_methods.get(data["metricKey"]).get("function")
                metric_frame = self.fairness_metrics_module.MetricFrame(
                    metric_method,
                    self.model_data['true_y'],
                    self.model_data['predicted_ys'][data["modelIndex"]],
                    sensitive_features=data["binVector"])

                # return jsonify({"data": {
                #     "global": metric_frame.overall,
                #     "bins": list(metric_frame.by_group.to_dict().values()),
                # }})
                return jsonify({"data": {
                    "global": metric_frame.overall[data["metricKey"]],
                    "bins": list(metric_frame.by_group.to_dict().values()),
                    "bounds": metric_frame.overall["Recall Wilson"],
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
