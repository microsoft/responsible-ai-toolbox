# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
import pytest

from responsibleai.databalanceanalysis import FeatureBalanceMeasures

from ..common_utils import assert_series_and_dict_equal
from .conftest import SYNTHETIC_DATA_GENDER, SYNTHETIC_DATA_LABEL


class TestFeatureBalanceMeasures:
    def test_synthetic_data(
        self, synthetic_data, expected_feature_balance_measures_gender
    ):
        feat_measures = (
            FeatureBalanceMeasures(
                cols_of_interest=[SYNTHETIC_DATA_GENDER],
                label_col=SYNTHETIC_DATA_LABEL,
                pos_label=1,
            )
            .measures(dataset=synthetic_data)
            .query("ClassA == 'Male' and ClassB == 'Female'")
            .iloc[0]
        )
        assert_series_and_dict_equal(
            feat_measures, expected_feature_balance_measures_gender
        )

    def test_adult_data(self, adult_data, adult_data_feature_balance_measures):
        train_df, test_df, categorical_cols, target_col, classes = adult_data
        full_df = pd.concat([train_df, test_df])
        pos_label = "1"

        feat_measures = FeatureBalanceMeasures(
            cols_of_interest=categorical_cols,
            label_col=target_col,
            pos_label=pos_label,
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
            adult_data_feature_balance_measures[pos_label].reset_index(
                drop=True
            ),
        )

    def test_col_less_than_two_unique_values(self, singular_valued_col_data):
        col_of_interest = "col1"
        target_feature = "target"
        pos_label = 1

        warn_text = (f"Column '{col_of_interest}' has less than 2 unique"
                     " values, so feature balance measures for"
                     f" {target_feature}=={pos_label} are not being computed"
                     " for this column.")
        with pytest.warns(UserWarning, match=warn_text):
            FeatureBalanceMeasures(
                cols_of_interest=[col_of_interest],
                label_col=target_feature,
                pos_label=pos_label,
            ).measures(singular_valued_col_data)
