# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import requests
from flask import jsonify


class ServedModelWrapper:
    def __init__(self, port):
        self.ip = ip
        self.port = port
    
    def forecast(self, X):
        response = requests.post(
            url=f"https://localhost:{self.port}/predict",
            data=jsonify({"X": X}))
        if response.status_code < 300:
            return response.content
        else:
            raise Exception(
                "Could not retrieve predictions. "
                f"Model server returned status code {response.status_code} "
                f"and the following response: {response.content}")
