class LocalIPythonEnvironment:
    def __init__(self, ip, port):
        try: 
            from IPython.display import HTML, display
        except NameError:
            return None
        self.base_url = "http://{0}:{1}".format(
            ip,
            port)
        self.externally_available = True
    
    def display(self, html):
        from IPython.display import HTML, display
        display(HTML(html))