import os
import re
from IPython.display import display, HTML


class AzureNBEnvironment:
    nbvm_file_path = "/mnt/azmnt/.nbvm"

    def __init__(self, ip, port):
        self.base_url = None
        self.externally_available = False
        self.successfully_detected = False
        if not (os.path.exists(self.nbvm_file_path) and os.path.isfile(self.nbvm_file_path)):
            self.successfully_detected = False
        else:
            # regex to find items of the form key=value where value will be part of a url
            # the keys of interest to us are "instance" and domainsuffix"
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
                instance_name = result["instance"]
                domain_suffix = result["domainsuffix"]
                self.base_url = "https://{}-{}.{}".format(instance_name, port, domain_suffix)
                # whether the service is available to cross-site requests
                # e.g. from inside a notebook
                self.externally_available = False
                self.successfully_detected = True

    # this will probably be the default, if an env support IPython display,
    # call it for inlined html.
    def display(self, html):
        display(HTML(html))
