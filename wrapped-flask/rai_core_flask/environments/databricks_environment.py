# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os


_DISPLAY_HTML = "displayHTML"
_DISPLAY = "display"
_SPARK = "spark"


class DatabricksEnvironment:
    """Environment class for Databricks environments.

    DatabricksEnvironment represents functionality to detect whether it is
    executed in a Databricks environment based on environment variables.
    Additionally, it can display corresponding visualizations.
    """

    lazy_display_function = None

    def __init__(self, ip, port):
        self.successfully_detected = False
        self.base_url = None
        self.externally_available = False
        self.with_credentials = False

        if "DATABRICKS_RUNTIME_VERSION" not in os.environ:
            self.successfully_detected = False
        else:
            # data bricks can never take call back
            # self.base_url = "http://{0}:{1}".format(
            #     ip,
            #     port)
            self.externally_available = True

    def display(self, html):
        """Display the passed HTML using Databricks's displayHTML.

        ..note:

            Code mostly derived from Plotly's databricks render as linked
            below:
            https://github.com/plotly/plotly.py/blob/01a78d3fdac14848affcd33ddc4f9ec72d475232/packages/python/plotly/plotly/io/_base_renderers.py
        """
        import inspect

        if self.lazy_display_function is None:
            found = False
            for frame in inspect.getouterframes(inspect.currentframe()):
                global_names = set(frame.frame.f_globals)
                target_names = {_DISPLAY_HTML, _DISPLAY, _SPARK}
                if target_names.issubset(global_names):
                    self.lazy_display_function = \
                        frame.frame.f_globals[_DISPLAY_HTML]
                    found = True
                    break

            if not found:
                msg = "Could not find Databrick's displayHTML function"
                raise RuntimeError(msg)

        self.lazy_display_function(html)
