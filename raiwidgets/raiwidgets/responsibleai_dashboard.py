# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Model Analysis Dashboard class."""

from flask import jsonify, request

from raiwidgets.dashboard import Dashboard
from raiwidgets.responsibleai_dashboard_input import \
    ResponsibleAIDashboardInput
from responsibleai import RAIInsights


class ResponsibleAIDashboard(Dashboard):
    """The dashboard class, wraps the dashboard component.

    :param analysis: An object that represents an RAIInsights.
    :type analysis: RAIInsights
    :param public_ip: Optional. If running on a remote vm,
        the external public ip address of the VM.
    :type public_ip: str
    :param port: The port to use on locally hosted service.
    :type port: int
    :param locale: The language in which user wants to load and access the
        ResponsibleAI Dashboard. The default language is english ("en").
    :type locale: str
    :param cohort_list:
        List of cohorts defined by the user for the dashboard.
    :type cohort_list: List[Cohort]
    """
    def __init__(self, analysis: RAIInsights,
                 public_ip=None, port=None, locale=None,
                 cohort_list=None, **kwargs):
        self.input = ResponsibleAIDashboardInput(
            analysis, cohort_list=cohort_list)

        super(ResponsibleAIDashboard, self).__init__(
            dashboard_type="ResponsibleAI",
            model_data=self.input.dashboard_input,
            public_ip=public_ip,
            port=port,
            locale=locale,
            no_inline_dashboard=True,
            **kwargs)

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

        def causal_whatif():
            data = request.get_json(force=True)
            return jsonify(self.input.causal_whatif(data))
        self.add_url_rule(causal_whatif, '/causal_whatif', methods=["POST"])

        def global_causal_effects():
            data = request.get_json(force=True)
            return jsonify(self.input.get_global_causal_effects(data))
        self.add_url_rule(global_causal_effects, '/global_causal_effects',
                          methods=["POST"])

        def global_causal_policy():
            data = request.get_json(force=True)
            return jsonify(self.input.get_global_causal_policy(data))
        self.add_url_rule(global_causal_policy, '/global_causal_policy',
                          methods=["POST"])

        def importances():
            return jsonify(self.input.importances())
        self.add_url_rule(importances, '/importances', methods=["POST"])

        def get_exp():
            data = request.get_json(force=True)
            return jsonify(self.input.get_exp(data))
        self.add_url_rule(get_exp, '/get_exp', methods=["POST"])
