# rai_core_flask

Provide environment detection for enabling Flask server without configuring at instantiation. Environments are implemented as classes that will either return None if the environment check fails, or return an object with all the appropriate environment settings if the check passes. The flask service can then use it to build out urls, attach required headers, and render inline visualizations with the correct methods.

## Installation

`pip install -e .`

## Usage

`from rai_core_flask import FlaskHelper`
`flask_service = FlaskHelper(ip=<ip-to-listen-on>, port=<port-to-listen-on>)`

If `ip` is not specified then it listens on `localhost` by default.
If `port` is not specified then it finds an open port in the range 5000 to 5099
and listens on it.

To register a function to listen on an route:

```
@flask_service.app.route("/your-api-route/<int:param_name>", methods=["GET", "POST"])
def my_func(param_name):
    return something
```

## Release Process

1. Increment the version number in `setup.py`
2. Activate your virtual environment.
3. Run the `release.sh` script.
