# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import timeit
from typing import List

import numpy as np
import pandas as pd


def _measure_time(manager_compute_func):
    def compute_wrapper(*args, **kwargs):
        _separator(80)
        start_time = timeit.default_timer()
        manager_compute_func(*args, **kwargs)
        elapsed = timeit.default_timer() - start_time
        m, s = divmod(elapsed, 60)
        print('Time taken: {0} min {1} sec'.format(
              m, s))
        _separator(80)
    return compute_wrapper


def _separator(max_len):
    print('=' * max_len)


def _find_features_having_missing_values(
        data: pd.DataFrame) -> List[str]:
    """Return list of features which have missing values.

    :param data: The dataset to check.
    :type data: pd.Dataframe
    :return: List of feature names which have missing values.
    :rtype: List[str]
    """
    list_of_feature_having_missing_values = []
    for feature in data.columns.tolist():
        if np.any(data[feature].isnull()):
            list_of_feature_having_missing_values.append(feature)
    return list_of_feature_having_missing_values
