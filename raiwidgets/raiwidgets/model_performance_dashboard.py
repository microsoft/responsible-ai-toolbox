# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the model performance dashboard class."""

from flask import jsonify, request

from .dashboard import Dashboard
from .explanation_dashboard_input import ExplanationDashboardInput


class ModelPerformanceDashboard(Dashboard):
    """The dashboard class, wraps the dashboard component.

    :param model: An object that represents a model.
        It is assumed that for the classification case
        flit has a method of predict_proba()
        returning the prediction probabilities for each
        class and for the regression case a method of predict()
        returning the prediction value.
    :type model: object
    :param dataset: A matrix of feature vector examples
        (# examples x # features),
        the same samples used to build the explanation.
        Overwrites any existing dataset on the explanation object.
        Must have fewer than 10000 rows and fewer than 1000 columns.
    :type dataset: numpy.ndarray or list[][]
    :param true_y: The true labels for the provided dataset.
        Overwrites any existing dataset on the explanation object.
    :type true_y: numpy.ndarray or list[]
    :param classes: The class names.
    :type classes: numpy.ndarray or list[]
    :param features: Feature names.
    :type features: numpy.ndarray or list[]
    :param public_ip: Optional. If running on a remote vm,
        the external public ip address of the VM.
    :type public_ip: str
    :param port: The port to use on locally hosted service.
    :type port: int
    :param locale: The language in which user wants to load and access the
        ModelPerformance Dashboard. The default language is english ("en").
    :type locale: str
    """
    def __init__(self, model=None, dataset=None,
                 true_y=None, classes=None, features=None,
                 public_ip=None, port=None, locale=None):
        """Initialize the model performance dashboard."""

        self.input = ExplanationDashboardInput(
            None, model, dataset, true_y, classes, features)

        Dashboard.__init__(self, dashboard_type="ModelPerformance",
                           model_data=self.input.dashboard_input,
                           public_ip=public_ip,
                           port=port,
                           locale=locale)

        def predict():
            data = request.get_json(force=True)
            return jsonify(self.input.on_predict(data))
        self.add_url_rule(predict, '/predict', methods=["POST"])
