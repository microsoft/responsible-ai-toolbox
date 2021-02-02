# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
from scipy.sparse import issparse
from sklearn.utils import check_consistent_length
from typing import Dict, List
import datetime

_DF_COLUMN_BAD_NAME = "DataFrame column names must be strings."\
    " Name '{0}' is of type {1}"
_LIST_NONSCALAR = "Lists must be of scalar types"
_TOO_MANY_DIMS = "Array must have at most two dimensions"


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
    """Convert the given input to a string-list dictionary.

    This function is used to convert arrays in a variety of types
    into a dictionary mapping column names to regular Python lists
    (in preparation for JSON serialisation). It is a modification
    of the feature processing code in :class:`fairlearn.metrics.MetricFrame`.

    The array to be converted is passed in :code:`ys`, and a variety
    of types are supported. The :code:`sample_array` argument is
    used in a call to :func:`sklearn.utils.check_consistent_length`
    to ensure that the resultant lists are of the right length.
    Finally `base_name_format` is used to generate sequential
    keys for the dictionary if none are in the supplied :code:`ys`.
    It must be of the form :code:`'Base String {0}'`, with the
    :code:`{0}` being replaced by a sequential integer.

    It is not possible to list out all the possible underlying types
    for :code:`ys`. A brief summary:
        - :class:`pd.Series`
        - :class:`pd.DataFrame`
        - A simple Python list
        - A Python dictionary with string keys and values which are
          convertible to lists
        - Anything convertible to a :class:`np.ndarray`
    """
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
    elif isinstance(ys, list):
        if np.isscalar(ys[0]):
            f_arr = np.atleast_1d(np.squeeze(np.asarray(ys)))
            assert len(f_arr.shape) == 1  # Sanity check
            check_consistent_length(f_arr, sample_array)
            result[base_name_format.format(0)] = _convert_to_list(f_arr)
        else:
            raise ValueError(_LIST_NONSCALAR)
    elif isinstance(ys, dict):
        for k, v in ys.items():
            result[k] = _convert_to_list(v)
    else:
        # Assume it's something which can go into np.as_array
        f_arr = np.squeeze(np.asarray(ys, dtype=np.object))
        if len(f_arr.shape) == 1:
            check_consistent_length(f_arr, sample_array)
            result[base_name_format.format(0)] = _convert_to_list(f_arr)
        elif len(f_arr.shape) == 2:
            # Work similarly to pd.DataFrame(data=ndarray)
            for i in range(f_arr.shape[1]):
                col = f_arr[:, i]
                check_consistent_length(col, sample_array)
                result[base_name_format.format(i)] = _convert_to_list(col)
        else:
            raise ValueError(_TOO_MANY_DIMS)

    return result


def _serialize_json_safe(o):
    """
    Convert a value into something that is safe to parse into JSON.

    :param o: Object to make JSON safe.
    :return: New object
    """
    if type(o) in {int, float, str, type(None)}:
        if isinstance(o, float):
            if np.isinf(o) or np.isnan(o):
                return 0
        return o
    elif isinstance(o, datetime.datetime):
        return o.__str__()
    elif isinstance(o, dict):
        return {k: _serialize_json_safe(v) for k, v in o.items()}
    elif isinstance(o, list):
        return [_serialize_json_safe(v) for v in o]
    elif isinstance(o, tuple):
        return tuple(_serialize_json_safe(v) for v in o)
    elif isinstance(o, np.ndarray):
        return _serialize_json_safe(o.tolist())
    else:
        # Attempt to convert Numpy type
        try:
            return o.item()
        except Exception:
            return o
