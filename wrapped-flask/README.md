# wrapped-flask

Provide environment detection for enabling Flask server without configuring at instantiation. Environments are implemented as classes that will either return None if the environment check fails, or return an object with all the appropriate environment settings if the check passes. The flask service can then use it to build out urls, attach required headers, and render inline visualizations with the correct methods.
