# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd

from responsibleai.rai_insights import RAIInsights


class TestRAIInsightsGetFeatureRanges:
    def test_get_feature_range(self):
        data = {'Category': ['A', 'B', 'C', None, 'D'],
                'Numerical': [10, 20, None, 40, 50]}

        df = pd.DataFrame(data)

        feature_ranges = RAIInsights._get_feature_ranges(
            df, ['Category'], ['Category', 'Numerical'])
        assert len(feature_ranges) == 2
        assert 'Category' == feature_ranges[0]['column_name']
        assert 'Numerical' == feature_ranges[1]['column_name']
