# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
import numpy as np
from abc import ABC, abstractmethod
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OrdinalEncoder
from sklearn.feature_selection import mutual_info_classif
from erroranalysis._internal.matrix_filter import compute_json_matrix
from erroranalysis._internal.surrogate_error_tree import (
    compute_json_error_tree)
from erroranalysis._internal.error_report import ErrorReport


class BaseAnalyzer(ABC):
    def __init__(self, dataset, true_y, feature_names,
                 categorical_features):
        self._dataset = self._make_pandas_copy(dataset)
        self._true_y = true_y
        self._categorical_features = categorical_features
        if isinstance(feature_names, np.ndarray):
            feature_names = feature_names.tolist()
        self._feature_names = feature_names
        self._categories = []
        self._categorical_indexes = []
        self._category_dictionary = {}
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

    def compute_matrix(self, features, filters, composite_filters):
        return compute_json_matrix(self, features, filters, composite_filters)

    def compute_error_tree(self,
                           features,
                           filters,
                           composite_filters,
                           max_depth=None,
                           num_leaves=None):
        return compute_json_error_tree(self,
                                       features,
                                       filters,
                                       composite_filters,
                                       max_depth=max_depth,
                                       num_leaves=num_leaves)

    def create_error_report(self,
                            filter_features,
                            max_depth,
                            num_leaves):
        json_tree = self.compute_error_tree(self.feature_names,
                                            None,
                                            None,
                                            max_depth=max_depth,
                                            num_leaves=num_leaves)
        json_matrix = None
        if filter_features is not None:
            json_matrix = self.compute_matrix(filter_features,
                                              None,
                                              None)
        return ErrorReport(json_tree, json_matrix)

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
        # compute the feature importances using mutual information
        return mutual_info_classif(input_data, diff).tolist()

    def _make_pandas_copy(self, dataset):
        if isinstance(dataset, pd.DataFrame):
            return dataset.copy()
        return dataset

    @abstractmethod
    def get_diff(self):
        pass


class ModelAnalyzer(BaseAnalyzer):
    def __init__(self, model, dataset, true_y, feature_names,
                 categorical_features):
        self._model = model
        super(ModelAnalyzer, self).__init__(dataset, true_y, feature_names,
                                            categorical_features)

    @property
    def model(self):
        return self._model

    def get_diff(self):
        return self.model.predict(self.dataset) != self.true_y


class PredictionsAnalyzer(BaseAnalyzer):
    def __init__(self, pred_y, dataset, true_y, feature_names,
                 categorical_features):
        self._pred_y = pred_y
        super(PredictionsAnalyzer, self).__init__(dataset, true_y,
                                                  feature_names,
                                                  categorical_features)

    @property
    def pred_y(self):
        return self._pred_y

    def get_diff(self):
        return self.pred_y != self.true_y
