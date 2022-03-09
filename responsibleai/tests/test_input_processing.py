# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest
from scipy.sparse import csr_matrix

from responsibleai._input_processing import (_convert_to_list,
                                             _convert_to_string_list_dict)


class TestConvertToStringListDict:
    def test_unnamed_series(self):
        input = pd.Series(data=[0, 1, 2])
        sample_array = [4, 5, 6]
        result = _convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert len(result) == 1
        assert "Base 0" in result
        arr = result["Base 0"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [0, 1, 2])

    def test_named_series(self):
        input = pd.Series(data=[1, 3, 5], name="Something")
        sample_array = [4, 5, 6]
        result = _convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert len(result) == 1
        assert "Something" in result
        arr = result["Something"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [1, 3, 5])

    def test_dataframe(self):
        input = pd.DataFrame.from_dict({"a": [0, 1, 2], "b": [4, 5, 6]})
        sample_array = [3, 6, 9]
        result = _convert_to_string_list_dict("Base {0}", input, sample_array)
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
        result = _convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert len(result) == 1
        assert "Base 0" in result
        arr = result["Base 0"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [0, 1, 4])

    def test_dict(self):
        input = {"a": np.array([0, 1, 2]), "b": pd.Series(data=[3, 4, 5])}
        sample_array = [2, 3, 4]
        result = _convert_to_string_list_dict("Base {0}", input, sample_array)
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
        result = _convert_to_string_list_dict("Base {0}", input, sample_array)
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
        result = _convert_to_string_list_dict("Base {0}", input, sample_array)
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


class TestConvertToList:
    def test_pandas_dataframe_to_list(self):
        input_dataframe = pd.DataFrame.from_dict(
            {"a": [0, 1, 2], "b": [4, 5, 6]}
        )
        expected_list = [[0, 4], [1, 5], [2, 6]]
        input_as_list = _convert_to_list(input_dataframe)

        assert input_as_list is not None
        assert input_as_list == expected_list

    def test_array_to_list(self):
        input_array = np.array([[0, 4], [1, 5], [2, 6]])
        expected_list = [[0, 4], [1, 5], [2, 6]]
        input_as_list = _convert_to_list(input_array)

        assert input_as_list is not None
        assert input_as_list == expected_list

    def test_list_to_list(self):
        input_list = [[0, 4], [1, 5], [2, 6]]
        expected_list = [[0, 4], [1, 5], [2, 6]]
        input_as_list = _convert_to_list(input_list)

        assert input_as_list is not None
        assert input_as_list == expected_list

    def test_series_to_list(self):
        input_series = pd.Series(data=[[0, 4], [1, 5], [2, 6]])
        expected_list = [[0, 4], [1, 5], [2, 6]]
        input_as_list = _convert_to_list(input_series)

        assert input_as_list is not None
        assert input_as_list == expected_list

    def test_index_to_list(self):
        input_index = pd.Index(data=[[0, 4], [1, 5], [2, 6]])
        expected_list = [[0, 4], [1, 5], [2, 6]]
        input_as_list = _convert_to_list(input_index)

        assert input_as_list is not None
        assert input_as_list == expected_list

    def test_csr_matrix_to_list(self):
        input_sparse_matrix = csr_matrix((3, 10000),
                                         dtype=np.int8)
        with pytest.raises(ValueError) as ve:
            _convert_to_list(input_sparse_matrix)
        assert "Exceeds maximum number of features for " + \
            "visualization (1000)" in str(ve.value)

        with pytest.raises(ValueError) as ve:
            _convert_to_list(input_sparse_matrix,
                             custom_err_msg="Error occurred")
        assert "Error occurred" in str(ve.value)

        row = np.array([0, 0, 1, 2, 2, 2])
        col = np.array([0, 2, 2, 0, 1, 2])
        data = np.array([1, 2, 3, 4, 5, 6])
        sparse_matrix = csr_matrix((data, (row, col)), shape=(3, 3))
        expected_list = [[1, 0, 2],
                         [0, 0, 3],
                         [4, 5, 6]]
        input_as_list = _convert_to_list(sparse_matrix)

        assert input_as_list is not None
        assert input_as_list == expected_list
