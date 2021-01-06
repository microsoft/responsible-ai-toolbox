# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
from scipy.sparse import issparse
from sklearn.utils import check_consistent_length
from typing import Dict, List

_DF_COLUMN_BAD_NAME = "DataFrame column names must be strings. Name '{0}' is of type {1}"


def _convert_to_list(array):
    if issparse(array):
        if array.shape[1] > 1000:
            raise ValueError("Exceeds maximum number of features for "
                             "visualization (1000)")
        return array.toarray().tolist()

    if (isinstance(array, pd.DataFrame) or isinstance(array, pd.Series)):
        return array.values.tolist()
    if (isinstance(array, np.ndarray)):
        return array.tolist()
    return array


def _convert_to_string_list_dict(
        base_name_format: str,
        ys,
        sample_array) -> Dict[str, List]:
    result = {}

    if isinstance(ys, pd.Series):
        check_consistent_length(ys, sample_array)
        if ys.name is not None:
            result[ys.name] = _convert_to_list(ys)
        else:
            result[base_name_format.format(0)] = _convert_to_list(ys)
    elif isinstance(ys, pd.DataFrame):
        for i in range(len(ys.columns)):
            col_name = ys.columns[i]
            if not isinstance(col_name, str):
                msg = _DF_COLUMN_BAD_NAME.format(col_name, type(col_name))
                raise ValueError(msg)
            column = ys.iloc[:, i]
            check_consistent_length(column, sample_array)
            result[col_name] = _convert_to_list(column)

    return result
