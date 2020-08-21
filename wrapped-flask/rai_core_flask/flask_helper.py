# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from flask import Flask
from flask_cors import CORS
from .environment_detector import build_environment

import socket
import threading
import atexit


try:
    from gevent.pywsgi import WSGIServer
except ModuleNotFoundError:
    raise RuntimeError(
        "Error: gevent package is missing, please run 'conda install gevent' "
        "or 'pip install gevent' or "
        "'pip install interpret-community[visualization]'")


class FlaskHelper(object):
    """FlaskHelper is a class for common Flask utilities used in dashboards."""

    app = Flask(__name__)
    CORS(app)

    def __init__(self, ip=None, port=None):
        self.port = port
        self.ip = ip
        # dictionary to store arbitrary state for use by consuming classes
        self.shared_state = {}
        if self.ip is None:
            self.ip = "localhost"
        if self.port is None:
            # Try 100 different ports
            available = False
            for port in range(5000, 5100):
                available = FlaskHelper._is_local_port_available(
                    self.ip, port, raise_error=False)
                if available:
                    self.port = port
                    break

            if not available:
                error_message = """Ports 5000 to 5100 not available.
                    Please specify an open port for use via the 'port'
                    parameter"""
                raise RuntimeError(
                    error_message.format(port)
                )
        else:
            FlaskHelper._is_local_port_available(self.ip, self.port,
                                                 raise_error=True)
        self._thread = threading.Thread(target=self.run, daemon=True)
        self._thread.start()
        self.env = build_environment(self.ip, self.port)

    @staticmethod
    def _is_local_port_available(ip, port, raise_error=True):
        """Check whether the specified local port is available.

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
            if raise_error:
                error_message = """Port {0} is not available.
                Please specify another port for use via the 'port' parameter"""
                raise RuntimeError(
                    error_message.format(port)
                )
            else:
                return False
        return True

    def run(self):
        """TODO."""
        class devnull:
            write = lambda _: None  # noqa: E731

        server = WSGIServer((self.ip, self.port), self.app, log=devnull)
        self.app.config["server"] = server
        server.serve_forever()

        # Closes server on program exit, including freeing all sockets
        def closeserver():
            server.stop()

        atexit.register(closeserver)
