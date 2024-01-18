# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the dashboard class."""

import json
import os
import uuid
from html.parser import HTMLParser

from rai_core_flask import FlaskHelper  # , environment_detector
from raiutils.data_processing import serialize_json_safe
from raiwidgets.interfaces import WidgetRequestResponseConstants

invalid_feature_flights_error = \
    "feature_flights should be of type string. Separate multiple flights " \
    "using ampersand (&)."


class InLineScript(HTMLParser):
    def __init__(self, load_widget_file):
        HTMLParser.__init__(self)
        self.content = ""
        self.load_widget_file = load_widget_file

    def handle_starttag(self, tag, attrs):
        if tag == "script":
            src = None
            scriptTag = "<script "
            for att in attrs:
                if att[0] == "src":
                    src = att[1]
                    continue
                # skip module type as it causes ipython to render widget
                # with 8px height
                if att[0] == "type":
                    continue
                scriptTag += f' {att[0]}={att[1]}'
            if src is not None:
                content = self.load_widget_file(src)
                self.content += f'{scriptTag}>\r\n{content}\r\n'
                return
        self.content += self.get_starttag_text()

    def handle_endtag(self, tag):
        self.content += f'</{tag}>'
        pass

    def handle_data(self, data):
        self.content += data
        pass


class Dashboard(object):
    """The dashboard class, wraps the dashboard component."""

    def __init__(self, *,
                 dashboard_type,
                 model_data,
                 public_ip,
                 port,
                 locale,
                 no_inline_dashboard=False,
                 **kwargs):
        """Initialize the dashboard."""

        if model_data is None or type is None:
            raise ValueError("Required parameters not provided")

        try:
            self._service = FlaskHelper(ip=public_ip, port=port)
        except Exception as e:
            self._service = None
            raise e

        self.id = uuid.uuid4().hex

        feature_flights = kwargs.get('feature_flights')
        if feature_flights and not isinstance(feature_flights, str):
            raise ValueError(invalid_feature_flights_error)

        self.config = {
            'dashboardType': dashboard_type,
            'id': self.id,
            'baseUrl': self._service.env.base_url,
            'withCredentials': self._service.with_credentials,
            'locale': locale,
            'featureFlights': feature_flights
        }
        self.model_data = model_data
        self.add_route()

        html = self.load_index()
        print(f'{dashboard_type} started at {self._service.env.base_url}')
        if no_inline_dashboard:
            return
        self._service.env.display(html)

    def add_route(self):
        # To enable multiple dashboards to run in the same notebook we need to
        # prevent them from using the same method names (in addition to using
        # dedicated ports). Below we rename the function for that purpose and
        # manually add the URL rule instead of using the route decorator.
        def visual():
            return self.load_index()
        self.add_url_rule(visual, '/', methods=["GET"])

        def get_config():
            return json.dumps({
                WidgetRequestResponseConstants.data: self.config
            })
        self.add_url_rule(get_config, '/config', methods=["POST"])

        def get_model_data():
            return json.dumps({
                WidgetRequestResponseConstants.data: self.model_data},
                default=serialize_json_safe)
        self.add_url_rule(get_model_data, '/model_data', methods=["POST"])
        return

    @staticmethod
    def get_widget_path(path):
        script_path = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(script_path, "widget", path)

    def load_index(self):
        index = self.load_widget_file("index.html")
        parser = InLineScript(self.load_widget_file)
        parser.feed(index)
        return parser.content

    def load_widget_file(self, path):
        js_path = Dashboard.get_widget_path(path)
        with open(js_path, "r", encoding="utf-8") as f:
            content = f.read()
            content = content.replace(
                "__rai_app_id__", f'rai_widget_{self.id}')
            content = content.replace(
                '"__rai_config__"', f'`{json.dumps(self.config)}`')
            model_data = json.dumps(self.model_data,
                                    default=serialize_json_safe)
            content = content.replace(
                '"__rai_model_data__"',
                f'`{model_data}`')
            return content

    def add_url_rule(self, func, route, methods):
        """To enable multiple dashboards to run in the same notebook we need to
        prevent them from using the same method names (in addition to using
        dedicated ports). We rename the function for that purpose and
        manually add the URL rule instead of using the route decorator.
        """
        func.__name__ = func.__name__ + str(id(self))
        self._service.app.add_url_rule(
            route,
            endpoint=func.__name__,
            view_func=func,
            methods=methods)
