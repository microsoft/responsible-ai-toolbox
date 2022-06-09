# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd

from responsibleai.databalanceanalysis import AggregateBalanceMeasures

from ..common_utils import assert_series_and_dict_equal


class TestAggregateBalanceMeasures:
    def test_one_feature_synthetic_data(
        self,
        synthetic_data,
        synthetic_data_feature_1,
        expected_aggregate_measures_feature_1,
    ):
        agg_measures = (
            AggregateBalanceMeasures(
                cols_of_interest=[synthetic_data_feature_1]
            )
            .measures(dataset=synthetic_data)
            .iloc[0]
        )
        assert_series_and_dict_equal(
            agg_measures, expected_aggregate_measures_feature_1
        )

    def test_both_features_synthetic_data(
        self,
        synthetic_data,
        synthetic_data_feature_1,
        synthetic_data_feature_2,
        expected_aggregate_measures_both_features,
    ):
        agg_measures = (
            AggregateBalanceMeasures(
                cols_of_interest=[
                    synthetic_data_feature_1,
                    synthetic_data_feature_2,
                ]
            )
            .measures(dataset=synthetic_data)
            .iloc[0]
        )
        assert_series_and_dict_equal(
            agg_measures, expected_aggregate_measures_both_features
        )

    def test_adult_data(
        self, adult_data, adult_data_aggregate_balance_measures
    ):
        train_df, test_df, _, _ = adult_data
        full_df = pd.concat([train_df, test_df])
        actual = AggregateBalanceMeasures(
            cols_of_interest=["race", "gender"]
        ).measures(dataset=full_df)
        pd.testing.assert_frame_equal(
            actual.reset_index(drop=True),
            adult_data_aggregate_balance_measures.reset_index(drop=True),
        )
