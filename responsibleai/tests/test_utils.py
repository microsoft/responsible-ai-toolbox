# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd

from responsibleai.utils import _find_features_having_missing_values


class TestUtils:
    def test_find_features_having_missing_values(self):
        data_missing_values = pd.DataFrame(data=[['1', np.nan], ['2', '3']],
                                           columns=['c1', 'c2'])
        assert _find_features_having_missing_values(
            data_missing_values) == ['c2']

        data_no_missing_values = pd.DataFrame(data=[['1', '2'], ['2', '3']],
                                              columns=['c1', 'c2'])
        assert _find_features_having_missing_values(
            data_no_missing_values) == []
