# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the ErrorAnalysis dashboard class."""

from .error_analysis_dashboard_input import ErrorAnalysisDashboardInput
from .dashboard import Dashboard
from .constants import ModelTask

from flask import jsonify, request


class ErrorAnalysisDashboard(Dashboard):
    """ErrorAnalysis Dashboard Class.

    :param explanation: An object that represents an explanation.
    :type explanation: ExplanationMixin
    :param model: An object that represents a model. It is assumed that for
        the classification case it has a method of predict_proba()
        returning the prediction probabilities for each class and
        for the regression case a method of predict() returning the
        prediction value.
    :type model: object
    :param dataset: A matrix of feature vector examples
        (# examples x # features), the same samples used to build the
        explanation. Overwrites any existing dataset on the
        explanation object.
    :type dataset: numpy.ndarray or list[][]
    :param true_y: The true labels for the provided explanation. Overwrites
        any existing dataset on the explanation object.
        Note if explanation is sample of dataset, you will need to specify
        true_y_dataset as well.
    :type true_y: numpy.ndarray or list[]
    :param classes: The class names.
    :type classes: numpy.ndarray or list[]
    :param features: Feature names.
    :type features: numpy.ndarray or list[]
    :param port: The port to use on locally hosted service.
    :type port: int
    :param public_ip: Optional. If running on a remote vm,
        the external public ip address of the VM.
    :type public_ip: str
    :param categorical_features: The categorical feature names.
    :type categorical_features: list[str]
    :param true_y_dataset: The true labels for the provided dataset.
        Only needed if the explanation has a sample of instances from the
        original dataset. Otherwise specify true_y parameter only.
    :type true_y_dataset: numpy.ndarray or list[]
    :param pred_y: The predicted y values, can be passed in as an
        alternative to the model and explanation for a more limited
        view.
    :type pred_y: numpy.ndarray or list[]
    :param model_task: Optional parameter to specify whether the model
        is a classification or regression model. In most cases, the
        type of the model can be inferred based on the shape of the
        output, where a classifier has a predict_proba method and
        outputs a 2 dimensional array, while a regressor has a
        predict method and outputs a 1 dimensional array.
    :type model_task: str
    :param metric: The metric name to evaluate at each tree node or
        heatmap grid.  Currently supported classification metrics
        include 'error_rate', 'recall_score', 'precision_score',
        'f1_score', and 'accuracy_score'. Supported regression
        metrics include 'mean_absolute_error', 'mean_squared_error',
        'r2_score', and 'median_absolute_error'.
    :type metric: str
    """

    def __init__(self, explanation=None, model=None, *, dataset=None,
                 true_y=None, classes=None, features=None, port=None,
                 locale=None, public_ip=None,
                 categorical_features=None, true_y_dataset=None,
                 pred_y=None, model_task=ModelTask.UNKNOWN,
                 metric=None):
        """ErrorAnalysis Dashboard Class.

        :param explanation: An object that represents an explanation.
        :type explanation: ExplanationMixin
        :param model: An object that represents a model. It is assumed that for
            the classification case it has a method of predict_proba()
            returning the prediction probabilities for each class and
            for the regression case a method of predict() returning the
            prediction value.
        :type model: object
        :param dataset: A matrix of feature vector examples
            (# examples x # features), the same samples used to build the
            explanation. Overwrites any existing dataset on the
            explanation object.
        :type dataset: numpy.ndarray or list[][]
        :param true_y: The true labels for the provided explanation. Overwrites
            any existing dataset on the explanation object.
            Note if explanation is sample of dataset, you will need to specify
            true_y_dataset as well.
        :type true_y: numpy.ndarray or list[]
        :param classes: The class names.
        :type classes: numpy.ndarray or list[]
        :param features: Feature names.
        :type features: numpy.ndarray or list[]
        :param port: The port to use on locally hosted service.
        :type port: int
        :param public_ip: Optional. If running on a remote vm,
            the external public ip address of the VM.
        :type public_ip: str
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param true_y_dataset: The true labels for the provided dataset.
            Only needed if the explanation has a sample of instances from the
            original dataset. Otherwise specify true_y parameter only.
        :type true_y_dataset: numpy.ndarray or list[]
        :param pred_y: The predicted y values, can be passed in as an
            alternative to the model and explanation for a more limited
            view.
        :type pred_y: numpy.ndarray or list[]
        :param model_task: Optional parameter to specify whether the model
            is a classification or regression model. In most cases, the
            type of the model can be inferred based on the shape of the
            output, where a classifier has a predict_proba method and
            outputs a 2 dimensional array, while a regressor has a
            predict method and outputs a 1 dimensional array.
        :type model_task: str
        :param metric: The metric name to evaluate at each tree node or
            heatmap grid.  Currently supported classification metrics
            include 'error_rate', 'recall_score', 'precision_score',
            'f1_score', and 'accuracy_score'. Supported regression
            metrics include 'mean_absolute_error', 'mean_squared_error',
            'r2_score', and 'median_absolute_error'.
        :type metric: str
        """
        self.input = ErrorAnalysisDashboardInput(
            explanation, model, dataset, true_y, classes,
            features, categorical_features,
            true_y_dataset, pred_y, model_task, metric)
        super(ErrorAnalysisDashboard, self).__init__(
            dashboard_type="ErrorAnalysis",
            model_data=self.input.dashboard_input,
            public_ip=public_ip,
            port=port,
            locale=locale)

        if pred_y is None:
            def predict():
                data = request.get_json(force=True)
                return jsonify(self.input.on_predict(data))

            self.add_url_rule(predict, '/predict', methods=["POST"])

        def tree():
            data = request.get_json(force=True)
            return jsonify(self.input.debug_ml(data[0], data[1], data[2]))

        self.add_url_rule(tree, '/tree', methods=["POST"])

        def matrix():
            data = request.get_json(force=True)
            return jsonify(self.input.matrix(data[0], data[1], data[2]))

        self.add_url_rule(matrix, '/matrix', methods=["POST"])

        def importances():
            return jsonify(self.input.importances())

        self.add_url_rule(importances, '/importances', methods=["POST"])
