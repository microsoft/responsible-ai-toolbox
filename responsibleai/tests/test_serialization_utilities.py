# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import datetime
import json

import numpy as np
import pandas as pd

from responsibleai.serialization_utilities import serialize_json_safe


class TestSerializationUtilities:

    def test_embedded_object(self):
        class A:
            def __init__(self):
                self.a_data = 'a'

        class B:
            def __init__(self):
                self.b_data = A()

        result = serialize_json_safe({'B': B()})
        assert result == {'B': {'b_data': {'a_data': 'a'}}}

    def test_numpy(self):
        result = serialize_json_safe(np.array([1, 2, 3]))
        assert result == [1, 2, 3]

    def test_unknown(self):
        c = complex(1, 2)
        result = serialize_json_safe([c, 42])
        assert result == [c, 42]

    def test_strings_with_special_chars(self):
        special_chars_dict = {"hello": "world\"with\"quotes",
                              "hi": ["a", "list", "of",
                                     "special\t\"\r\nblah",
                                     "chars"]}
        result = json.dumps(special_chars_dict, default=serialize_json_safe)
        assert result == ("{\"hello\": \"world\\\"with\\\"quotes\", " +
                          "\"hi\": [\"a\", \"list\", \"of\", " +
                          "\"special\\t\\\"\\r\\nblah\", \"chars\"]}")
        deserialized_special_chars_dict = json.loads(result)
        assert special_chars_dict == deserialized_special_chars_dict

    def test_serialize_json_safe_basic(self):
        values = [0, 1, 2, 3, 4, 5]
        result = serialize_json_safe(values)
        assert result == [0, 1, 2, 3, 4, 5]

        values = ['a', 'b', 'a', 'c', 'a', 'b']
        result = serialize_json_safe(values)
        assert result == ['a', 'b', 'a', 'c', 'a', 'b']

    def test_serialize_json_safe_missing(self):
        values = [0, np.nan, 2, 3, 4, 5]
        result = serialize_json_safe(values)
        assert result == [0, 0, 2, 3, 4, 5]

        values = [0, np.inf, 2, 3, 4, 5]
        result = serialize_json_safe(values)
        assert result == [0, 0, 2, 3, 4, 5]

        values = ['a', 'b', 'a', np.nan, 'a', 'b']
        result = serialize_json_safe(values)
        assert result == ['a', 'b', 'a', 0, 'a', 'b']

    def test_serialize_json_safe_aggregate_types(self):
        o = {
            'a': [1, 2, 3],
            'c': 'b'
        }
        result = serialize_json_safe(o)
        assert result == o

        o = ('a', [1, 2, 3])
        result = serialize_json_safe(o)
        assert result == o

        values = np.array([[1, 2, 3], [4, 5, 6]])
        result = serialize_json_safe(values)
        assert result == values.tolist()

    def test_serialize_timestamp(self):
        datetime_str = "2020-10-10"
        datetime_object = datetime.datetime.strptime(datetime_str, "%Y-%m-%d")
        result = serialize_json_safe(datetime_object)
        assert datetime_str in result

    def test_serialize_via_json_timestamp(self):
        timestamp_obj = pd.Timestamp(2020, 1, 1)
        assert isinstance(timestamp_obj, pd.Timestamp)
        result = json.dumps(serialize_json_safe(timestamp_obj))
        assert result is not None
        assert "2020" in result

        timestamp_obj_array = np.array([pd.Timestamp(2020, 1, 1)])
        result = json.dumps(serialize_json_safe(timestamp_obj_array))
        assert result is not None
        assert "2020" in result
