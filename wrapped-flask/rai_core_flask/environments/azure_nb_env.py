# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
import re
from IPython.display import display, HTML


class AzureNBEnvironment:
    """Environment class for Azure notebook environments.

    AzureNBEnvironment represents functionality to detect whether it is
    executed in a Azure notebook environment based on the `.nbvm` file.
    Additionally, it can display corresponding visualizations.
    """

    nbvm_file_path = "/mnt/azmnt/.nbvm"

    def __init__(self, ip, port):
        self.base_url = None
        self.externally_available = False
        self.successfully_detected = False
        self.with_credentials = True
        if not (os.path.exists(self.nbvm_file_path) and
                os.path.isfile(self.nbvm_file_path)):
            self.successfully_detected = False
        else:
            # Use regex to find items of the form key=value where value is a
            # part of a URL.
            # The keys of interest are "instance" and domainsuffix"
            envre = re.compile(r'''^([^\s=]+)=(?:[\s"']*)(.+?)(?:[\s"']*)$''')
            result = {}
            with open(self.nbvm_file_path) as nbvm_variables:
                for line in nbvm_variables:
                    match = envre.match(line)
                    if match is not None:
                        result[match.group(1)] = match.group(2)

            if "instance" not in result or "domainsuffix" not in result:
                self.successfully_detected = False
            else:
                instance = result["instance"]
                domain_suffix = result["domainsuffix"]
                self.base_url = f"https://{instance}-{port}.{domain_suffix}"
                # whether the service is available to cross-site requests
                # e.g. from inside a notebook
                self.externally_available = False
                self.successfully_detected = True

    # This will probably be the default, if an env support IPython display,
    # Call it for inlined html.
    def display(self, html):
        """Display the passed HTML using IPython."""
        display(HTML(html))
