# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Data validations for responsibleai module."""
from typing import List, Optional

import numpy as np
import pandas as pd

from raiutils.exceptions import UserConfigValidationException


def _validate_unique_operation_on_categorical_columns(
        train_data: pd.DataFrame,
        test_data: pd.DataFrame,
        categorical_features: List[str]) -> None:
    """Validate unique operation on categorical columns.

    :param train_data: Training data.
    :type train_data: pd.DataFrame
    :param test_data: Test data.
    :type test_data: pd.DataFrame
    :param categorical_features: List of categorical features.
    :type categorical_features: List[str]
    :raises UserConfigValidationException: If unique operation is not
        successful on categorical columns.
    :return: None
    """
    for column in categorical_features:
        try:
            np.unique(train_data[column])
        except Exception:
            raise UserConfigValidationException(
                f"Error finding unique values in column {column}."
                " Please check your train data."
            )

        try:
            np.unique(test_data[column])
        except Exception:
            raise UserConfigValidationException(
                f"Error finding unique values in column {column}. "
                "Please check your test data.")


def validate_train_test_categories(
    train_data: pd.DataFrame,
    test_data: pd.DataFrame,
    rai_compute_type: str,
    categoricals: Optional[List[str]] = None,
):
    if categoricals is None:
        return
    _validate_unique_operation_on_categorical_columns(
        train_data, test_data, categoricals
    )
    discovered = {}
    for column in categoricals:
        if column in train_data.columns:
            train_unique = np.unique(train_data[column])
            test_unique = np.unique(test_data[column])
            difference = np.setdiff1d(test_unique, train_unique)
            if difference.shape[0] != 0:
                discovered[column] = difference.tolist()
    if len(discovered) > 0:
        message = ("{} requires that every category of "
                   "categorical features present in the test data "
                   "be also present in the train data. "
                   "Categories missing from train data: {}")
        raise UserConfigValidationException(
            message.format(rai_compute_type, discovered)
        )
