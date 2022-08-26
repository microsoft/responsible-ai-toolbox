# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the ResponsibleAI Dashboard class."""

from flask import jsonify, request

from responsibleai import RAIInsights
from raiwidgets_big_data import ResponsibleAIBigDataDashboardInput
from raiwidgets import ResponsibleAIDashboard


class ResponsibleAIBigDataDashboard(ResponsibleAIDashboard):
    """The dashboard class which wraps the ResponsibleAIDashboard.

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
        self.input = ResponsibleAIBigDataDashboardInput(
            analysis, cohort_list=cohort_list)

        super(ResponsibleAIBigDataDashboard, self).__init__(
            analysis=analysis,
            public_ip=public_ip,
            port=port,
            locale=locale,
            cohort_list=cohort_list,
            **kwargs)

        def local_counterfactuals():
            data = request.get_json(force=True)
            return jsonify(self.input.get_local_counterfactuals(data))
        self.add_url_rule(
            local_counterfactuals, '/local_counterfactuals', methods=["POST"])

        def local_explanations():
            data = request.get_json(force=True)
            return jsonify(self.input.get_local_explanations(data))
        self.add_url_rule(
            local_explanations, '/local_explanations', methods=["POST"])

        def global_explanations():
            data = request.get_json(force=True)
            return jsonify(self.input.get_global_explanations(data))
        self.add_url_rule(
            global_explanations, '/global_explanations', methods=["POST"])

        def local_causal_effects():
            data = request.get_json(force=True)
            return jsonify(self.input.get_local_causal_effects(data))
        self.add_url_rule(local_causal_effects, '/local_causal_effects',
                          methods=["POST"])

        def model_overview_probability_distribution():
            data = request.get_json(force=True)
            return jsonify(
                self.input.get_model_overview_probability_distribution(data))
        self.add_url_rule(model_overview_probability_distribution,
                          '/model_overview_probability_distribution',
                          methods=["POST"])
