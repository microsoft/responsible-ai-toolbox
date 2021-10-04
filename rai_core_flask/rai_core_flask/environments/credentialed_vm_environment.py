# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from flask_cors import CORS
from rai_core_flask.environments.base_environment import BaseEnvironment


CREDENTIALED_VM = 'credentialed_vm'


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

    def select(self, service):
        origin = f"https://{service.ip}:{service.port}"
        headers = ['Content-Type']
        service.cors = CORS(service.app, origins=[origin],
                            expose_headers=headers, supports_credentials=True)
        service.env_name = CREDENTIALED_VM
