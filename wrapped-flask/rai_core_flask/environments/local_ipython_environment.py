class LocalIPythonEnvironment:
    def __init__(self, ip, port):
        self.successfully_detected = False
        self.base_url = None
        self.externally_available = None
        self.port = port

        try:
            from IPython.display import HTML, display
        except NameError:
            self.successfully_detected = False
        else:
            self.successfully_detected = True
            self.base_url = "http://{0}:{1}".format(
                ip,
                port)
            self.externally_available = True

    def display(self, html):
        from IPython.display import HTML, display
        display(HTML(html))
