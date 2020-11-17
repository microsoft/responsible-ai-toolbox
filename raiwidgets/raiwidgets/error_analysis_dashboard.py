# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Error Analysis dashboard class."""

from .error_analysis_dashboard_input import ErrorAnalysisDashboardInput
from .dashboard import Dashboard

from flask import jsonify, request


class ErrorAnalysisDashboard(Dashboard):
    """ErrorAnalysis Dashboard Class.

    :param explanation: An object that represents an explanation.
    :type explanation: ExplanationMixin
    :param model: An object that represents a model. It is assumed that for
        the classification case it has a method of predict_proba() returning
        the prediction probabilities for each class and for the regression
        case a method of predict() returning the prediction value.
    :type model: object
    :param dataset:  A matrix of feature vector examples
        (# examples x # features), the same samples used to build the
        explanation. Overwrites any existing dataset on the
        explanation object.
    :type dataset: numpy.array or list[][]
    :param true_y: The true labels for the provided dataset. Overwrites
        any existing dataset on the explanation object.
    :type true_y: numpy.array or list[]
    :param classes: The class names.
    :type classes: numpy.array or list[]
    :param features: Feature names.
    :type features: numpy.array or list[]
    :param port: The port to use on locally hosted service.
    :type port: int
    """

    def __init__(self, explanation, model=None, *, dataset=None,
                 true_y=None, classes=None, features=None, port=None,
                 datasetX=None, trueY=None, locale=None, public_ip=None):
        """Initialize the Error Analysis Dashboard."""

        self.input = ErrorAnalysisDashboardInput(
            explanation, model, dataset, true_y, classes, features, locale)

        Dashboard.__init__(self, dashboard_type="ErrorAnalysis",
                           model_data=self.input.dashboard_input,
                           public_ip=public_ip,
                           port=port)

        # To enable multiple dashboards to run in the same notebook we need to
        # prevent them from using the same method names (in addition to using
        # dedicated ports). Below we rename the function for that purpose and
        # manually add the URL rule instead of using the route decorator.
        def predict():
            data = request.get_json(force=True)
            return jsonify(self.input.on_predict(data))

        def tree():
            data = request.get_json(force=True)
            return jsonify(self.input.debug_ml(data))

        def matrix():
            data = request.get_json(force=True)
            return jsonify(self.input.matrix(data))

        predict.__name__ = f"predict{self._service.port}"
        self._service.app.add_url_rule('/predict', endpoint=predict.__name__,
                                       view_func=predict, methods=['POST'])
        tree.__name__ = f"tree{self._service.port}"
        self._service.app.add_url_rule('/tree', endpoint=tree.__name__,
                                       view_func=tree, methods=['POST'])
        matrix.__name__ = f"matrix{self._service.port}"
        self._service.app.add_url_rule('/matrix', endpoint=matrix.__name__,
                                       view_func=matrix, methods=['POST'])
