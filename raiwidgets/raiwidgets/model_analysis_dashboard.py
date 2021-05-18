# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Model Analysis Dashboard class."""

from .model_analysis_dashboard_input import ModelAnalysisDashboardInput
from .dashboard import Dashboard

from flask import jsonify, request

from responsibleai import ModelAnalysis


class ModelAnalysisDashboard(Dashboard):
    """The dashboard class, wraps the dashboard component.

    :param analysis: An object that represents an model analysis.
    :type analysis: ModelAnalysis
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
            dashboard_type="ModelAssessment",
            model_data=self.input.dashboard_input,
            public_ip=public_ip,
            port=port,
            locale=locale)

        def predict():
            data = request.get_json(force=True)
            return jsonify(self.input.on_predict(data))
        self.add_url_rule(predict, '/predict', methods=["POST"])

        def tree():
            data = request.get_json(force=True)
            return jsonify(self.input.debug_ml(data))

        self.add_url_rule(tree, '/tree', methods=["POST"])

        def matrix():
            data = request.get_json(force=True)
            return jsonify(self.input.matrix(data))

        self.add_url_rule(matrix, '/matrix', methods=["POST"])

        def importances():
            return jsonify(self.input.importances())

        self.add_url_rule(importances, '/importances', methods=["POST"])
