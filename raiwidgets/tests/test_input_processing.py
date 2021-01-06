# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd

from raiwidgets._input_processing import _convert_to_string_list_dict


class TestConvertToStringListDict:
    def test_unnamed_series(self):
        input = pd.Series(data=[0, 1, 2])
        sample_array = [4, 5, 6]
        result = _convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert "Base 0" in result
        arr = result["Base 0"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [0, 1, 2])

    def test_named_series(self):
        input = pd.Series(data=[1, 3, 5], name="Something")
        sample_array = [4, 5, 6]
        result = _convert_to_string_list_dict("Base {0}", input, sample_array)
        assert isinstance(result, dict)
        assert "Something" in result
        arr = result["Something"]
        assert isinstance(arr, list)
        assert np.array_equal(arr, [1, 3, 5])
