# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd

from responsibleai.databalanceanalysis import DistributionBalanceMeasures

from ..common_utils import assert_series_and_dict_equal


class TestDistributionBalanceMeasures:
    def test_feature_1_synthetic_data(
        self,
        synthetic_data,
        synthetic_data_feature_1,
        expected_distribution_measures_feature_1,
    ):
        dist_measures = (
            DistributionBalanceMeasures(
                cols_of_interest=[synthetic_data_feature_1]
            )
            .measures(dataset=synthetic_data)
            .iloc[0]
        )
        assert_series_and_dict_equal(
            dist_measures, expected_distribution_measures_feature_1
        )

    def test_feature_2_synthetic_data(
        self,
        synthetic_data,
        synthetic_data_feature_2,
        expected_distribution_measures_feature_2,
    ):
        dist_measures = (
            DistributionBalanceMeasures(
                cols_of_interest=[synthetic_data_feature_2]
            )
            .measures(dataset=synthetic_data)
            .iloc[0]
        )
        assert_series_and_dict_equal(
            dist_measures, expected_distribution_measures_feature_2
        )

    def test_adult_data(
        self, adult_data, adult_data_distribution_balance_measures
    ):
        train_df, test_df, _, _ = adult_data
        full_df = pd.concat([train_df, test_df])
        actual = DistributionBalanceMeasures(
            cols_of_interest=["race", "gender"]
        ).measures(dataset=full_df)
        pd.testing.assert_frame_equal(
            actual.reset_index(drop=True),
            adult_data_distribution_balance_measures.reset_index(drop=True),
        )
