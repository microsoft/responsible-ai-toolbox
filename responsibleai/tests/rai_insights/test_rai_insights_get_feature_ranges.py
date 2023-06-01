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
        
    def test_get_feature_range_raises_value_error_on_failed_min_max_float_cast(self):
        data = {'col1': ['A', 'B', 'C', '50']}
        
        df = pd.DataFrame(data)
        
        with pytest.raises(ValueError, match='Unable to convert min or max value'):
            feature_ranges = RAIInsights._get_feature_ranges(
                df, [], ['col1'])

