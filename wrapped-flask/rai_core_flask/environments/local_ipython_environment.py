# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


class LocalIPythonEnvironment:
    """Environment class for local IPython environments.

    LocalIPythonEnvironment represents functionality to detect whether it is
    executed in a local python environment based on IPython's availability.
    Additionally, it can display corresponding visualizations.
    """

    def __init__(self, ip, port):
        self.successfully_detected = False
        self.base_url = None
        self.externally_available = None
        self.port = port
        self.with_credentials = False

        try:
            from IPython.display import HTML, display  # noqa: F401
        except NameError:
            self.successfully_detected = False
        else:
            self.successfully_detected = True
            self.base_url = "http://{0}:{1}".format(
                ip,
                port)
            self.externally_available = True

    def display(self, html):
        """Display the passed HTML using IPython."""
        from IPython.display import HTML, display
        display(HTML(html))
