# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from flask import Flask
from .environment_detector import build_environment
from .environments.credentialed_vm_environment import CREDENTIALED_VM
from .environments.public_vm_environment import PUBLIC_VM

import socket
import threading
import atexit
import uuid
import time

from gevent.pywsgi import WSGIServer

import logging

LOCALHOST = 'localhost'
VM_ENVS = {CREDENTIALED_VM, PUBLIC_VM}


class FlaskHelper(object):
    """FlaskHelper is a class for common Flask utilities used in dashboards."""

    def __init__(self, ip=None, port=None, with_credentials=False):
        # The name passed to Flask needs to be unique per instance.
        self.app = Flask(uuid.uuid4().hex)

        self.port = port
        self.ip = ip
        self.with_credentials = with_credentials
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
        self.env = build_environment(self)
        if self.env.base_url is None:
            return
        # Sleep for 1 second in order to prevent random errors while
        # socket is still closing
        time.sleep(1)
        self._thread = threading.Thread(target=self.run, daemon=True)
        self._thread.start()

    @staticmethod
    def _is_local_port_available(ip, port, raise_error=True):
        """Check whether the specified local port is available.

        Borrowed from:
        https://stackoverflow.com/questions/19196105/how-to-check-if-a-network-port-is-open-on-linux
        """
        try:
            backlog = 5
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                # See stack overflow to prevent "Only one usage" random
                # errors in tests:
                # https://stackoverflow.com/questions/30420512/python-socket-error-only-one-usage-of-each-socket-address-is-normally-permitted
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
                sock.bind((LOCALHOST, port))
                sock.listen(backlog)
        except (socket.error, OSError):  # pragma: no cover
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
        ip = LOCALHOST
        # Note: for credentialed or public VM use the private IP address
        if self.env_name in VM_ENVS:
            host_name = socket.gethostname()
            ip = socket.gethostbyname(host_name)
        logger = logging.getLogger('wsgiserver')
        logger.setLevel(logging.ERROR)
        self.server = WSGIServer((ip, self.port), self.app, log=logger)
        self.app.config["server"] = self.server
        # self.app.config["CACHE_TYPE"] = "null"
        self.server.serve_forever()

        # Closes server on program exit, including freeing all sockets
        def closeserver():
            self.stop()

        atexit.register(closeserver)

    def stop(self):
        if(self.server.started):
            self.server.stop()
