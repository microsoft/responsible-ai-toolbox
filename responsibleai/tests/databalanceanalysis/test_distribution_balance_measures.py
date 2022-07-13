# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd

from responsibleai.databalanceanalysis import DistributionBalanceMeasures

from ..common_utils import assert_series_and_dict_equal
from .conftest import SYNTHETIC_DATA_ETHNICITY, SYNTHETIC_DATA_GENDER


class TestDistributionBalanceMeasures:
    def test_feature_1_synthetic_data(
        self, synthetic_data, expected_distribution_measures_gender
    ):
        dist_measures = (
            DistributionBalanceMeasures(
                cols_of_interest=[SYNTHETIC_DATA_GENDER]
            )
            .measures(dataset=synthetic_data)
            .iloc[0]
        )
        assert_series_and_dict_equal(
            dist_measures, expected_distribution_measures_gender
        )

    def test_feature_2_synthetic_data(
        self, synthetic_data, expected_distribution_measures_ethnicity
    ):
        dist_measures = (
            DistributionBalanceMeasures(
                cols_of_interest=[SYNTHETIC_DATA_ETHNICITY]
            )
            .measures(dataset=synthetic_data)
            .iloc[0]
        )
        assert_series_and_dict_equal(
            dist_measures, expected_distribution_measures_ethnicity
        )

    def test_adult_data(
        self, adult_data, adult_data_distribution_balance_measures
    ):
        train_df, test_df, _, _, _ = adult_data
        full_df = pd.concat([train_df, test_df])
        actual = DistributionBalanceMeasures(
            cols_of_interest=["race", "gender"]
        ).measures(dataset=full_df)
        pd.testing.assert_frame_equal(
            actual.reset_index(drop=True),
            adult_data_distribution_balance_measures.reset_index(drop=True),
        )
