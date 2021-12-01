# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from flask_cors import CORS
from rai_core_flask.environments.base_environment import BaseEnvironment

LOCAL = 'local'


class LocalIPythonEnvironment(BaseEnvironment):
    """Environment class for local IPython environments.

    LocalIPythonEnvironment represents functionality to detect whether it is
    executed in a local python environment based on IPython's availability.
    Additionally, it can display corresponding visualizations.
    """

    def __init__(self, service):
        self.successfully_detected = False
        self.base_url = None

        try:
            from IPython.display import HTML, display  # noqa: F401
        except NameError:
            self.successfully_detected = False
        else:
            if service.ip == "localhost" and not service.with_credentials:
                self.successfully_detected = True
                self.base_url = f"http://localhost:{service.port}"

    def select(self, service):
        service.with_credentials = False
        service.cors = CORS(service.app)
        service.env_name = LOCAL
