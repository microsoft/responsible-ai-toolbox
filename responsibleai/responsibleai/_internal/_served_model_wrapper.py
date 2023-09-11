# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

import requests

from responsibleai.serialization_utilities import serialize_json_safe


class ServedModelWrapper:
    """Wrapper for locally served model.

    The purpose of ServedModelWrapper is to provide an abstraction
    for locally served models. This allows us to use the same code in
    RAIInsights for loaded models that can run in the same environment and
    also for locally served models.

    Locally served in this case means on localhost via HTTP.
    This could be in a separate conda environment, or even in a Docker
    container.

    :param port: The port on which the model is served.
    :type port: int
    """
    def __init__(self, port):
        self.port = port

    def forecast(self, X):
        """Get forecasts from the model.

        :param X: The input data.
        :type X: pandas.DataFrame
        :return: The model's forecasts based on the input data.
        :rtype: List[float]
        """
        # request formatting according to mlflow docs
        # https://mlflow.org/docs/latest/cli.html#mlflow-models-serve
        # JSON safe serialization takes care of datetime columns
        response = requests.post(
            url=f"http://localhost:{self.port}/invocations",
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {"dataframe_split": X.to_dict(orient='split')},
                default=serialize_json_safe))
        try:
            response.raise_for_status()
        except Exception:
            raise RuntimeError(
                "Could not retrieve predictions. "
                f"Model server returned status code {response.status_code} "
                f"and the following response: {response.content}")

        # json.loads decodes byte string response.
        # Response is a dictionary with a single entry 'predictions'
        return json.loads(response.content)['predictions']
