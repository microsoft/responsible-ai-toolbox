# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
from rai_core_flask import FlaskHelper


class TestFlaskHelper(object):

    def setup_class(cls):
        """Set up once for all tests."""
        cls.port_range_start = 5000
        cls.port_range_end = 5099
        cls.test_ip_local = "127.0.0.1"
        cls.test_port_local = 5100

    def get_http_client(self):
        retry_strategy = Retry(total=3)
        adapter = HTTPAdapter(max_retries=retry_strategy)
        http = requests.Session()
        http.mount("https://", adapter)
        http.mount("http://", adapter)

        return http

    def test_without_explicit_port(self):
        """Test the flask helper without setting an explicit port."""

        http = self.get_http_client()

        flask_service = FlaskHelper(ip=self.test_ip_local)

        assert(flask_service.port >= 5000 and flask_service.port <= 5099)

        @FlaskHelper.app.route("/hello", methods=["GET"])
        def hello():
            return "Hello"

        response = http.get(f"{flask_service.env.base_url}/hello")

        assert(response.status_code == 200)
        assert(response.text == "Hello")

    def test_with_explicit_port(self):
        """Test the flask helper when setting an explicit port."""

        http = self.get_http_client()

        flask_service = FlaskHelper(ip=self.test_ip_local, port=self.test_port_local)

        assert(flask_service.port == self.test_port_local)

        @FlaskHelper.app.route("/hello_two", methods=["GET"])
        def hello_two():
            return "Hello"

        response = http.get(f"{flask_service.env.base_url}/hello_two")

        assert(response.status_code == 200)
        assert(response.text == "Hello")
