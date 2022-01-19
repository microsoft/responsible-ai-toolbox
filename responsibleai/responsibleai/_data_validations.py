# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Data validations for responsibleai module."""
from typing import List, Optional

import numpy as np
import pandas as pd

from responsibleai.exceptions import UserConfigValidationException


def validate_train_test_categories(
    train_data: pd.DataFrame,
    test_data: pd.DataFrame,
    rai_compute_type: str,
    categoricals: Optional[List[str]] = None,
):
    if categoricals is None:
        return
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
