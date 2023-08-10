# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the model server class."""

from flask import jsonify, request
import uuid

from rai_core_flask import FlaskHelper
import mlflow
import os


class ModelServer(object):
    """The model class."""

    def __init__(self, *,
                 subscription_id,
                 resource_group,
                 workspace_name,
                 experiment_name,
                 run_id,
                 public_ip=None,
                 port=None,
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

        # from azure.ai.ml import MLClient
        # from azure.identity import DefaultAzureCredential
        # credential = DefaultAzureCredential()
        # ml_client = MLClient(credential, subscription_id, resource_group, workspace_name)
        # tracking_uri = ml_client.workspaces.get(name=ml_client.workspace_name).mlflow_tracking_uri
        
        
        # server = ModelServer(subscription_id="b3b0e63c-e8fd-4f5c-bab9-1ed82844ef1f", resource_group="romanlutz", workspace_name="romanlutz", experiment_name="single-model-experiment-train-only20230807",run_id="olive_sugar_6dbzx3b4p9_0", public_ip=None, port=None)
        
        from azureml.core import Workspace
        workspace = Workspace(subscription_id, resource_group, workspace_name)
        tracking_uri = workspace.get_mlflow_tracking_uri()
        mlflow.set_tracking_uri(tracking_uri)
        local_dir = "./artifact_downloads/"
        artifact_path = "outputs"
        os.makedirs(local_dir, exist_ok=True)
        local_path = mlflow.artifacts.download_artifacts(
            run_id=run_id,
            artifact_path=artifact_path,
            dst_path=local_dir
        )
        self.model = mlflow.pyfunc.load_model(f"{local_dir}{artifact_path}/mlflow-model")
        # The following is only for the TerminalContainer to pull the right Docker image
        # from azureml.core import Experiment, Workspace
        # from azureml.train.automl.run import AutoMLRun
        # workspace = Workspace(subscription_id, resource_group, workspace_name)
        # experiment = Experiment(workspace, name=experiment_name)
        # remote_run = AutoMLRun(experiment, run_id)
        # environment = remote_run.get_environment()
        # image_details = environment.get_image_details(workspace)
        # if not image_details.image_exist:
        #     raise Exception("Docker image not found in the workspace.")
        # image = image_details.image


        print(f"Retrieved model: {self.model}")

        print(f'Model server started at {self._service.env.base_url}')

        def predict():
            data = request.get_json(force=True)
            return jsonify(self.model.predict(data))
        self.add_url_rule(predict, '/predict', methods=["POST"])

        # def predict_proba():
        #     data = request.get_json(force=True)
        #     return jsonify(self.model.predict_proba(data))
        # self.add_url_rule(predict_proba, '/predict_proba', methods=["POST"])

        # def forecast():
        #     data = request.get_json(force=True)
        #     return jsonify(self.model.forecast(data))
        # self.add_url_rule(forecast, '/forecast', methods=["POST"])

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
