# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd

from responsibleai.databalanceanalysis import FeatureBalanceMeasures

from ..common_utils import assert_series_and_dict_equal


class TestFeatureBalanceMeasures:
    def test_synthetic_data(
        self,
        synthetic_data,
        synthetic_data_feature_1,
        synthetic_data_label,
        expected_feature_balance_measures,
    ):
        feat_measures = (
            FeatureBalanceMeasures(
                cols_of_interest=[synthetic_data_feature_1],
                label_col=synthetic_data_label,
            )
            .measures(dataset=synthetic_data)
            .query("ClassA == 'Male' and ClassB == 'Female'")
            .iloc[0]
        )
        assert_series_and_dict_equal(
            feat_measures, expected_feature_balance_measures
        )

    def test_adult_data(self, adult_data, adult_data_feature_balance_measures):
        train_df, test_df, cols_of_interest, target_col = adult_data
        full_df = pd.concat([train_df, test_df])
        feat_measures = FeatureBalanceMeasures(
            cols_of_interest=cols_of_interest, label_col=target_col
        ).measures(dataset=full_df)
        actual = pd.concat(
            [
                feat_measures.query(
                    "(ClassA == 'White' and ClassB == 'Other')"
                ),
                feat_measures.query(
                    "(ClassA == 'Male' and ClassB == 'Female')"
                ),
            ]
        )
        pd.testing.assert_frame_equal(
            actual.reset_index(drop=True),
            adult_data_feature_balance_measures.reset_index(drop=True),
        )
