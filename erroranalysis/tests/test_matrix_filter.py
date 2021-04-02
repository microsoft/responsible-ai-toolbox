# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    StandardScaler, OneHotEncoder, FunctionTransformer)

from erroranalysis._internal.error_analyzer import ErrorAnalyzer
from erroranalysis._internal.matrix_filter import (
    CATEGORY1, CATEGORY2, COUNT, FALSE_COUNT, MATRIX, VALUES)
from common_utils import (
    create_iris_data, create_cancer_data, create_simple_titanic_data,
    create_binary_classification_dataset, create_models)


class TestMatrixFilter(object):

    def test_matrix_filter_iris(self):
        x_train, x_test, y_train, y_test, feature_names, _ = create_iris_data()

        models = create_models(x_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, x_test, y_test, feature_names,
                               categorical_features)

    def test_matrix_filter_cancer(self):
        x_train, x_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        models = create_models(x_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, x_test, y_test, feature_names,
                               categorical_features)

    def test_matrix_filter_binary_classification(self):
        x_train, y_train, x_test, y_test, _ = \
            create_binary_classification_dataset()
        feature_names = list(x_train.columns)
        models = create_models(x_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, x_test, y_test, feature_names,
                               categorical_features)

    def test_matrix_filter_titanic(self):
        x_train, x_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        feature_names = categorical + numeric

        def conv(X):
            if isinstance(X, pd.Series):
                return X.values
            return X

        many_to_one_transformer = \
            FunctionTransformer(lambda x: conv(x.sum(axis=1)).reshape(-1, 1))
        many_to_many_transformer = \
            FunctionTransformer(lambda x: np.hstack(
                (conv(np.prod(x, axis=1)).reshape(-1, 1),
                 conv(np.prod(x, axis=1)**2).reshape(-1, 1))
            ))
        transformations = ColumnTransformer([
            ("age_fare_1", Pipeline(steps=[
                ('imputer', SimpleImputer(strategy='median')),
                ('scaler', StandardScaler())
            ]), ["age", "fare"]),
            ("age_fare_2", many_to_one_transformer, ["age", "fare"]),
            ("age_fare_3", many_to_many_transformer, ["age", "fare"]),
            ("embarked", Pipeline(steps=[
                ("imputer",
                 SimpleImputer(strategy='constant', fill_value='missing')),
                ("encoder", OneHotEncoder(sparse=False))]), ["embarked"]),
            ("sex_pclass", OneHotEncoder(sparse=False), ["sex", "pclass"])
        ])
        clf = Pipeline(steps=[('preprocessor', transformations),
                              ('classifier',
                               LogisticRegression(solver='lbfgs'))])
        clf.fit(x_train, y_train)

        categorical_features = categorical
        run_error_analyzer(clf, x_test, y_test, feature_names,
                           categorical_features)


def run_error_analyzer(model, x_test, y_test, feature_names,
                       categorical_features):
    error_analyzer = ErrorAnalyzer(model, x_test, y_test,
                                   feature_names,
                                   categorical_features)
    # features, filters, composite_filters
    features = [feature_names[0], feature_names[1]]
    filters = None
    composite_filters = None
    json_matrix = error_analyzer.compute_matrix(features, filters,
                                                composite_filters)
    expected_count = len(x_test)
    expected_false_count = sum(model.predict(x_test) != y_test)
    validate_matrix(json_matrix, expected_count, expected_false_count)


def validate_matrix(json_matrix, exp_total_count, exp_total_false_count):
    assert MATRIX in json_matrix
    assert CATEGORY1 in json_matrix
    assert CATEGORY2 in json_matrix
    num_cat1 = len(json_matrix[CATEGORY1][VALUES])
    num_cat2 = len(json_matrix[CATEGORY2][VALUES])
    assert len(json_matrix[MATRIX]) == num_cat1
    assert len(json_matrix[MATRIX][0]) == num_cat2
    # take sum of count, false count
    total_count = 0
    total_false_count = 0
    for i in range(num_cat1):
        for j in range(num_cat2):
            total_count += json_matrix[MATRIX][i][j][COUNT]
            total_false_count += json_matrix[MATRIX][i][j][FALSE_COUNT]
    assert exp_total_count == total_count
    assert exp_total_false_count == total_false_count
