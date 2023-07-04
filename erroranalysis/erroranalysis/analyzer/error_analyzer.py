# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the BaseAnalyzer, the ModelAnalyzer and PredictionsAnalyzer."""

from abc import ABC, abstractmethod

import numpy as np
import pandas as pd
from sklearn.feature_selection import (mutual_info_classif,
                                       mutual_info_regression)

from erroranalysis._internal.constants import (ErrorCorrelationMethods,
                                               MatrixParams, Metrics,
                                               ModelTask, RootKeys,
                                               metric_to_display_name)
from erroranalysis._internal.matrix_filter import \
    compute_matrix as _compute_matrix
from erroranalysis._internal.matrix_filter import \
    compute_matrix_on_dataset as _compute_matrix_on_dataset
from erroranalysis._internal.metrics import metric_to_func
from erroranalysis._internal.process_categoricals import process_categoricals
from erroranalysis._internal.surrogate_error_tree import \
    compute_error_tree as _compute_error_tree
from erroranalysis._internal.surrogate_error_tree import \
    compute_error_tree_on_dataset as _compute_error_tree_on_dataset
from erroranalysis._internal.utils import generate_random_unique_indexes
from erroranalysis._internal.version_checker import check_pandas_version
from erroranalysis.error_correlation_methods import (
    compute_ebm_global_importance, compute_gbm_global_importance)
from erroranalysis.report import ErrorReport

BIN_THRESHOLD = MatrixParams.BIN_THRESHOLD
IMPORTANCES_THRESHOLD = 50000
ROOT_COVERAGE = 100
MUTUAL_INFO = ErrorCorrelationMethods.MUTUAL_INFO.value


class BaseAnalyzer(ABC):
    """BaseAnalyzer Class, used by ModelAnalyzer and PredictionsAnalyzer.

    BaseAnalyzer class is the common base class for the ModelAnalyzer
    and PredictionsAnalyzer classes.

    :param dataset:  A matrix of feature vector examples
        (# examples x # features).
    :type dataset: numpy.ndarray or list[][] or pandas.DataFrame
    :param true_y: The true labels for the provided dataset.
    :type true_y: numpy.ndarray or list[] or pandas.Series
    :param feature_names: Feature names.
    :type feature_names: numpy.ndarray or list[]
    :param categorical_features: The categorical feature names.
    :type categorical_features: list[str]
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
    :param classes: The class names.
    :type classes: numpy.ndarray or list[]
    """
    def __init__(self,
                 dataset,
                 true_y,
                 feature_names,
                 categorical_features,
                 model_task,
                 metric,
                 classes):
        self._dataset = self._make_pandas_copy(dataset)
        self._true_y = true_y
        self._categorical_features = categorical_features
        if isinstance(feature_names, np.ndarray):
            feature_names = feature_names.tolist()
        self._feature_names = feature_names
        self._categories = []
        self._categorical_indexes = []
        self._category_dictionary = {}
        self._model_task = model_task
        self._classes = classes
        if model_task == ModelTask.CLASSIFICATION:
            if metric is None:
                metric = Metrics.ERROR_RATE
        else:
            if metric is None:
                metric = Metrics.MEAN_SQUARED_ERROR
        self._metric = metric
        if self._categorical_features:
            self._categories, self._categorical_indexes, \
                self._category_dictionary, self._string_ind_data = \
                process_categoricals(
                    all_feature_names=self._feature_names,
                    categorical_features=self._categorical_features,
                    dataset=self._dataset)
        check_pandas_version(self.feature_names)

    @property
    def categories(self):
        """Get the list of category values for categorical features.

        :return: The list of category values for categorical features.
        :rtype: list
        """
        return self._categories

    @property
    def category_dictionary(self):
        """Get the map from categorical index to the category values.

        :return: The map from categorical index to the category values.
        :rtype: dict
        """
        return self._category_dictionary

    @property
    def categorical_features(self):
        """Get the categorical feature names.

        :return: The categorical feature names.
        :rtype: list[str]
        """
        return self._categorical_features

    @property
    def categorical_indexes(self):
        """Get the categorical feature indexes.

        :return: The categorical feature indexes.
        :rtype: list[int]
        """
        return self._categorical_indexes

    @property
    def classes(self):
        """Get the class names.

        :return: The class names.
        :rtype: numpy.ndarray or list[]
        """
        return self._classes

    @property
    def dataset(self):
        """Get a matrix of feature vector examples (# examples x # features).

        :return: A matrix of feature vector examples
            (# examples x # features).
        :rtype: numpy.ndarray or list[][] or pandas.DataFrame
        """
        return self._dataset

    @property
    def feature_names(self):
        """Get the feature names.

        :return: The feature names.
        :rtype: numpy.ndarray or list[]
        """
        return self._feature_names

    @property
    def string_indexed_data(self):
        """Get the string indexed dataset for categorical features.

        :return: The string indexed dataset for categorical features.
        :rtype: numpy.ndarray or list[][] or pandas.DataFrame
        """
        return self._string_ind_data

    @property
    def true_y(self):
        """Get the true y values.

        :return: The true y values.
        :rtype: numpy.ndarray or list[] or pandas.Series
        """
        return self._true_y

    @property
    def model_task(self):
        """Get the model task.

        Specifies whether the model is a classification
        or regression model. In most cases, the type of the
        model can be inferred based on the shape of the
        output, where a classifier has a predict_proba method and
        outputs a 2 dimensional array, while a regressor has a
        predict method and outputs a 1 dimensional array.

        :return: The model task.
        :rtype: str
        """
        return self._model_task

    @property
    def metric(self):
        """Get the metric name.

        The metric name to evaluate at each tree node or
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

        :return: The metric name.
        :rtype: str
        """
        return self._metric

    def compute_matrix(self,
                       features,
                       filters,
                       composite_filters,
                       quantile_binning=False,
                       num_bins=BIN_THRESHOLD):
        """Computes the matrix filter (aka heatmap) json.

        :param features: One or two feature names to compute the heatmap.
        :type features: list
        :param filters: The filters to apply to the dataset.
        :type filters: list[str]
        :param composite_filters: The composite filters to apply
            to the dataset.
        :type composite_filters: list[str]
        :param quantile_binning: If true, use quantile binning for the
            heatmap. By default uses equal width binning.
        :type quantile_binning: bool
        :param num_bins: The number of bins per feature in the heatmap.
        :type num_bins: int
        :return: The heatmap in json representation.
        :rtype: dict
        """
        return _compute_matrix(self,
                               features,
                               filters,
                               composite_filters,
                               quantile_binning=quantile_binning,
                               num_bins=num_bins)

    def compute_matrix_on_dataset(
            self,
            features,
            dataset,
            quantile_binning=False,
            num_bins=BIN_THRESHOLD):
        """Computes the matrix filter (aka heatmap) json.

        :param features: One or two feature names to compute the heatmap.
        :type features: list
        :param dataset: The dataset on which matrix view needs to be computed.
            The dataset should have the feature columns and the columns
            'true_y' and 'index'. The 'true_y' column should have the true
            target values corresponding to the test data. The 'index'
            column should have the indices. If the analyzer is of type
            PredictionsAnalyzer, then the dataset should include the column
            'pred_y' which will hold the predictions.
        :type dataset: pd.DataFrame
        :param quantile_binning: If true, use quantile binning for the
            heatmap. By default uses equal width binning.
        :type quantile_binning: bool
        :param num_bins: The number of bins per feature in the heatmap.
        :type num_bins: int
        :return: The heatmap in json representation.
        :rtype: dict
        """
        return _compute_matrix_on_dataset(
            self,
            features,
            dataset,
            quantile_binning,
            num_bins
        )

    def compute_error_tree(self,
                           features,
                           filters,
                           composite_filters,
                           max_depth=None,
                           num_leaves=None,
                           min_child_samples=None):
        """Computes the tree view json.

        :param features: The selected feature names to train the
            surrogate model on.
        :type features: list[str]
        :param filters: The filters to apply to the dataset.
        :type filters: list[str]
        :param composite_filters: The composite filters to apply
            to the dataset.
        :type composite_filters: list[str]
        :param max_depth: The maximum depth of the surrogate tree trained
            on errors.
        :type max_depth: int
        :param num_leaves: The number of leaves of the surrogate tree
            trained on errors.
        :type num_leaves: int
        :param min_child_samples: The minimal number of data required to
            create one leaf.
        :type min_child_samples: int
        :return: The tree view in json representation.
        :rtype: dict
        """
        return _compute_error_tree(self,
                                   features,
                                   filters,
                                   composite_filters,
                                   max_depth=max_depth,
                                   num_leaves=num_leaves,
                                   min_child_samples=min_child_samples)

    def compute_error_tree_on_dataset(
            self,
            features,
            dataset,
            max_depth=None,
            num_leaves=None,
            min_child_samples=None):
        """Computes the tree view json.

        :param features: The selected feature names to train the
            surrogate model on.
        :type features: list[str]
        :param dataset: The dataset on which tree view needs to be computed.
            The dataset should have the feature columns and the columns
            'true_y' and 'index'. The 'true_y' column should have the true
            target values corresponding to the test data. The 'index'
            column should have the indices. If the analyzer is of type
            PredictionsAnalyzer, then the dataset should include the column
            'pred_y' which will hold the predictions.
        :type dataset: pd.DataFrame
        :param max_depth: The maximum depth of the surrogate tree trained
            on errors.
        :type max_depth: int
        :param num_leaves: The number of leaves of the surrogate tree
            trained on errors.
        :type num_leaves: int
        :param min_child_samples: The minimal number of data required to
            create one leaf.
        :type min_child_samples: int
        :return: The tree view in json representation.
        :rtype: dict
        """
        return _compute_error_tree_on_dataset(
            self,
            features,
            dataset,
            max_depth=max_depth,
            num_leaves=num_leaves,
            min_child_samples=min_child_samples)

    def create_error_report(self,
                            filter_features=None,
                            max_depth=None,
                            num_leaves=None,
                            min_child_samples=None,
                            compute_importances=False,
                            compute_root_stats=False,
                            error_correlation_method=MUTUAL_INFO):
        """Creates the error analysis ErrorReport.

        The ErrorReport contains the importances, heatmap and tree view json.

        :param filter_features: One or two features to compute the heatmap.
        :type filter_features: list
        :param max_depth: The maximum depth of the surrogate tree trained
            on errors.
        :type max_depth: int
        :param num_leaves: The number of leaves of the surrogate tree
            trained on errors.
        :type num_leaves: int
        :param min_child_samples: The minimal number of data required to
            create one leaf.
        :type min_child_samples: int
        :param compute_importances: If true, computes and adds the
            correlation of features and the error to the ErrorReport.
        :type compute_importances: bool
        :param compute_root_stats: If true, computes and adds the root stats.
        :type compute_root_stats: bool
        :return: The computed error analysis ErrorReport.
        :rtype: dict
        """
        tree = self.compute_error_tree(self.feature_names,
                                       None,
                                       None,
                                       max_depth=max_depth,
                                       num_leaves=num_leaves,
                                       min_child_samples=min_child_samples)
        matrix = None
        if filter_features:
            matrix = self.compute_matrix(filter_features,
                                         None,
                                         None)
        importances = None
        if compute_importances:
            importances = self.compute_importances(error_correlation_method)
        root_stats = None
        if compute_root_stats:
            root_stats = self.compute_root_stats()
        return ErrorReport(tree, matrix,
                           tree_features=self.feature_names,
                           matrix_features=filter_features,
                           importances=importances,
                           root_stats=root_stats)

    def compute_importances(self, error_correlation_method=MUTUAL_INFO):
        """Compute the importances or correlation between features and error.

        Computes the feature importances or the correlation between
        each of the features in the dataset and the error from the label
        and prediction columns.  Uses mutual information, specifically
        uses the scikit-learn methods mutual_info_classif for classification
        and mutual_info_regression for regression tasks.

        :param error_correlation_method: Method to compute error correlation.
        :type error_correlation_method: str
        :return: The computed importances or correlation between the
            features and error.
        :rtype: list[float]
        """
        input_data = self.dataset
        diff = self.get_diff()
        if isinstance(self.dataset, pd.DataFrame):
            input_data = input_data.to_numpy(copy=True)
        if self.categorical_features:
            # Inplace replacement of columns
            indexes = self.categorical_indexes
            string_ind_data = self.string_indexed_data
            for idx, c_i in enumerate(indexes):
                input_data[:, c_i] = string_ind_data[:, idx]
        # for very large number of rows mutual information
        # will be very expensive to compute, hence we sample
        num_rows = input_data.shape[0]
        if num_rows > IMPORTANCES_THRESHOLD:
            indexes = generate_random_unique_indexes(num_rows,
                                                     IMPORTANCES_THRESHOLD)
            input_data = input_data[indexes]
            diff = diff[indexes]
        try:
            importances = self._compute_error_correlation(
                input_data, diff, error_correlation_method)
        except ValueError:
            # Impute input_data if it contains NaNs, infinity or a value too
            # large for dtype('float64')
            input_data = np.nan_to_num(input_data)
            importances = self._compute_error_correlation(
                input_data, diff, error_correlation_method)
        return importances

    def _compute_error_correlation(self, input_data, diff,
                                   error_correlation_method):
        """Compute the correlation between the features and error.

        :param input_data: The input data to compute the error correlation
            on.
        :type input_data: numpy.ndarray
        :param diff: The difference between the label and prediction
            columns.
        :type diff: numpy.ndarray
        :param error_correlation_method: Method to compute error correlation.
        :type error_correlation_method: str
        :return: The computed error correlation between the features and
            error.
        :rtype: list[float]
        """
        # if only one row, replicate it to avoid exception
        if input_data.shape[0] == 1:
            input_data = np.concatenate((input_data, input_data))
            diff = np.concatenate((diff, diff))
        if error_correlation_method == ErrorCorrelationMethods.MUTUAL_INFO:
            n_neighbors = min(3, input_data.shape[0] - 1)
            if self._model_task == ModelTask.CLASSIFICATION:
                return mutual_info_classif(
                    input_data, diff, n_neighbors=n_neighbors).tolist()
            else:
                return mutual_info_regression(
                    input_data, diff, n_neighbors=n_neighbors).tolist()
        elif error_correlation_method == ErrorCorrelationMethods.EBM:
            return compute_ebm_global_importance(
                input_data, diff, self._model_task)
        else:
            return compute_gbm_global_importance(
                input_data, diff, self._model_task, self._categorical_indexes)

    def compute_root_stats(self):
        """Compute the root all data statistics.

        :return: The computed root statistics.
        :rtype: dict
        """
        if self.metric != Metrics.ERROR_RATE:
            metric_func = metric_to_func[self.metric]
            metric_value = metric_func(self.pred_y, self.true_y)
        else:
            total = len(self.true_y)
            if total == 0:
                metric_value = 0
            else:
                diff = self.get_diff()
                error = sum(diff)
                metric_value = (error / total) * 100
        metric_name = metric_to_display_name[self.metric]
        root_stats = {
            RootKeys.METRIC_NAME: metric_name,
            RootKeys.METRIC_VALUE: metric_value,
            RootKeys.TOTAL_SIZE: len(self.true_y),
            RootKeys.ERROR_COVERAGE: ROOT_COVERAGE
        }
        return root_stats

    def update_metric(self, metric):
        """Update the metric used by the error analyzer.

        Updates the metric used by the heatmap and tree view.

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
        """
        self._metric = metric

    def _make_pandas_copy(self, dataset):
        """Makes a copy of the dataset if it is a pandas dataframe.

        :param dataset:  A matrix of feature vector examples
            (# examples x # features).
        :type dataset: numpy.ndarray or list[][] or pandas.DataFrame
        :return: The new dataset if a pandas dataframe or the original one.
        :rtype: numpy.ndarray or list[][] or pandas.DataFrame
        """
        if isinstance(dataset, pd.DataFrame):
            return dataset.copy()
        return dataset

    @abstractmethod
    def get_diff(self):
        """Abstract method to get the error.

        Computes the difference between the predictions and true y labels.

        :return: The difference between the predictions
            and true y labels.
        :rtype: numpy.ndarray
        """
        pass

    @abstractmethod
    def pred_y(self):
        """Abstract method to get the predicted y labels.

        :return: The predicted y labels.
        :rtype: numpy.ndarray or list[] or pandas.Series
        """
        pass


class ModelAnalyzer(BaseAnalyzer):
    """ModelAnalyzer Class.

    ModelAnalyzer class uses the model to compute predictions and
    the true label columns to create the error analysis tree view
    and heatmap.

    :param model: An object that represents a model.
        It is assumed that for the classification case
        it has a method of predict_proba() returning
        the prediction probabilities for each
        class and for the regression case a method of predict()
        returning the prediction value.
    :type model: object
    :param dataset:  A matrix of feature vector examples
        (# examples x # features).
    :type dataset: numpy.ndarray or list[][] or pandas.DataFrame
    :param true_y: The true labels for the provided dataset.
    :type true_y: numpy.ndarray or list[] or pandas.Series
    :param feature_names: Feature names.
    :type feature_names: numpy.ndarray or list[]
    :param categorical_features: The categorical feature names.
    :type categorical_features: list[str]
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
    :param classes: The class names.
    :type classes: numpy.ndarray or list[]
    """
    def __init__(self,
                 model,
                 dataset,
                 true_y,
                 feature_names,
                 categorical_features,
                 model_task=ModelTask.UNKNOWN,
                 metric=None,
                 classes=None):
        self._model = model
        if model_task == ModelTask.UNKNOWN:
            # Try to automatically infer the model task
            predict_proba_flag = hasattr(model, 'predict_proba')
            if predict_proba_flag:
                model_task = ModelTask.CLASSIFICATION
            else:
                model_task = ModelTask.REGRESSION
        super(ModelAnalyzer, self).__init__(dataset,
                                            true_y,
                                            feature_names,
                                            categorical_features,
                                            model_task,
                                            metric,
                                            classes)

    @property
    def model(self):
        """Get the object that represents the model.

        :return: An object that represents a model.
            It is assumed that for the classification case
            it has a method of predict_proba() returning
            the prediction probabilities for each
            class and for the regression case a method of predict()
            returning the prediction value.
        :rtype: object
        """
        return self._model

    def get_diff(self):
        """Difference between the model's predictions and true y labels.

        For regression case, computes the difference
        (model's predictions - true y labels)
        and for classification case, finds the non-matching labels by
        (model's predictions != true y labels)

        :return: The difference between the model's predictions
            and true y labels.
        :rtype: numpy.ndarray
        """
        if self._model_task == ModelTask.CLASSIFICATION:
            return self.model.predict(self.dataset) != self.true_y
        else:
            return self.model.predict(self.dataset) - self.true_y

    @property
    def pred_y(self):
        """Get the computed predicted y values.

        Note for ModelAnalyzer these are computed on the fly.

        :return: The computed predicted y values.
        :rtype: numpy.ndarray or list[] or pandas.Series
        """
        return self.model.predict(self.dataset)


class PredictionsAnalyzer(BaseAnalyzer):
    """PredictionsAnalyzer Class.

    PredictionsAnalyzer class uses the prediction and true label columns
    to create the error analysis tree view and heatmap.

    :param pred_y:  The predicted y values, can be passed in as an
        alternative to the model.
    :type pred_y: numpy.ndarray or list[] or pandas.Series
    :param dataset:  A matrix of feature vector examples
        (# examples x # features).
    :type dataset: numpy.ndarray or list[][] or pandas.DataFrame
    :param true_y: The true labels for the provided dataset.
    :type true_y: numpy.ndarray or list[] or pandas.Series
    :param feature_names: Feature names.
    :type feature_names: numpy.ndarray or list[]
    :param categorical_features: The categorical feature names.
    :type categorical_features: list[str]
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
    :param classes: The class names.
    :type classes: numpy.ndarray or list[]
    """
    def __init__(self,
                 pred_y,
                 dataset,
                 true_y,
                 feature_names,
                 categorical_features,
                 model_task=ModelTask.CLASSIFICATION,
                 metric=None,
                 classes=None):
        self._pred_y = pred_y
        if model_task == ModelTask.UNKNOWN:
            raise ValueError(
                "ModelTask cannot be 'unknown' when passing predictions")
        super(PredictionsAnalyzer, self).__init__(dataset,
                                                  true_y,
                                                  feature_names,
                                                  categorical_features,
                                                  model_task,
                                                  metric,
                                                  classes)

    @property
    def pred_y(self):
        """Get the predicted y values.

        :return: The predicted y values.
        :rtype: numpy.ndarray or list[] or pandas.Series
        """
        return self._pred_y

    def get_diff(self):
        """Difference between the predictions and true y labels.

        For regression case, computes the difference
        (pred y - true y labels)
        and for classification case, finds the non-matching labels by
        (pred y != true y labels)

        :return: The difference between the predictions
            and true y labels.
        :rtype: numpy.ndarray
        """
        return self.pred_y != self.true_y
