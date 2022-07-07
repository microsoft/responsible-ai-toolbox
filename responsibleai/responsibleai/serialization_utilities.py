# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import datetime
import json
import warnings
from typing import Any

import numpy as np


def serialize_json_safe(o: Any):
    """
    Convert a value into something that is safe to parse as JSON.

    :param o: Object to make JSON safe.
    :return: Serialized object.
    """
    warnings.warn(
        "FUNCTION-DEPRECATION-WARNING: The function serialize_json_safe "
        "will be deprecated in responsibleai. "
        "Please import this function from raiutils.data_processing instead.",
        DeprecationWarning)

    if type(o) in {bool, int, float, str, type(None)}:
        if isinstance(o, float):
            if np.isinf(o) or np.isnan(o):
                return 0
        # need to escape double quoted string values
        # and other special characters for json
        if isinstance(o, str):
            return json.dumps(o)[1:-1]
        return o
    elif isinstance(o, datetime.datetime):
        return o.__str__()
    elif isinstance(o, dict):
        return {k: serialize_json_safe(v, ) for k, v in o.items()}
    elif isinstance(o, list):
        return [serialize_json_safe(v) for v in o]
    elif isinstance(o, tuple):
        return tuple(serialize_json_safe(v) for v in o)
    elif isinstance(o, np.ndarray):
        return serialize_json_safe(o.tolist())
    elif hasattr(o, 'item'):
        return o.item()  # numpy types
    elif hasattr(o, '__dict__'):
        return serialize_json_safe(o.__dict__)  # objects
    else:
        return o
