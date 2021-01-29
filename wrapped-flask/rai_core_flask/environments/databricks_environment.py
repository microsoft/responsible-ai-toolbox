# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
from rai_core_flask.environments.base_environment import BaseEnvironment


_DISPLAY_HTML = "displayHTML"
_DISPLAY = "display"
_SPARK = "spark"

DATABRICKS_ENV_VAR = "DATABRICKS_RUNTIME_VERSION"

DATABRICKS = "databricks"


class DatabricksEnvironment(BaseEnvironment):
    """Environment class for Databricks environments.

    DatabricksEnvironment represents functionality to detect whether it is
    executed in a Databricks environment based on environment variables.
    Additionally, it can display corresponding visualizations.
    """

    lazy_display_function = None

    def __init__(self, service):
        self.successfully_detected = False
        self.base_url = None
        self.with_credentials = False

        if DATABRICKS_ENV_VAR in os.environ:
            self.successfully_detected = True

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

    def select(self, service):
        service.env_name = DATABRICKS
