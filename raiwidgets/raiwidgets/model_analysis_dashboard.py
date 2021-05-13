# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Explanation dashboard class."""

from .model_analysis_dashboard_input import ModelAnalysisDashboardInput
from .dashboard import Dashboard

from flask import jsonify, request

from responsibleai import ModelAnalysis


class ModelAnalysisDashboard(Dashboard):
    """The dashboard class, wraps the dashboard component.

    :param explanation: An object that represents an explanation.
    :type explanation: ExplanationMixin
    :param model: An object that represents a model.
        It is assumed that for the classification case
        flit has a method of predict_proba()
        returning the prediction probabilities for each
        class and for the regression case a method of predict()
        returning the prediction value.
    :type model: object
    :param dataset: A matrix of feature vector examples
        (# examples x # features),
        the same samples used to build the explanation.
        Overwrites any existing dataset on the explanation object.
        Must have fewer than 10000 rows and fewer than 1000 columns.
    :type dataset: numpy.ndarray or list[][]
    :param true_y: The true labels for the provided dataset.
        Overwrites any existing dataset on the explanation object.
    :type true_y: numpy.ndarray or list[]
    :param classes: The class names.
    :type classes: numpy.ndarray or list[]
    :param features: Feature names.
    :type features: numpy.ndarray or list[]
    :param public_ip: Optional. If running on a remote vm,
        the external public ip address of the VM.
    :type public_ip: str
    :param port: The port to use on locally hosted service.
    :type port: int

    """

    def __init__(self, analysis: ModelAnalysis,
                 public_ip=None, port=None, locale=None):
        self.input = ModelAnalysisDashboardInput(analysis)

        super(ModelAnalysisDashboard, self).__init__(
            dashboard_type="ModelAnalysis",
            model_data=self.input.dashboard_input,
            public_ip=public_ip,
            port=port,
            locale=locale)

        def predict():
            data = request.get_json(force=True)
            return jsonify(self.input.model.on_predict(data))
        self.add_url_rule(predict, '/predict', methods=["POST"])
