# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import traceback

import numpy as np
import pandas as pd

from erroranalysis._internal.constants import (Metrics, display_name_to_metric,
                                               metric_to_display_name)
from erroranalysis._internal.error_analyzer import (ModelAnalyzer,
                                                    PredictionsAnalyzer)
from erroranalysis._internal.metrics import metric_to_func
from responsibleai._input_processing import _convert_to_list
from responsibleai._interfaces import ErrorAnalysisData
from responsibleai.serialization_utilities import serialize_json_safe

from .constants import ModelTask
from .error_analysis_constants import (ErrorAnalysisDashboardInterface,
                                       MethodConstants)
from .error_handling import _format_exception
from .explanation_constants import (ExplanationDashboardInterface,
                                    WidgetRequestResponseConstants)
from .utils import _is_classifier

FEATURE_NAMES = ExplanationDashboardInterface.FEATURE_NAMES
ENABLE_PREDICT = ErrorAnalysisDashboardInterface.ENABLE_PREDICT
ROOT_COVERAGE = 100


class ErrorAnalysisDashboardInput:
    def __init__(
            self,
            explanation,
            model,
            dataset,
            true_y,
            classes,
            features,
            categorical_features,
            true_y_dataset,
            pred_y,
            pred_y_dataset,
            model_task,
            metric,
            max_depth,
            num_leaves,
            min_child_samples,
            sample_dataset):
        """Initialize the ErrorAnalysis Dashboard Input.

        :param explanation: An object that represents an explanation.
        :type explanation: ExplanationMixin
        :param model: An object that represents a model.
            It is assumed that for the classification case
            it has a method of predict_proba() returning
            the prediction probabilities for each
            class and for the regression case a method of predict()
            returning the prediction value.
        :type model: object
        :param dataset: A matrix of feature vector examples
        (# examples x # features), the same samples
            used to build the explanation.
            Will overwrite any set on explanation object already.
        :type dataset: numpy.array or list[][] or pandas.DataFrame
        :param true_y: The true labels for the provided explanation.
            Will overwrite any set on explanation object already.
        :type true_y: numpy.array or list[] or pandas.Series
        :param classes: The class names.
        :type classes: numpy.array or list[]
        :param features: Feature names.
        :type features: numpy.array or list[]
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param true_y_dataset: The true labels for the provided dataset.
        Only needed if the explanation has a sample of instances from the
        original dataset.  Otherwise specify true_y parameter only.
        :type true_y_dataset: numpy.array or list[] or pandas.Series
        :param pred_y: The predicted y values, can be passed in as an
            alternative to the model and explanation for a more limited
            view.
        :type pred_y: numpy.ndarray or list[] or pandas.Series
        :param pred_y_dataset: The predicted labels for the provided dataset.
            Only needed if providing a sample dataset for the UI while using
            the full dataset for the tree view and heatmap. Otherwise specify
            pred_y parameter only.
        :type pred_y_dataset: numpy.array or list[] or pandas.Series
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
        """
        self._model = model
        full_dataset = dataset
        if true_y_dataset is None:
            full_true_y = true_y
        else:
            full_true_y = true_y_dataset
        if pred_y_dataset is None:
            full_pred_y = pred_y
        else:
            full_pred_y = pred_y_dataset
        self._categorical_features = categorical_features
        self._string_ind_data = None
        self._categories = []
        self._categorical_indexes = []
        self._is_classifier = _is_classifier(model)
        self._dataframeColumns = None
        self.dashboard_input = {}
        has_explanation = explanation is not None
        feature_length = None
        probability_y = None

        if has_explanation:
            if classes is None:
                has_classes_attr = hasattr(explanation, 'classes')
                if has_classes_attr and explanation.classes is not None:
                    classes = explanation.classes
            dataset, true_y = self.input_explanation(explanation,
                                                     dataset,
                                                     true_y)
            row_length = len(dataset)
            # Only check dataset on explanation for row length bounds
            if row_length > 100000:
                raise ValueError(
                    "Exceeds maximum number of rows"
                    "for visualization (100000)")
        elif sample_dataset is not None:
            dataset = sample_dataset

        if classes is not None:
            classes = _convert_to_list(classes)
            self.dashboard_input[
                ExplanationDashboardInterface.CLASS_NAMES
            ] = classes
            class_to_index = {k: v for v, k in enumerate(classes)}

        if isinstance(dataset, pd.DataFrame) and hasattr(dataset, 'columns'):
            self._dataframeColumns = dataset.columns
            self._dfdtypes = dataset.dtypes
        try:
            list_dataset = _convert_to_list(dataset)
        except Exception as ex:
            ex_str = _format_exception(ex)
            raise ValueError(
                "Unsupported dataset type, inner error: {}".format(ex_str))

        if has_explanation:
            self.input_explanation_data(list_dataset, classes)
            if features is None and hasattr(explanation, 'features'):
                features = explanation.features

        model_available = model is not None

        if model_available and pred_y is not None:
            raise ValueError(
                'Only model or pred_y can be specified, not both')

        self.dashboard_input[ENABLE_PREDICT] = model_available

        if model_available:
            predicted_y = self.compute_predicted_y(model, dataset)
        else:
            predicted_y = self.predicted_y_to_list(pred_y)

        if predicted_y is not None:
            # If classes specified, convert predicted_y to
            # numeric representation
            if classes is not None and predicted_y[0] in class_to_index:
                for i in range(len(predicted_y)):
                    predicted_y[i] = class_to_index[predicted_y[i]]
            self.dashboard_input[
                ExplanationDashboardInterface.PREDICTED_Y
            ] = predicted_y
        row_length = 0
        if list_dataset is not None:
            row_length, feature_length = np.shape(list_dataset)
            if feature_length > 1000:
                raise ValueError("Exceeds maximum number of features for"
                                 " visualization (1000). Please regenerate the"
                                 " explanation using fewer features or"
                                 " initialize the dashboard without passing a"
                                 " dataset.")
            self.dashboard_input[
                ExplanationDashboardInterface.TRAINING_DATA
            ] = serialize_json_safe(list_dataset)
            self.dashboard_input[
                ExplanationDashboardInterface.IS_CLASSIFIER
            ] = self._is_classifier

        if true_y is not None and len(true_y) == row_length:
            list_true_y = _convert_to_list(true_y)
            # If classes specified, convert true_y to numeric representation
            if classes is not None and list_true_y[0] in class_to_index:
                for i in range(len(list_true_y)):
                    list_true_y[i] = class_to_index[list_true_y[i]]
            self.dashboard_input[
                ExplanationDashboardInterface.TRUE_Y
            ] = list_true_y

        if features is not None:
            features = _convert_to_list(features)
            if feature_length is not None and len(features) != feature_length:
                raise ValueError("Feature vector length mismatch:"
                                 " feature names length differs"
                                 " from local explanations dimension")
            self.dashboard_input[FEATURE_NAMES] = features
        if model_available and _is_classifier(model) and \
                dataset is not None:
            try:
                probability_y = model.predict_proba(dataset)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError("Model does not support predict_proba method"
                                 " for given dataset type,"
                                 " inner error: {}".format(ex_str))
            try:
                probability_y = _convert_to_list(probability_y)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Model predict_proba output of unsupported type,"
                    "inner error: {}".format(ex_str))
            self.dashboard_input[
                ExplanationDashboardInterface.PROBABILITY_Y
            ] = probability_y
        if model_available:
            self._error_analyzer = ModelAnalyzer(model,
                                                 full_dataset,
                                                 full_true_y,
                                                 features,
                                                 categorical_features,
                                                 model_task,
                                                 metric,
                                                 classes)
        else:
            # Model task cannot be unknown when passing predictions
            # Assume classification for backwards compatibility
            if model_task == ModelTask.UNKNOWN:
                model_task = ModelTask.CLASSIFICATION
            self._error_analyzer = PredictionsAnalyzer(full_pred_y,
                                                       full_dataset,
                                                       full_true_y,
                                                       features,
                                                       categorical_features,
                                                       model_task,
                                                       metric,
                                                       classes)
        if self._categorical_features:
            self.dashboard_input[
                ExplanationDashboardInterface.CATEGORICAL_MAP
            ] = serialize_json_safe(self._error_analyzer.category_dictionary)
        # Compute metrics on all data cohort
        if self._error_analyzer.model_task == ModelTask.CLASSIFICATION:
            if self._error_analyzer.metric is None:
                metric = Metrics.ERROR_RATE
            else:
                metric = self._error_analyzer.metric
        else:
            if self._error_analyzer.metric is None:
                metric = Metrics.MEAN_SQUARED_ERROR
            else:
                metric = self._error_analyzer.metric
        if model_available:
            full_pred_y = self.compute_predicted_y(model, full_dataset)
        # If we don't have an explanation or model/probabilities specified
        # we can try to use model task to figure out the method
        if not has_explanation and probability_y is None:
            method = MethodConstants.REGRESSION
            if self._error_analyzer.model_task == ModelTask.CLASSIFICATION:
                if (len(np.unique(predicted_y)) > 2):
                    method = MethodConstants.MULTICLASS
                else:
                    method = MethodConstants.BINARY
            self.dashboard_input[
                ErrorAnalysisDashboardInterface.METHOD
            ] = method

        self.set_root_metric(full_pred_y, full_true_y, metric)
        data = self.get_error_analysis_data(max_depth,
                                            num_leaves,
                                            min_child_samples,
                                            metric)
        self.dashboard_input[
            ExplanationDashboardInterface.ERROR_ANALYSIS_DATA
        ] = data

    def get_error_analysis_data(self, max_depth, num_leaves,
                                min_child_samples, metric):
        data = ErrorAnalysisData()
        data.maxDepth = max_depth
        data.numLeaves = num_leaves
        data.minChildSamples = min_child_samples
        data.metric = metric_to_display_name[metric]
        return data

    def set_root_metric(self, predicted_y, true_y, metric):
        if metric != Metrics.ERROR_RATE:
            metric_func = metric_to_func[metric]
            metric_value = metric_func(predicted_y, true_y)
        else:
            total = len(true_y)
            if total == 0:
                metric_value = 0
            else:
                if not isinstance(predicted_y, np.ndarray):
                    predicted_y = np.array(predicted_y)
                if not isinstance(true_y, np.ndarray):
                    true_y = np.array(true_y)
                diff = predicted_y != true_y
                error = sum(diff)
                metric_value = (error / total) * 100
        metric_name = metric_to_display_name[metric]
        root_stats = {
            ExplanationDashboardInterface.ROOT_METRIC_NAME: metric_name,
            ExplanationDashboardInterface.ROOT_METRIC_VALUE: metric_value,
            ExplanationDashboardInterface.ROOT_TOTAL_SIZE: len(true_y),
            ExplanationDashboardInterface.ROOT_ERROR_COVERAGE: ROOT_COVERAGE
        }

        self.dashboard_input[
            ExplanationDashboardInterface.ROOT_STATS
        ] = root_stats

    def compute_predicted_y(self, model, dataset):
        predicted_y = None
        if dataset is not None and model is not None:
            try:
                predicted_y = model.predict(dataset)
            except Exception as ex:
                ex_str = _format_exception(ex)
                msg = "Model does not support predict method for given"
                "dataset type, inner error: {}".format(
                    ex_str)
                raise ValueError(msg)
            predicted_y = self.predicted_y_to_list(predicted_y)
        return predicted_y

    def predicted_y_to_list(self, predicted_y):
        try:
            predicted_y = _convert_to_list(predicted_y)
        except Exception as ex:
            ex_str = _format_exception(ex)
            raise ValueError(
                "Model prediction output of unsupported type,"
                "inner error: {}".format(ex_str))
        return predicted_y

    def input_explanation(self, explanation, dataset, true_y):
        self._mli_explanations = explanation.data(-1)["mli"]
        dataset_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_EXPLANATION_DATASET_KEY)
        if hasattr(explanation, 'method'):
            self.dashboard_input[
                ExplanationDashboardInterface.EXPLANATION_METHOD
            ] = explanation.method
        if dataset_explanation is not None:
            if dataset is None or len(dataset) != len(true_y):
                dataset = dataset_explanation[
                    ExplanationDashboardInterface.MLI_DATASET_X_KEY
                ]
            if true_y is None:
                true_y = dataset_explanation[
                    ExplanationDashboardInterface.MLI_DATASET_Y_KEY
                ]
        elif len(dataset) != len(true_y):
            dataset = explanation._eval_data
        return dataset, true_y

    def input_explanation_data(self, list_dataset, classes):
        # List of explanations, key of explanation type is "explanation_type"
        local_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_LOCAL_EXPLANATION_KEY)
        global_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_GLOBAL_EXPLANATION_KEY)
        ebm_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_EBM_GLOBAL_EXPLANATION_KEY)

        if local_explanation is not None:
            try:
                local_explanation["scores"] = _convert_to_list(
                    local_explanation["scores"])
                if np.shape(local_explanation["scores"])[-1] > 1000:
                    raise ValueError("Exceeds maximum number of features for "
                                     "visualization (1000). Please regenerate"
                                     " the explanation using fewer features.")
                local_explanation["intercept"] = _convert_to_list(
                    local_explanation["intercept"])
                # We can ignore perf explanation data.
                # Note if it is added back at any point,
                # the numpy values will need to be converted to python,
                # otherwise serialization fails.
                local_explanation["perf"] = None
                self.dashboard_input[
                    ExplanationDashboardInterface.LOCAL_EXPLANATIONS
                ] = local_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Unsupported local explanation type,"
                    "inner error: {}".format(ex_str))
            if list_dataset is not None:
                row_length, feature_length = np.shape(list_dataset)
                local_dim = np.shape(local_explanation["scores"])
                if len(local_dim) != 2 and len(local_dim) != 3:
                    raise ValueError(
                        "Local explanation expected to be a 2D or 3D list")
                if len(local_dim) == 2 and (local_dim[1] != feature_length or
                                            local_dim[0] != row_length):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        "length differs from dataset")
                if len(local_dim) == 3 and (local_dim[2] != feature_length or
                                            local_dim[1] != row_length):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        " length differs from dataset")
                if classes is not None and len(classes) != local_dim[0]:
                    raise ValueError("Class vector length mismatch:"
                                     "class names length differs from"
                                     "local explanations dimension")
        if local_explanation is None and global_explanation is not None:
            try:
                global_explanation["scores"] = _convert_to_list(
                    global_explanation["scores"])
                if 'intercept' in global_explanation:
                    global_explanation["intercept"] = _convert_to_list(
                        global_explanation["intercept"])
                self.dashboard_input[
                    ExplanationDashboardInterface.GLOBAL_EXPLANATION
                ] = global_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError("Unsupported global explanation type,"
                                 "inner error: {}".format(ex_str))
        if ebm_explanation is not None:
            try:
                self.dashboard_input[
                    ExplanationDashboardInterface.EBM_EXPLANATION
                ] = ebm_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Unsupported ebm explanation type: {}".format(ex_str))

    def debug_ml(self, data):
        try:
            features = data[0]
            filters = data[1]
            composite_filters = data[2]
            max_depth = data[3]
            num_leaves = data[4]
            min_child_samples = data[5]
            metric = display_name_to_metric[data[6]]
            self._error_analyzer.update_metric(metric)
            tree = self._error_analyzer.compute_error_tree(
                features, filters, composite_filters,
                max_depth=max_depth,
                num_leaves=num_leaves,
                min_child_samples=min_child_samples)
            return {
                WidgetRequestResponseConstants.DATA: tree
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Failed to generate json tree representation",
                WidgetRequestResponseConstants.DATA: []
            }

    def matrix(self, features, filters, composite_filters,
               quantile_binning, num_bins, metric):
        try:
            if features[0] is None and features[1] is None:
                return {WidgetRequestResponseConstants.DATA: []}
            metric = display_name_to_metric[metric]
            self._error_analyzer.update_metric(metric)
            matrix = self._error_analyzer.compute_matrix(
                features, filters, composite_filters,
                quantile_binning, num_bins)
            return {
                WidgetRequestResponseConstants.DATA: matrix
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Failed to generate json matrix representation",
                WidgetRequestResponseConstants.DATA: []
            }

    def importances(self):
        try:
            scores = self._error_analyzer.compute_importances()
            return {
                WidgetRequestResponseConstants.DATA: scores
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Failed to generate feature importances",
                WidgetRequestResponseConstants.DATA: []
            }

    def on_predict(self, data):
        try:
            if self._dataframeColumns is not None:
                data = pd.DataFrame(data, columns=self._dataframeColumns)
                data = data.astype(dict(self._dfdtypes))
            if (self._is_classifier):
                model_pred_proba = self._model.predict_proba(data)
                prediction = _convert_to_list(model_pred_proba)
            else:
                model_predict = self._model.predict(data)
                prediction = _convert_to_list(model_predict)
            return {
                WidgetRequestResponseConstants.DATA: prediction
            }
        except Exception:
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Model threw exception while predicting...",
                WidgetRequestResponseConstants.DATA: []
            }

    def _find_first_explanation(self, key):
        interface = ExplanationDashboardInterface
        explanation_type_key = interface.MLI_EXPLANATION_TYPE_KEY
        new_array = [explanation for explanation
                     in self._mli_explanations
                     if explanation[explanation_type_key] == key]
        if len(new_array) > 0:
            return new_array[0]["value"]
        return None
