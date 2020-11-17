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

        def predict():
            data = request.get_json(force=True)
            return jsonify(self.input.on_predict(data))

        self.add_url_rule(predict, '/predict', methods=["POST"])

        def tree():
            data = request.get_json(force=True)
            return jsonify(self.input.debug_ml(data[0], data[1], data[2]))

        self.add_url_rule(tree, '/tree', methods=["POST"])

        def matrix():
            data = request.get_json(force=True)
            return jsonify(self.input.matrix(data[0], data[1], data[2]))

        self.add_url_rule(matrix, '/matrix', methods=["POST"])
