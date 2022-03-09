# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the ErrorAnalysis dashboard class."""

from flask import jsonify, request

from .constants import ModelTask
from .dashboard import Dashboard
from .error_analysis_dashboard_input import ErrorAnalysisDashboardInput

DEFAULT_MAX_DEPTH = 3
DEFAULT_NUM_LEAVES = 31
DEFAULT_MIN_CHILD_SAMPLES = 20


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
    :type dataset: pd.DataFrame or numpy.ndarray or list[][]
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
    :param pred_y_dataset: The predicted labels for the provided dataset.
        Only needed if providing a sample dataset for the UI while using
        the full dataset for the tree view and heatmap. Otherwise specify
        pred_y parameter only.
    :type pred_y_dataset: numpy.ndarray or list[] or pandas.Series
    :param model_task: Optional parameter to specify whether the model
        is a classification or regression model. In most cases, the
        type of the model can be inferred based on the shape of the
        output, where a classifier has a predict_proba method and
        outputs a 2 dimensional array, while a regressor has a
        predict method and outputs a 1 dimensional array.
    :type model_task: str
    :param metric: The metric name to evaluate at each tree node or
        heatmap grid.  Currently supported classification metrics
        include 'error_rate', 'recall_score' for binary
        classification and 'micro_recall_score' or
        'macro_recall_score' for multiclass classification,
        'precision_score' for binary classification and
        'micro_precision_score' or 'macro_precision_score'
        for multiclass classification, 'f1_score' for binary
        classification and 'micro_f1_score' or 'macro_f1_score'
        for multiclass classification, and 'accuracy_score'.
        Supported regression metrics include 'mean_absolute_error',
        'mean_squared_error', 'r2_score', and 'median_absolute_error'.
    :type metric: str
    :param max_depth: The maximum depth of the surrogate tree trained
        on errors.
    :type max_depth: int
    :param num_leaves: The number of leaves of the surrogate tree
        trained on errors.
    :type num_leaves: int
    :param min_child_samples: The minimal number of data required
        to create one leaf.
    :type min_child_samples: int
    :param sample_dataset: Dataset with fewer samples than the main
        dataset. Used to improve performance only when an
        Explanation object is not provided.  Used only if
        explanation is not specified for the dataset explorer.
        Specify less than 10k points for optimal performance.
    :type sample_dataset: pd.DataFrame or numpy.ndarray or list[][]
    :param locale: The language in which user wants to load and access the
        ErrorAnalysis Dashboard. The default language is english ("en").
    :type locale: str

    :Example:

    Run simple view of error analysis with just predictions and true labels

    >>> predictions = model.predict(X_test)
    >>> from raiwidgets import ErrorAnalysisDashboard
    >>> ErrorAnalysisDashboard(dataset=X_test, true_y=y_test,
    ...                        features=features, pred_y=predictions)

    :Example:

    Run error analysis with a model and a computed explanation

    >>> from raiwidgets import ErrorAnalysisDashboard
    >>> ErrorAnalysisDashboard(global_explanation, model,
    ...                        dataset=X_test, true_y=y_test)

    :Example:

    Run error analysis on large data and a downsampled dataset for the UI

    >>> from raiwidgets import ErrorAnalysisDashboard
    >>> ErrorAnalysisDashboard(sample_dataset=X_test_sample,
    ...                        dataset=X_test,
    ...                        features=features,
    ...                        true_y=y_test_sample,
    ...                        true_y_dataset=y_test,
    ...                        pred_y=X_test_sample_pred_y,
    ...                        pred_y_dataset=X_test_pred_y)
    """

    def __init__(self, explanation=None, model=None, *, dataset=None,
                 true_y=None, classes=None, features=None, port=None,
                 locale=None, public_ip=None,
                 categorical_features=None, true_y_dataset=None,
                 pred_y=None, pred_y_dataset=None,
                 model_task=ModelTask.UNKNOWN,
                 metric=None, max_depth=DEFAULT_MAX_DEPTH,
                 num_leaves=DEFAULT_NUM_LEAVES,
                 min_child_samples=DEFAULT_MIN_CHILD_SAMPLES,
                 sample_dataset=None):
        """Initialize the ErrorAnalysisDashboard."""
        self.input = ErrorAnalysisDashboardInput(
            explanation, model, dataset, true_y, classes,
            features, categorical_features,
            true_y_dataset, pred_y, pred_y_dataset,
            model_task, metric,
            max_depth, num_leaves, min_child_samples,
            sample_dataset)
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
            return jsonify(self.input.debug_ml(data))

        self.add_url_rule(tree, '/tree', methods=["POST"])

        def matrix():
            data = request.get_json(force=True)
            matrix_result = self.input.matrix(data[0], data[1], data[2],
                                              data[3], data[4], data[5])
            return jsonify(matrix_result)

        self.add_url_rule(matrix, '/matrix', methods=["POST"])

        def importances():
            return jsonify(self.input.importances())

        self.add_url_rule(importances, '/importances', methods=["POST"])
