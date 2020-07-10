import os

class DatabricksInterfaceConstants(object):
    DISPLAY_HTML = "displayHTML"
    DISPLAY = "display"
    SPARK = "spark"

class DatabricksEnvironment:
    lazy_display_function = None
    def __init__(self, ip, port):
        if "DATABRICKS_RUNTIME_VERSION" not in os.environ:
            return None
        self.base_url = "http://{0}:{1}".format(
            ip,
            port)
        self.externally_available = False

    # NOTE: Code mostly derived from Plotly's databricks render as linked below:
    # https://github.com/plotly/plotly.py/blob/01a78d3fdac14848affcd33ddc4f9ec72d475232/packages/python/plotly/plotly/io/_base_renderers.py
    def display(self, html):
        import inspect

        if self.lazy_display_function is None:
            found = False
            for frame in inspect.getouterframes(inspect.currentframe()):
                global_names = set(frame.frame.f_globals)
                target_names = {DatabricksInterfaceConstants.DISPLAY_HTML,
                                DatabricksInterfaceConstants.DISPLAY,
                                DatabricksInterfaceConstants.SPARK}
                if target_names.issubset(global_names):
                    self.lazy_display_function = frame.frame.f_globals[
                        DatabricksInterfaceConstants.DISPLAY_HTML]
                    found = True
                    break

            if not found:
                msg = "Could not find databrick's displayHTML function"
                raise RuntimeError(msg)

        self.lazy_display_function(html)
