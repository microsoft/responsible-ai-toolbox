# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from flask_cors import CORS
import os
import re
from rai_core_flask.environments.base_environment import BaseEnvironment


AZURE_NB = "azure_nb"


class AzureNBEnvironment(BaseEnvironment):
    """Environment class for Azure notebook environments.

    AzureNBEnvironment represents functionality to detect whether it is
    executed in a Azure notebook environment based on the `.nbvm` file.
    Additionally, it can display corresponding visualizations.
    """

    nbvm_file_path = "/mnt/azmnt/.nbvm"

    def __init__(self, service):
        self.base_url = None
        self.successfully_detected = False

        if not (os.path.exists(AzureNBEnvironment.nbvm_file_path) and
                os.path.isfile(AzureNBEnvironment.nbvm_file_path)):
            self.successfully_detected = False
        else:
            self.nbvm = self.get_nbvm_config()

            if "instance" not in self.nbvm or "domainsuffix" not in self.nbvm:
                self.successfully_detected = False
            else:
                instance_name = self.nbvm["instance"]
                domain_suffix = self.nbvm["domainsuffix"]
                self.base_url = \
                    f"https://{instance_name}-{service.port}.{domain_suffix}"
                self.successfully_detected = True
                self.nbvm_origins = [
                    f"https://{instance_name}.{domain_suffix}",
                    f"https://{instance_name}-{service.port}.{domain_suffix}"
                ]

    def get_nbvm_config(self):
        # Use regex to find items of the form key=value where value is a
        # part of a URL.
        # The keys of interest are "instance" and domainsuffix"
        envre = re.compile(r'''^([^\s=]+)=(?:[\s"']*)(.+?)(?:[\s"']*)$''')
        result = {}
        with open(AzureNBEnvironment.nbvm_file_path) as nbvm_variables:
            for line in nbvm_variables:
                match = envre.match(line)
                if match is not None:
                    result[match.group(1)] = match.group(2)
        return result

    def select(self, service):
        headers = ['Content-Type']
        service.cors = CORS(
            service.app,
            origins=self.nbvm_origins,
            expose_headers=headers,
            supports_credentials=True)
        service.with_credentials = True
        service.env_name = AZURE_NB
