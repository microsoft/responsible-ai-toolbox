# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import time

import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

from rai_core_flask import FlaskHelper


class TestFlaskHelper(object):

    def setup_class(cls):
        """Set up once for all tests."""
        cls.port_range_start = 8704
        cls.port_range_end = 8993
        cls.test_ip_local = "localhost"
        cls.test_port_local = 8994

    def get_http_client(self):
        """Get HTTP client with automatic retries."""
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

        assert (flask_service.port >= 8704 and flask_service.port <= 8993)

        @flask_service.app.route("/hello", methods=["GET"])
        def hello():
            return "Hello"

        response = call_get_with_retries(
            http, f"{flask_service.env.base_url}/hello")

        assert (response.status_code == 200)
        assert (response.text == "Hello")

    def test_with_explicit_port(self):
        """Test the flask helper when setting an explicit port."""
        http = self.get_http_client()

        flask_service = FlaskHelper(ip=self.test_ip_local,
                                    port=self.test_port_local)

        assert (flask_service.port == self.test_port_local)

        @flask_service.app.route("/hello_two", methods=["GET"])
        def hello_two():
            return "Hello"

        response = call_get_with_retries(
            http, f"{flask_service.env.base_url}/hello_two")

        assert (response.status_code == 200)
        assert (response.text == "Hello")


def call_get_with_retries(http_client,
                          url_route,
                          max_retries=4,
                          retry_delay=60):
    """Call http get on route with retries until successful."""
    for i in range(max_retries):
        try:
            print("Calling get attempt {0} of {1}".format(i + 1, max_retries))
            response = http_client.get(url_route)
            break
        except Exception as e:  # noqa: B902
            print("Calling get attempt failed with exception:")
            print(e)
            if i + 1 != max_retries:
                print("Will retry after {0} seconds".format(retry_delay))
                time.sleep(retry_delay)
                retry_delay = retry_delay * 2
    else:
        raise RuntimeError("Unable to call get on the given url route")

    return response
