# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import re

from flask_cors import CORS

from rai_core_flask.environments.base_environment import BaseEnvironment

PUBLIC_VM = 'public_vm'


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
            if service.ip != "localhost" and not service.with_credentials:
                self.successfully_detected = True
                self.base_url = f"http://{service.ip}:{service.port}"

    def select(self, service):
        service.with_credentials = False
        if service.allow_all_origins:
            # User explicitly opted into allowing all origins (less secure)
            service.cors = CORS(service.app)
        else:
            # Default: restrict CORS to the same host over HTTP/HTTPS
            # on any port (notebook may run on a different port)
            escaped_ip = re.escape(service.ip)
            origin_pattern = rf"^https?://{escaped_ip}(:\d+)?$"
            service.cors = CORS(service.app, origins=[origin_pattern])
        service.env_name = PUBLIC_VM
