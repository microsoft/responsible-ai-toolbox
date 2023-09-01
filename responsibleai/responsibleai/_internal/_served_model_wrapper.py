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
        # JSON safe serialization takes care of datetime columns
        response = requests.post(
            url=f"http://localhost:{self.port}/invocations",
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {"dataframe_split": X.to_dict(orient='split')},
                default=serialize_json_safe))
        if response.status_code < 300:
            # json.loads decodes byte string response.
            # Response is a dictionary with a single entry 'predictions' 
            return json.loads(response.content)['predictions']
        else:
            raise Exception(
                "Could not retrieve predictions. "
                f"Model server returned status code {response.status_code} "
                f"and the following response: {response.content}")
