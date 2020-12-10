# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from flask_cors import CORS
from rai_core_flask.environment_detector import CREDENTIALED_VM
from rai_core_flask.environments.base_environment import BaseEnvironment


class CredentialedVMEnvironment(BaseEnvironment):
    """Environment class for credentialed VM environments.

    CredentialedVMEnvironment represents functionality to detect whether it is
    executed in a credentialed VM environment based on the with_credentials
    parameter. Additionally, it can display corresponding visualizations.
    """

    def __init__(self, service):
        self.successfully_detected = False
        self.base_url = None

        if service.with_credentials:
            self.successfully_detected = True

    def display(self, html):
        """Display the passed HTML using IPython."""
        from IPython.display import HTML, display
        display(HTML(html))

    def select(self, service):
        origin = f"https://{service.ip}:{service.port}"
        headers = ['Content-Type']
        service.cors = CORS(service, origins=[origin], expose_headers=headers, supports_credentials=True)
        service.env_name = CREDENTIALED_VM
