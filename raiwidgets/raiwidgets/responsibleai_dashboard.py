# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Model Analysis Dashboard class."""

import json

from flask import jsonify, request

from raiutils.models import ModelTask
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
    :param is_private_link: If the dashboard environment is
        a private link AML workspace.
    :type is_private_link: bool
    """
    def __init__(self, analysis: RAIInsights,
                 public_ip=None, port=None, locale=None,
                 cohort_list=None, is_private_link=False,
                 **kwargs):
        self.input = ResponsibleAIDashboardInput(
            analysis, cohort_list=cohort_list)

        super(ResponsibleAIDashboard, self).__init__(
            dashboard_type="ResponsibleAI",
            model_data=self.input.dashboard_input,
            public_ip=public_ip,
            port=port,
            locale=locale,
            no_inline_dashboard=True,
            is_private_link=is_private_link,
            **kwargs)

        def predict():
            data = request.get_json(force=True)
            return jsonify(self.input.on_predict(data))
        self.add_url_rule(predict, '/predict', methods=["POST"])

        if analysis.task_type == ModelTask.FORECASTING:
            def forecast():
                data = request.get_json(force=True)
                return jsonify(self.input.forecast(data))
            self.add_url_rule(forecast, '/forecast', methods=["POST"])
        else:
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
            self.add_url_rule(
                causal_whatif,
                '/causal_whatif',
                methods=["POST"])

            def global_causal_effects():
                data = request.get_json(force=True)
                return jsonify(self.input.get_global_causal_effects(data))
            self.add_url_rule(
                global_causal_effects,
                '/global_causal_effects',
                methods=["POST"])

            def global_causal_policy():
                data = request.get_json(force=True)
                return jsonify(self.input.get_global_causal_policy(data))
            self.add_url_rule(
                global_causal_policy,
                '/global_causal_policy',
                methods=["POST"])

            def importances():
                return jsonify(self.input.importances())
            self.add_url_rule(importances, '/importances', methods=["POST"])

            def get_exp():
                data = request.get_json(force=True)
                return jsonify(self.input.get_exp(data))
            self.add_url_rule(get_exp, '/get_exp', methods=["POST"])

        def get_object_detection_metrics():
            data = request.get_json(force=True)
            return jsonify(self.input.get_object_detection_metrics(data))
        self.add_url_rule(
            get_object_detection_metrics,
            '/get_object_detection_metrics',
            methods=["POST"]
        )

        def get_question_answering_metrics():
            data = request.get_json(force=True)
            return jsonify(self.input.get_question_answering_metrics(data))
        self.add_url_rule(
            get_question_answering_metrics,
            '/get_question_answering_metrics',
            methods=["POST"]
        )

        if hasattr(self._service, 'socketio'):
            @self._service.socketio.on('handle_object_detection_json')
            def handle_object_detection_json(od_json):
                od_data = json.loads(od_json['data'])
                return self.input.get_object_detection_metrics(od_data)

            @self._service.socketio.on('handle_question_answering_json')
            def handle_question_answering_json(qa_json):
                qa_data = json.loads(qa_json['data'])
                return self.input.get_question_answering_metrics(qa_data)
