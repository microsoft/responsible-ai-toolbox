# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OrdinalEncoder
from erroranalysis._internal.matrix_filter import compute_json_matrix
from erroranalysis._internal.surrogate_error_tree import (
    compute_json_error_tree)


class ErrorAnalyzer(object):
    def __init__(self, model, dataset, true_y, feature_names,
                 categorical_features):
        self._model = model
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
    def model(self):
        return self._model

    @property
    def string_indexed_data(self):
        return self._string_ind_data

    @property
    def true_y(self):
        return self._true_y

    def compute_matrix(self, features, filters, composite_filters):
        return compute_json_matrix(self, features, filters, composite_filters)

    def compute_error_tree(self, features, filters, composite_filters):
        return compute_json_error_tree(self, features, filters,
                                       composite_filters)

    def _make_pandas_copy(self, dataset):
        if isinstance(dataset, pd.DataFrame):
            return dataset.copy()
        return dataset
