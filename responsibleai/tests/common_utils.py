# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

import numpy as np
import pandas as pd
import pytest
from dice_ml.utils import helpers
# Defines common utilities for responsibleai tests
from sklearn.model_selection import train_test_split

from rai_test_utils.datasets.tabular import \
    create_iris_data as _create_iris_data
from raiutils.common.retries import retry_function


def create_iris_data():
    (
        X_train,
        X_test,
        y_train,
        y_test,
        feature_names,
        classes,
    ) = _create_iris_data()

    # create duplicate index
    test_index_list = X_test.index.tolist()
    test_index_list.append(test_index_list[0])
    X_test = X_test.reindex(test_index_list)
    y_test_list = y_test.tolist()
    y_test_list.append(y_test[0])
    y_test = np.array(y_test_list)

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
    dataset = retry_function(
        fetcher.fetch,
        action_name,
        err_msg,
        max_retries=max_retries,
        retry_delay=retry_delay,
    )
    continuous_features = ["age", "hours_per_week"]
    target_name = "income"
    target = dataset[target_name]
    classes = list(np.unique(target))
    feature_columns = dataset.drop(columns=[target_name]).columns.tolist()
    feature_range_keys = ["column_name", "range_type", "unique_values"]
    categorical_features = list(
        set(dataset.columns) - set(continuous_features) - set([target_name])
    )
    # Split data into train and test
    if create_small_dataset:
        data_train, data_test, y_train, y_test = train_test_split(
            dataset,
            target,
            train_size=500,
            test_size=50,
            random_state=7,
            stratify=target,
        )
    else:
        data_train, data_test, y_train, y_test = train_test_split(
            dataset, target, test_size=5000, random_state=7, stratify=target
        )
    return (
        data_train,
        data_test,
        y_train,
        y_test,
        categorical_features,
        continuous_features,
        target_name,
        classes,
        feature_columns,
        feature_range_keys,
    )


def assert_series_and_dict_equal(left: pd.Series, right: dict):
    left_json = left.to_json(orient="index")
    left_dict = json.loads(left_json)
    assert left_dict == pytest.approx(right)
