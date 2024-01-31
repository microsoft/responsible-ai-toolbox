# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

from raiutils.webservice import post_with_retries
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
        uri = f"http://localhost:{self.port}/invocations"
        input_data = json.dumps(
            {"dataframe_split": X.to_dict(orient='split')},
            default=serialize_json_safe)
        headers = {"Content-Type": "application/json"}
        try:
            response = post_with_retries(uri, input_data, headers,
                                         max_retries=15, retry_delay=30)
        except Exception:
            raise RuntimeError(
                "Could not retrieve predictions. "
                f"Model server returned status code {response.status_code} "
                f"and the following response: {response.content}")

        # json.loads decodes byte string response.
        # Response is a dictionary with a single entry 'predictions'
        return json.loads(response.content)['predictions']
