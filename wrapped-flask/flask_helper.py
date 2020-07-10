from flask import Flask, request
from flask_cors import CORS
from jinja2 import Environment, PackageLoader
from IPython.display import display, HTML
from  .environment_detector import build_environment

import socket
import threading
import atexit
try:
    from gevent.pywsgi import WSGIServer
except ModuleNotFoundError:
    raise RuntimeError("Error: gevent package is missing, please run 'conda install gevent' or"
                       "'pip install gevent' or 'pip install interpret-community[visualization]'")

class FlaskHelper:
    app = Flask(__name__)
    CORS(app)

    def __init__(self, *, port, ip):

        self.port = port
        self.ip = ip
        # dictionary to store arbitrary state for use by consuming classes
        self.shared_state = {}
        if self.ip is None:
            self.ip = "localhost"
        if self.port is None:
            # Try 100 different ports
            for port in range(5000, 5100):
                available = FlaskHelper._local_port_available(self.ip, port, rais=False)
                if available:
                    self.port = port
                    return
            error_message = """Ports 5000 to 5100 not available.
                Please specify an open port for use via the 'port' parameter"""
            raise RuntimeError(
                error_message.format(port)
            )
        else:
            FlaskHelper._local_port_available(self.ip, self.port)
        self._thread = threading.Thread(target=self.run, daemon=True)
        self._thread.start()
        self.env = build_environment(self.ip, self.port)
        

    @staticmethod
    def _local_port_available(ip, port, rais=True):
        """
        Borrowed from:
        https://stackoverflow.com/questions/19196105/how-to-check-if-a-network-port-is-open-on-linux
        """
        try:
            backlog = 5
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind((ip, port))
            sock.listen(backlog)
            sock.close()
        except socket.error:  # pragma: no cover
            if rais:
                error_message = """Port {0} is not available.
                Please specify another port for use via the 'port' parameter"""
                raise RuntimeError(
                    error_message.format(port)
                )
            else:
                return False
        return True
    
    def run(self):
        class devnull:
            write = lambda _: None  # noqa: E731

        server = WSGIServer((self.ip, self.port), self.app, log=devnull)
        self.app.config["server"] = server
        server.serve_forever()

        # Closes server on program exit, including freeing all sockets
        def closeserver():
            server.stop()

        atexit.register(closeserver)