import os
import re
from IPython.display import display, HTML

# A possible pattern for environment classes. If valid, return object with set values, otherwise return None
class AzureNBEnvironment:
    nbvm_file_path = "/mnt/azmnt/.nbvm"
    def __init__(self, ip, port):
        if not (os.path.exists(self.nbvm_file_path) and os.path.isfile(self.nbvm_file_path)):
            return None
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
            return None

        instance_name = result["instance"]
        domain_suffix = result["domainsuffix"]
        self.base_url = "https://{}-{}.{}".format(instance_name, port, domain_suffix)
        # whether the service is available to cross-site requests
        # eg. from inside a notebook
        self.externally_available = False
    
    # this will probably be the default, if an env support IPython display, call it for inlined html
    def display(self, html):
        display(HTML(html))