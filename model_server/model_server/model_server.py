# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the model server class."""

from flask import jsonify, request
import uuid

from rai_core_flask import FlaskHelper
from azureml.core import Experiment, Workspace
from azureml.train.automl.run import AutoMLRun


class ModelServer(object):
    """The model class."""

    def __init__(self, *,
                 subscription_id,
                 resource_group,
                 workspace_name,
                 experiment_name,
                 run_id,
                 public_ip,
                 port,
                 **kwargs):
        """Initialize the server."""
        try:
            self._service = FlaskHelper(ip=public_ip, port=port)
        except Exception as e:
            self._service = None
            raise e

        self.id = uuid.uuid4().hex

        print("Retrieving model from Azure ML "
              f"workspace {workspace_name} "
              f"in resource group {resource_group} "
              f"in subscription {subscription_id} "
              f"for experiment {experiment_name} "
              f"and run {run_id}."
              )

        workspace = Workspace(subscription_id, resource_group, workspace_name)
        experiment = Experiment(workspace, name=experiment_name)
        remote_run = AutoMLRun(experiment, run_id)
        _, self.model = remote_run.get_output()

        print(f"Retrieved model: {self.model}")

        print(f'Model server started at {self._service.env.base_url}')

        def predict():
            data = request.get_json(force=True)
            return jsonify(self.model.predict(data))
        self.add_url_rule(predict, '/predict', methods=["POST"])

        def predict_proba():
            data = request.get_json(force=True)
            return jsonify(self.model.predict_proba(data))
        self.add_url_rule(predict_proba, '/predict_proba', methods=["POST"])

        def forecast():
            data = request.get_json(force=True)
            return jsonify(self.model.forecast(data))
        self.add_url_rule(forecast, '/forecast', methods=["POST"])

    def add_url_rule(self, func, route, methods):
        """To enable multiple dashboards to run in the same notebook we need to
        prevent them from using the same method names (in addition to using
        dedicated ports). We rename the function for that purpose and
        manually add the URL rule instead of using the route decorator.
        """
        func.__name__ = func.__name__ + str(id(self))
        self._service.app.add_url_rule(
            route,
            endpoint=func.__name__,
            view_func=func,
            methods=methods)
