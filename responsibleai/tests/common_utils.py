# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import os
import shutil
import zipfile
from urllib.request import urlretrieve

import numpy as np
import pandas as pd
import pytest
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
        """
        Loads adult income dataset from
        https://archive.ics.uci.edu/ml/datasets/Adult and prepares the
        data for data analysis based on https://rpubs.com/H_Zhu/235617

        :return adult_data: returns preprocessed adult income dataset.
        """
        # TODO: Revert to using load_adult_income_dataset once dice-ml has a
        # new release with the fix.
        # Download the adult dataset from
        # https://archive.ics.uci.edu/static/public/2/adult.zip as a zip folder
        outdirname = "adult"
        zipfilename = outdirname + ".zip"
        urlretrieve(
            "https://archive.ics.uci.edu/static/public/2/adult.zip",
            zipfilename,
        )
        with zipfile.ZipFile(zipfilename, "r") as unzip:
            unzip.extractall(outdirname)

        raw_data = np.genfromtxt(
            outdirname + "/adult.data",
            delimiter=", ",
            dtype=str,
            invalid_raise=False,
        )

        #  column names from "https://archive.ics.uci.edu/ml/datasets/Adult"
        column_names = [
            "age",
            "workclass",
            "fnlwgt",
            "education",
            "educational-num",
            "marital-status",
            "occupation",
            "relationship",
            "race",
            "gender",
            "capital-gain",
            "capital-loss",
            "hours-per-week",
            "native-country",
            "income",
        ]

        adult_data = pd.DataFrame(raw_data, columns=column_names)

        # For more details on how the below transformations are made,
        # please refer to https://rpubs.com/H_Zhu/235617
        adult_data = adult_data.astype(
            {
                "age": np.int64,
                "educational-num": np.int64,
                "hours-per-week": np.int64,
            }
        )

        adult_data = adult_data.replace(
            {
                "workclass": {
                    "Without-pay": "Other/Unknown",
                    "Never-worked": "Other/Unknown",
                }
            }
        )
        adult_data = adult_data.replace(
            {
                "workclass": {
                    "Federal-gov": "Government",
                    "State-gov": "Government",
                    "Local-gov": "Government",
                }
            }
        )
        adult_data = adult_data.replace(
            {
                "workclass": {
                    "Self-emp-not-inc": "Self-Employed",
                    "Self-emp-inc": "Self-Employed",
                }
            }
        )
        adult_data = adult_data.replace(
            {
                "workclass": {
                    "Never-worked": "Self-Employed",
                    "Without-pay": "Self-Employed",
                }
            }
        )
        adult_data = adult_data.replace({"workclass": {"?": "Other/Unknown"}})

        adult_data = adult_data.replace(
            {
                "occupation": {
                    "Adm-clerical": "White-Collar",
                    "Craft-repair": "Blue-Collar",
                    "Exec-managerial": "White-Collar",
                    "Farming-fishing": "Blue-Collar",
                    "Handlers-cleaners": "Blue-Collar",
                    "Machine-op-inspct": "Blue-Collar",
                    "Other-service": "Service",
                    "Priv-house-serv": "Service",
                    "Prof-specialty": "Professional",
                    "Protective-serv": "Service",
                    "Tech-support": "Service",
                    "Transport-moving": "Blue-Collar",
                    "Unknown": "Other/Unknown",
                    "Armed-Forces": "Other/Unknown",
                    "?": "Other/Unknown",
                }
            }
        )

        adult_data = adult_data.replace(
            {
                "marital-status": {
                    "Married-civ-spouse": "Married",
                    "Married-AF-spouse": "Married",
                    "Married-spouse-absent": "Married",
                    "Never-married": "Single",
                }
            }
        )

        adult_data = adult_data.replace(
            {
                "race": {
                    "Black": "Other",
                    "Asian-Pac-Islander": "Other",
                    "Amer-Indian-Eskimo": "Other",
                }
            }
        )

        adult_data = adult_data[
            [
                "age",
                "workclass",
                "education",
                "marital-status",
                "occupation",
                "race",
                "gender",
                "hours-per-week",
                "income",
            ]
        ]

        adult_data = adult_data.replace({"income": {"<=50K": 0, ">50K": 1}})

        adult_data = adult_data.replace(
            {
                "education": {
                    "Assoc-voc": "Assoc",
                    "Assoc-acdm": "Assoc",
                    "11th": "School",
                    "10th": "School",
                    "7th-8th": "School",
                    "9th": "School",
                    "12th": "School",
                    "5th-6th": "School",
                    "1st-4th": "School",
                    "Preschool": "School",
                }
            }
        )

        adult_data = adult_data.rename(
            columns={
                "marital-status": "marital_status",
                "hours-per-week": "hours_per_week",
            }
        )

        train, _ = train_test_split(adult_data, test_size=0.2, random_state=17)
        adult_data = train.reset_index(drop=True)

        # Remove the downloaded dataset
        if os.path.isdir(outdirname):
            entire_path = os.path.abspath(outdirname)
            shutil.rmtree(entire_path)

        return adult_data


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
