# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from unittest.mock import Mock

import pytest
from flask import Flask

from raiwidgets.dashboard import Dashboard, InLineScript


@pytest.mark.parametrize("doctype", [
    "<!DOCTYPE html>",
    '<!DOCTYPE HTML SYSTEM "about:legacy-compat">'
])
def test_inline_script_preserves_doctype(doctype):
    load_widget_file = Mock(return_value="window.widgetLoaded = true;")
    parser = InLineScript(load_widget_file)

    parser.feed(
        f'{doctype}\n<html><body>'
        '<script src="main.js" type="module"></script></body></html>')

    assert parser.content.startswith(f'{doctype}\n<html>')
    assert "window.widgetLoaded = true;" in parser.content
    assert 'src="main.js"' not in parser.content
    load_widget_file.assert_called_once_with("main.js")


@pytest.mark.parametrize("no_inline_dashboard", [False, True])
def test_dashboard_keeps_doctype_in_page_and_display_argument(
        tmp_path, monkeypatch, no_inline_dashboard):
    (tmp_path / "index.html").write_text(
        '<!DOCTYPE html>\n<html><body><div id="__rai_app_id__"></div>'
        '<script src="main.js" type="module"></script></body></html>',
        encoding="utf-8")
    (tmp_path / "main.js").write_text(
        'window.config = "__rai_config__";',
        encoding="utf-8")
    monkeypatch.setattr(
        Dashboard, "get_widget_path",
        staticmethod(lambda path: tmp_path / path))
    service = Mock(app=Flask(__name__), with_credentials=False)
    service.env.base_url = "http://localhost:5000/"
    monkeypatch.setattr(
        "raiwidgets.dashboard.FlaskHelper", Mock(return_value=service))

    dashboard = Dashboard(
        dashboard_type="ResponsibleAIDashboard",
        model_data={},
        public_ip="127.0.0.1",
        port=5000,
        locale="en",
        no_inline_dashboard=no_inline_dashboard)

    response = service.app.test_client().get("/")
    html = response.get_data(as_text=True)
    assert response.status_code == 200
    assert html.startswith("<!DOCTYPE html>\n<html>")
    assert f'rai_widget_{dashboard.id}' in html
    assert "window.config = `" in html
    if no_inline_dashboard:
        service.env.display.assert_not_called()
    else:
        service.env.display.assert_called_once_with(html)
