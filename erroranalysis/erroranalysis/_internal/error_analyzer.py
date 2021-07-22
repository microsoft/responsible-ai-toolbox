# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
import numpy as np
from abc import ABC, abstractmethod
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OrdinalEncoder
from sklearn.feature_selection import (
    mutual_info_classif, mutual_info_regression)
from erroranalysis._internal.matrix_filter import (
    compute_matrix as _compute_matrix)
from erroranalysis._internal.surrogate_error_tree import (
    compute_error_tree as _compute_error_tree)
from erroranalysis._internal.error_report import ErrorReport
from erroranalysis._internal.constants import ModelTask, Metrics
from erroranalysis._internal.version_checker import check_pandas_version


class BaseAnalyzer(ABC):
    def __init__(self,
                 dataset,
                 true_y,
                 feature_names,
                 categorical_features,
                 model_task,
                 metric):
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
        if model_task == ModelTask.CLASSIFICATION:
            if metric is None:
                metric = Metrics.ERROR_RATE
        else:
            if metric is None:
                metric = Metrics.MEAN_SQUARED_ERROR
        self._metric = metric
        if self._categorical_features:
            self._categorical_indexes = [feature_names.index(feature)
                                         for feature
                                         in self._categorical_features]
            ordinal_enc = OrdinalEncoder()
            ct = ColumnTransformer([('ord', ordinal_enc,
                                     self._categorical_indexes)],
                                   remainder='drop')
            self._string_ind_data = ct.fit_transform(self._dataset)
            transformer_categories = ct.transformers_[0][1].categories_
            for category_arr, category_index in zip(transformer_categories,
                                                    self._categorical_indexes):
                category_values = category_arr.tolist()
                self._categories.append(category_values)
                self._category_dictionary[category_index] = category_values
        check_pandas_version(self.feature_names)

    @property
    def categories(self):
        return self._categories

    @property
    def category_dictionary(self):
        return self._category_dictionary

    @property
    def categorical_features(self):
        return self._categorical_features

    @property
    def categorical_indexes(self):
        return self._categorical_indexes

    @property
    def dataset(self):
        return self._dataset

    @property
    def feature_names(self):
        return self._feature_names

    @property
    def string_indexed_data(self):
        return self._string_ind_data

    @property
    def true_y(self):
        return self._true_y

    @property
    def model_task(self):
        return self._model_task

    @property
    def metric(self):
        return self._metric

    def compute_matrix(self, features, filters, composite_filters):
        return _compute_matrix(self, features, filters, composite_filters)

    def compute_error_tree(self,
                           features,
                           filters,
                           composite_filters,
                           max_depth=None,
                           num_leaves=None):
        return _compute_error_tree(self,
                                   features,
                                   filters,
                                   composite_filters,
                                   max_depth=max_depth,
                                   num_leaves=num_leaves)

    def create_error_report(self,
                            filter_features=None,
                            max_depth=None,
                            num_leaves=None):
        tree = self.compute_error_tree(self.feature_names,
                                       None,
                                       None,
                                       max_depth=max_depth,
                                       num_leaves=num_leaves)
        matrix = None
        if filter_features is not None:
            matrix = self.compute_matrix(filter_features,
                                         None,
                                         None)
        return ErrorReport(tree, matrix)

    def compute_importances(self):
        input_data = self.dataset
        diff = self.get_diff()
        if isinstance(self.dataset, pd.DataFrame):
            input_data = input_data.to_numpy()
        if self.categorical_features:
            # Inplace replacement of columns
            indexes = self.categorical_indexes
            string_ind_data = self.string_indexed_data
            for idx, c_i in enumerate(indexes):
                input_data[:, c_i] = string_ind_data[:, idx]
        if self._model_task == ModelTask.CLASSIFICATION:
            # compute the feature importances using mutual information
            return mutual_info_classif(input_data, diff).tolist()
        else:
            return mutual_info_regression(input_data, diff).tolist()

    def _make_pandas_copy(self, dataset):
        if isinstance(dataset, pd.DataFrame):
            return dataset.copy()
        return dataset

    @abstractmethod
    def get_diff(self):
        pass


class ModelAnalyzer(BaseAnalyzer):
    def __init__(self,
                 model,
                 dataset,
                 true_y,
                 feature_names,
                 categorical_features,
                 model_task=ModelTask.UNKNOWN,
                 metric=None):
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
                                            metric)

    @property
    def model(self):
        return self._model

    def get_diff(self):
        if self._model_task == ModelTask.CLASSIFICATION:
            return self.model.predict(self.dataset) != self.true_y
        else:
            return self.model.predict(self.dataset) - self.true_y


class PredictionsAnalyzer(BaseAnalyzer):
    def __init__(self,
                 pred_y,
                 dataset,
                 true_y,
                 feature_names,
                 categorical_features,
                 model_task=ModelTask.CLASSIFICATION,
                 metric=None):
        self._pred_y = pred_y
        if model_task == ModelTask.UNKNOWN:
            raise ValueError(
                "ModelTask cannot be 'unknown' when passing predictions")
        super(PredictionsAnalyzer, self).__init__(dataset,
                                                  true_y,
                                                  feature_names,
                                                  categorical_features,
                                                  model_task,
                                                  metric)

    @property
    def pred_y(self):
        return self._pred_y

    def get_diff(self):
        return self.pred_y != self.true_y
