# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

import numpy as np
import pandas as pd
import pytest
# Defines common utilities for responsibleai tests
from dice_ml.utils import helpers
from sklearn.compose import ColumnTransformer
from sklearn.datasets import fetch_california_housing, load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from rai_test_utils.datasets.tabular import \
    create_iris_data as _create_iris_data
from raiutils.common.retries import retry_function


def create_iris_data():
    X_train, X_test, y_train, y_test, feature_names, classes = \
        _create_iris_data()

    # create duplicate index
    test_index_list = X_test.index.tolist()
    test_index_list.append(test_index_list[0])
    X_test = X_test.reindex(test_index_list)
    y_test_list = y_test.tolist()
    y_test_list.append(y_test[0])
    y_test = np.array(y_test_list)

    return X_train, X_test, y_train, y_test, feature_names, classes


def create_housing_data(create_small_dataset=True):
    # Import California housing dataset
    housing = fetch_california_housing()
    # Split data into train and test
    if create_small_dataset:
        x_train, x_test, y_train, y_test = train_test_split(housing.data,
                                                            housing.target,
                                                            train_size=500,
                                                            test_size=50,
                                                            random_state=7)
    else:
        x_train, x_test, y_train, y_test = train_test_split(housing.data,
                                                            housing.target,
                                                            test_size=0.2,
                                                            random_state=7)
    return x_train, x_test, y_train, y_test, housing.feature_names


def create_cancer_data():
    breast_cancer_data = load_breast_cancer()
    classes = breast_cancer_data.target_names.tolist()

    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        breast_cancer_data.data, breast_cancer_data.target,
        test_size=0.2, random_state=0)
    feature_names = breast_cancer_data.feature_names
    classes = breast_cancer_data.target_names.tolist()
    X_train = pd.DataFrame(X_train, columns=feature_names)
    X_test = pd.DataFrame(X_test, columns=feature_names)
    return X_train, X_test, y_train, y_test, feature_names, classes


class FetchDiceAdultCensusIncomeDataset(object):
    def __init__(self):
        pass

    def fetch(self):
        return helpers.load_adult_income_dataset()


def create_adult_income_dataset(create_small_dataset=True):
    fetcher = FetchDiceAdultCensusIncomeDataset()
    action_name = "Adult dataset download"
    err_msg = "Failed to download adult dataset"
    max_retries = 4
    retry_delay = 60
    dataset = retry_function(fetcher.fetch, action_name, err_msg,
                             max_retries=max_retries,
                             retry_delay=retry_delay)
    continuous_features = ['age', 'hours_per_week']
    target_name = 'income'
    target = dataset[target_name]
    classes = list(np.unique(target))
    feature_columns = dataset.drop(columns=[target_name]).columns.tolist()
    feature_range_keys = ['column_name', 'range_type', 'unique_values']
    categorical_features = list(set(dataset.columns) -
                                set(continuous_features) -
                                set([target_name]))
    # Split data into train and test
    if create_small_dataset:
        data_train, data_test, y_train, y_test = train_test_split(
            dataset, target, train_size=500,
            test_size=50, random_state=7, stratify=target)
    else:
        data_train, data_test, y_train, y_test = train_test_split(
            dataset, target, test_size=5000, random_state=7,
            stratify=target)
    return data_train, data_test, y_train, y_test, categorical_features, \
        continuous_features, target_name, classes, \
        feature_columns, feature_range_keys


def create_complex_classification_pipeline(
        X_train, y_train, continuous_features, categorical_features):
    # We create the preprocessing pipelines for both
    # numeric and categorical data.
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())])

    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore'))])

    transformations = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, continuous_features),
            ('cat', categorical_transformer, categorical_features)])

    # Append classifier to preprocessing pipeline.
    # Now we have a full prediction pipeline.
    pipeline = Pipeline(steps=[('preprocessor', transformations),
                               ('classifier', RandomForestClassifier())])
    return pipeline.fit(X_train, y_train)


def assert_series_and_dict_equal(left: pd.Series, right: dict):
    left_json = left.to_json(orient="index")
    left_dict = json.loads(left_json)
    assert left_dict == pytest.approx(right)
