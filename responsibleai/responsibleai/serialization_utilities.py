# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import datetime
import numpy as np

from typing import Any


def serialize_json_safe(o: Any):
    """
    Convert a value into something that is safe to parse into JSON.

    :param o: Object to make JSON safe.
    :return: Serialized object.
    """
    if type(o) in {bool, int, float, str, type(None)}:
        if isinstance(o, float):
            if np.isinf(o) or np.isnan(o):
                return 0
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
    else:
        # Attempt to convert Numpy type
        try:
            return o.item()
        except Exception:
            return serialize_json_safe(o.__dict__)
