# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from raiutils.data_processing import serialize_json_safe

import json
import requests


class ServedModelWrapper:
    def __init__(self, port):
        self.port = port
    
    def forecast(self, X):
        # request formatting according to mlflow docs
        # https://mlflow.org/docs/latest/cli.html#mlflow-models-serve
        response = requests.post(
            url=f"http://localhost:{self.port}/invocations",
            data=json.dumps(
                {"dataframe_split": X.to_dict(orient='split')},
                default=serialize_json_safe))
        if response.status_code < 300:
            return response.content
        else:
            raise Exception(
                "Could not retrieve predictions. "
                f"Model server returned status code {response.status_code} "
                f"and the following response: {response.content}")
