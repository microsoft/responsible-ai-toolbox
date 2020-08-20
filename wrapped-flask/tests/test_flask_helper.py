import requests
from rai_core_flask import FlaskHelper


class TestFlaskHelper(object):

    def setup_class(cls):
        """
        Setup once for all tests
        """
        cls.port_range_start = 5000
        cls.port_range_end = 5099
        cls.test_ip_local = "localhost"
        cls.test_port_local = 5100

    def test_without_explicit_port(self):
        """
        Test the flask helper without setting an explicit port
        """

        flask_service = FlaskHelper(ip=self.test_ip_local)

        assert(flask_service.port >= 5000 and flask_service.port <= 5099)

        @FlaskHelper.app.route("/hello", methods=["GET"])
        def hello():
            return "Hello"

        response = requests.get(f"{flask_service.env.base_url}/hello")

        assert(response.status_code == 200)
        assert(response.text == "Hello")

    def test_with_explicit_port(self):
        """
        Test the flask helper when setting an explicit port
        """

        flask_service = FlaskHelper(ip=self.test_ip_local, port=self.test_port_local)

        assert(flask_service.port == self.test_port_local)

        @FlaskHelper.app.route("/hello_two", methods=["GET"])
        def hello_two():
            return "Hello"

        response = requests.get(f"{flask_service.env.base_url}/hello_two")

        assert(response.status_code == 200)
        assert(response.text == "Hello")
