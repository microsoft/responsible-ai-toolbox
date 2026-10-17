# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import datetime
import json

import numpy as np
import pandas as pd
import pytest
from scipy.sparse import csr_matrix

from raiutils.data_processing import (convert_to_list,
                                      convert_to_string_list_dict,
                                      serialize_json_safe)


class TestConvertToStringListDict:
    def test_unnamed_series(self):
        input = pd.Series(data=[0, 1, 2])
        sample_array = [4, 5, 6]
        result = convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert len(result) == 1
        assert "Base 0" in result
        arr = result["Base 0"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [0, 1, 2])

    def test_named_series(self):
        input = pd.Series(data=[1, 3, 5], name="Something")
        sample_array = [4, 5, 6]
        result = convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert len(result) == 1
        assert "Something" in result
        arr = result["Something"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [1, 3, 5])

    def test_dataframe(self):
        input = pd.DataFrame.from_dict({"a": [0, 1, 2], "b": [4, 5, 6]})
        sample_array = [3, 6, 9]
        result = convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert len(result) == 2
        assert "a" in result
        arr = result["a"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [0, 1, 2])
        assert "b" in result
        arr = result["b"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [4, 5, 6])

    def test_simplelist(self):
        input = [0, 1, 4]
        sample_array = [2, 3, 4]
        result = convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert len(result) == 1
        assert "Base 0" in result
        arr = result["Base 0"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [0, 1, 4])

    def test_empty_list(self):
        result = convert_to_string_list_dict("Base {0}", [], [])

        assert result == {"Base 0": []}

    def test_empty_list_rejects_inconsistent_length(self):
        with pytest.raises(
                ValueError, match="inconsistent numbers of samples"):
            convert_to_string_list_dict("Base {0}", [], [0])

    def test_dict(self):
        input = {"a": np.array([0, 1, 2]), "b": pd.Series(data=[3, 4, 5])}
        sample_array = [2, 3, 4]
        result = convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert len(result) == 2
        assert "a" in result
        arr = result["a"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [0, 1, 2])
        assert "b" in result
        arr = result["b"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [3, 4, 5])

    def test_numpy1d(self):
        input = np.array([0, 1, 4])
        sample_array = [2, 3, 4]
        result = convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert len(result) == 1
        assert "Base 0" in result
        arr = result["Base 0"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [0, 1, 4])

    def test_numpy2d(self):
        # Note transpose on the end
        input = np.array([[0, 1, 4], [2, 6, 7]]).T
        sample_array = [2, 3, 4]
        result = convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert len(result) == 2
        assert "Base 0" in result
        arr = result["Base 0"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [0, 1, 4])
        assert "Base 1" in result
        arr = result["Base 1"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [2, 6, 7])

    @pytest.mark.parametrize("values, expected", [
        (np.array([42]), {"Base 0": [42]}),
        (np.array([[42]]), {"Base 0": [42]}),
        (np.array([[42, 43]]), {"Base 0": [42], "Base 1": [43]}),
    ], ids=["singleton-vector", "single-cell", "single-row"])
    def test_numpy_single_sample(self, values, expected):
        result = convert_to_string_list_dict("Base {0}", values, [0])

        assert result == expected

    @pytest.mark.parametrize("values, expected", [
        (np.array([[0], [1], [4]]), {"Base 0": [0, 1, 4]}),
        (np.array([[0, 2], [1, 6], [4, 7]]),
         {"Base 0": [0, 1, 4], "Base 1": [2, 6, 7]}),
    ], ids=["column-vector", "matrix"])
    def test_numpy_preserves_sample_axis(self, values, expected):
        result = convert_to_string_list_dict("Base {0}", values, [2, 3, 4])

        assert result == expected

    @pytest.mark.parametrize("values, expected", [
        (np.array([[[0], [1], [4]]]), {"Base 0": [0, 1, 4]}),
        (np.array([[[0, 2], [1, 6], [4, 7]]]),
         {"Base 0": [0, 1, 4], "Base 1": [2, 6, 7]}),
    ], ids=["wrapped-vector", "wrapped-matrix"])
    def test_numpy_singleton_wrappers(self, values, expected):
        # Retain the existing treatment of singleton dimensions above 2D.
        result = convert_to_string_list_dict("Base {0}", values, [2, 3, 4])

        assert result == expected

    @pytest.mark.parametrize("values", [
        [0, 1], np.array([0, 1]), pd.Series([0, 1]),
    ], ids=["list", "array", "series"])
    def test_dict_rejects_inconsistent_lengths(self, values):
        predictions = {"matching": [0, 1, 2], "mismatching": values}

        with pytest.raises(
                ValueError, match="inconsistent numbers of samples"):
            convert_to_string_list_dict("Base {0}", predictions, [2, 3, 4])


class TestConvertToList:
    def test_pandas_dataframe_to_list(self):
        input_dataframe = pd.DataFrame.from_dict(
            {"a": [0, 1, 2], "b": [4, 5, 6]}
        )
        expected_list = [[0, 4], [1, 5], [2, 6]]
        input_as_list = convert_to_list(input_dataframe)

        assert input_as_list is not None
        assert input_as_list == expected_list

    def test_array_to_list(self):
        input_array = np.array([[0, 4], [1, 5], [2, 6]])
        expected_list = [[0, 4], [1, 5], [2, 6]]
        input_as_list = convert_to_list(input_array)

        assert input_as_list is not None
        assert input_as_list == expected_list

    def test_list_to_list(self):
        input_list = [[0, 4], [1, 5], [2, 6]]
        expected_list = [[0, 4], [1, 5], [2, 6]]
        input_as_list = convert_to_list(input_list)

        assert input_as_list is not None
        assert input_as_list == expected_list

    def test_series_to_list(self):
        input_series = pd.Series(data=[[0, 4], [1, 5], [2, 6]])
        expected_list = [[0, 4], [1, 5], [2, 6]]
        input_as_list = convert_to_list(input_series)

        assert input_as_list is not None
        assert input_as_list == expected_list

    def test_index_to_list(self):
        input_index = pd.Index(data=[[0, 4], [1, 5], [2, 6]])
        expected_list = [[0, 4], [1, 5], [2, 6]]
        input_as_list = convert_to_list(input_index)

        assert input_as_list is not None
        assert input_as_list == expected_list

    def test_csr_matrix_to_list(self):
        input_sparse_matrix = csr_matrix((3, 10000),
                                         dtype=np.int8)
        with pytest.raises(ValueError) as ve:
            convert_to_list(input_sparse_matrix)
        assert "Exceeds maximum number of features for " + \
            "visualization (1000)" in str(ve.value)

        with pytest.raises(ValueError) as ve:
            convert_to_list(input_sparse_matrix,
                            custom_err_msg="Error occurred")
        assert "Error occurred" in str(ve.value)

        row = np.array([0, 0, 1, 2, 2, 2])
        col = np.array([0, 2, 2, 0, 1, 2])
        data = np.array([1, 2, 3, 4, 5, 6])
        sparse_matrix = csr_matrix((data, (row, col)), shape=(3, 3))
        expected_list = [[1, 0, 2],
                         [0, 0, 3],
                         [4, 5, 6]]
        input_as_list = convert_to_list(sparse_matrix)

        assert input_as_list is not None
        assert input_as_list == expected_list


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

    @pytest.mark.parametrize("dtype", [np.float16, np.float32, np.float64,
                                       np.longdouble])
    @pytest.mark.parametrize("value", [np.nan, np.inf, -np.inf],
                             ids=["nan", "positive-inf", "negative-inf"])
    def test_numpy_nonfinite_scalars_are_json_safe(self, dtype, value):
        result = serialize_json_safe(dtype(value))

        assert result == 0
        assert json.dumps(result, allow_nan=False) == "0"

    def test_nested_numpy_nonfinite_scalars_are_json_safe(self):
        values = {"values": [np.float16(np.nan), np.float32(np.inf),
                             np.float64(-np.inf)]}

        result = serialize_json_safe(values)

        assert result == {"values": [0, 0, 0]}
        assert json.loads(json.dumps(result, allow_nan=False)) == result

    @pytest.mark.parametrize("value, expected", [
        (np.float16(1.5), 1.5),
        (np.float32(-2.5), -2.5),
        (np.float64(3.5), 3.5),
        (np.int64(42), 42),
        (np.bool_(True), True),
    ], ids=["float16", "float32", "float64", "int64", "bool"])
    def test_numpy_finite_scalars_are_preserved(self, value, expected):
        result = serialize_json_safe(value)

        assert result == expected
        assert type(result) is type(expected)
        assert json.loads(json.dumps(result, allow_nan=False)) == expected

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

    def test_serialize_pandas_timestamp(self):
        datetime_str = "2020-10-10"
        datetime_object = pd.Timestamp(datetime_str)
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
