# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np

from responsibleai.serialization_utilities import serialize_json_safe
import json


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
