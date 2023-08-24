# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import requests


class ServedModelWrapper:
    def __init__(self, port):
        self.port = port
    
    def forecast(self, X):
        response = requests.post(
            url=f"http://localhost:{self.port}/predict",
            json={"X": X.to_json(orient='split')})
        if response.status_code < 300:
            return response.content
        else:
            raise Exception(
                "Could not retrieve predictions. "
                f"Model server returned status code {response.status_code} "
                f"and the following response: {response.content}")
