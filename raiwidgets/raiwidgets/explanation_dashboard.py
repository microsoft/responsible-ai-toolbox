# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Explanation dashboard class."""

from .explanation_dashboard_input import ExplanationDashboardInput
from .dashboard import Dashboard

from flask import jsonify, request


class ExplanationDashboard(Dashboard):
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

    def __init__(self, explanation, model=None, dataset=None,
                 true_y=None, classes=None, features=None, public_ip=None, port=None,
                 locale=None):
        """Initialize the fairness Dashboard."""

        self.input = ExplanationDashboardInput(
            explanation, model, dataset, true_y, classes, features, locale)

        Dashboard.__init__(self, dashboard_type="Interpret",
                           model_data=self.input.dashboard_input,
                           public_ip=public_ip,
                           port=port)

        @self._service.app.route('/predict', methods=['POST'])
        def predict():
            data = request.get_json(force=True)
            return jsonify(self.input.on_predict(data))
