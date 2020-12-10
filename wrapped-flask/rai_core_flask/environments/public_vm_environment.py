# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from flask_cors import CORS
from rai_core_flask.environment_detector import LOCALHOST
from rai_core_flask.environments.base_environment import BaseEnvironment


class PublicVMEnvironment(BaseEnvironment):
    """Environment class for public VM environments.

    PublicVMEnvironment represents functionality to detect whether it is
    executed in a public VM environment based on the IP address.
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
            if service.ip == LOCALHOST:
                self.successfully_detected = True
                self.base_url = f"http://{LOCALHOST}:{service.port}"

    def display(self, html):
        """Display the passed HTML using IPython."""
        from IPython.display import HTML, display
        display(HTML(html))

    def select(self, service):
        service.with_credentials = False
        service.cors = CORS(service)
