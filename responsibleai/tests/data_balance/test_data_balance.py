# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
from pandas.testing import assert_frame_equal

from responsibleai._tools.data_balance.data_balance import (
    DataBalance,
    FEATURE_BALANCE_MEASURES_KEY,
    DISTRIBUTION_BALANCE_MEASURES_KEY,
    AGGREGATE_BALANCE_MEASURES_KEY,
    FEATURES_KEY,
    MEASURES_KEY,
    UNIQUE_CLASSES_KEY,
)
from responsibleai._tools.shared.backends import SupportedBackend


class TestDataBalance:
    def test_compute_measures_with_valid_input(
        self,
        adult_data,
        feature_balance_measures,
        distribution_balance_measures,
        aggregate_balance_measures,
    ):
        train_df, test_df, _, target_col = adult_data
        cols_of_interest = ["race", "gender"]
        df = pd.concat([train_df, test_df])
        (
            actual_feat_measures,
            actual_dist_measures,
            actual_agg_measures,
        ) = DataBalance.compute_measures(
            df=df,
            cols_of_interest=cols_of_interest,
            target_column=target_col,
            pos_label=None,
            backend=SupportedBackend.PANDAS,
        )

        assert isinstance(actual_feat_measures, pd.DataFrame)
        assert not actual_feat_measures.empty
        assert sorted(actual_feat_measures["FeatureName"].unique()) == sorted(
            cols_of_interest
        )
        assert_frame_equal(
            actual_feat_measures.reset_index(drop=True),
            feature_balance_measures.reset_index(drop=True),
        )

        assert isinstance(actual_dist_measures, pd.DataFrame)
        assert not actual_dist_measures.empty
        assert sorted(actual_dist_measures["FeatureName"].unique()) == sorted(
            cols_of_interest
        )
        assert_frame_equal(
            actual_dist_measures.reset_index(drop=True),
            distribution_balance_measures.reset_index(drop=True),
        )

        assert isinstance(actual_agg_measures, pd.DataFrame)
        assert not actual_agg_measures.empty
        assert_frame_equal(
            actual_agg_measures.reset_index(drop=True),
            aggregate_balance_measures.reset_index(drop=True),
        )

    def test_compute_measures_with_invalid_input(self):
        (
            feat_measures,
            dist_measures,
            agg_measures,
        ) = DataBalance.compute_measures(
            df=None,
            cols_of_interest=None,
            target_column=None,
            pos_label=None,
            backend=SupportedBackend.PANDAS,
        )

        assert isinstance(feat_measures, pd.DataFrame)
        assert feat_measures.empty
        assert isinstance(dist_measures, pd.DataFrame)
        assert dist_measures.empty
        assert isinstance(agg_measures, pd.DataFrame)
        assert agg_measures.empty

    def test_compute_measures_with_empty_df(self):
        df = pd.DataFrame()
        (
            feat_measures,
            dist_measures,
            agg_measures,
        ) = DataBalance.compute_measures(
            df=df,
            cols_of_interest=None,
            target_column=None,
            pos_label=None,
            backend=SupportedBackend.PANDAS,
        )

        assert isinstance(feat_measures, pd.DataFrame)
        assert feat_measures.empty

        assert isinstance(dist_measures, pd.DataFrame)
        assert dist_measures.empty

        assert isinstance(agg_measures, pd.DataFrame)
        assert agg_measures.empty

    def test_transform_measures_to_dict_with_valid_input(
        self,
        feature_balance_measures,
        distribution_balance_measures,
        aggregate_balance_measures,
    ):
        output = DataBalance.transform_measures_to_dict(
            feature_balance_measures=feature_balance_measures,
            distribution_balance_measures=distribution_balance_measures,
            aggregate_balance_measures=aggregate_balance_measures,
        )
        assert isinstance(output, dict)
        assert len(output) == 3
        assert FEATURE_BALANCE_MEASURES_KEY in output
        assert DISTRIBUTION_BALANCE_MEASURES_KEY in output
        assert AGGREGATE_BALANCE_MEASURES_KEY in output

    def test_transform_measures_to_dict_with_invalid_input(self):
        output = DataBalance.transform_measures_to_dict(
            feature_balance_measures=None,
            distribution_balance_measures=None,
            aggregate_balance_measures=None,
        )
        assert isinstance(output, dict)
        assert len(output) == 3
        assert FEATURE_BALANCE_MEASURES_KEY in output
        assert DISTRIBUTION_BALANCE_MEASURES_KEY in output
        assert AGGREGATE_BALANCE_MEASURES_KEY in output

    def test_transform_measures_to_dict_with_empty_input(self):
        output = DataBalance.transform_measures_to_dict(
            feature_balance_measures=pd.DataFrame(),
            distribution_balance_measures=pd.DataFrame(),
            aggregate_balance_measures=pd.DataFrame(),
        )
        assert isinstance(output, dict)
        assert len(output) == 3
        assert FEATURE_BALANCE_MEASURES_KEY in output
        assert DISTRIBUTION_BALANCE_MEASURES_KEY in output
        assert AGGREGATE_BALANCE_MEASURES_KEY in output

    def test_transform_feature_balance_measures_with_valid_input(
        self, feature_balance_measures
    ):
        output = DataBalance.transform_feature_balance_measures(
            df=feature_balance_measures
        )
        assert isinstance(output, dict)
        assert len(output) == 1
        assert FEATURE_BALANCE_MEASURES_KEY in output

        values = output[FEATURE_BALANCE_MEASURES_KEY]
        assert isinstance(values, dict)
        assert len(values) == 3

        assert FEATURES_KEY in values
        assert len(values[FEATURES_KEY]) > 0

        assert UNIQUE_CLASSES_KEY in values
        assert len(values[UNIQUE_CLASSES_KEY]) > 0

        assert MEASURES_KEY in values
        assert len(values[MEASURES_KEY]) > 0

    def test_transform_feature_balance_measures_with_invalid_input(self):
        output = DataBalance.transform_feature_balance_measures(df=None)
        assert isinstance(output, dict)
        assert len(output) == 1
        assert FEATURE_BALANCE_MEASURES_KEY in output

        values = output[FEATURE_BALANCE_MEASURES_KEY]
        assert isinstance(values, dict)
        assert len(values) == 3

        assert FEATURES_KEY in values
        assert len(values[FEATURES_KEY]) == 0

        assert UNIQUE_CLASSES_KEY in values
        assert len(values[UNIQUE_CLASSES_KEY]) == 0

        assert MEASURES_KEY in values
        assert len(values[MEASURES_KEY]) == 0

    def test_transform_distribution_balance_measures_with_valid_input(
        self, distribution_balance_measures
    ):
        output = DataBalance.transform_distribution_balance_measures(
            df=distribution_balance_measures
        )
        assert isinstance(output, dict)
        assert len(output) == 1
        assert DISTRIBUTION_BALANCE_MEASURES_KEY in output

        values = output[DISTRIBUTION_BALANCE_MEASURES_KEY]
        assert isinstance(values, dict)
        assert len(values) == 2

        assert FEATURES_KEY in values
        assert len(values[FEATURES_KEY]) > 0

        assert MEASURES_KEY in values
        assert len(values[MEASURES_KEY]) > 0

    def test_transform_distribution_balance_measures_with_invalid_input(self):
        output = DataBalance.transform_distribution_balance_measures(df=None)
        assert isinstance(output, dict)
        assert len(output) == 1
        assert DISTRIBUTION_BALANCE_MEASURES_KEY in output

        values = output[DISTRIBUTION_BALANCE_MEASURES_KEY]
        assert isinstance(values, dict)
        assert len(values) == 2

        assert FEATURES_KEY in values
        assert len(values[FEATURES_KEY]) == 0

        assert MEASURES_KEY in values
        assert len(values[MEASURES_KEY]) == 0

    def test_transform_aggregate_balance_measures_with_valid_input(
        self, aggregate_balance_measures
    ):
        output = DataBalance.transform_aggregate_balance_measures(
            df=aggregate_balance_measures
        )
        assert isinstance(output, dict)
        assert len(output) == 1
        assert AGGREGATE_BALANCE_MEASURES_KEY in output

        values = output[AGGREGATE_BALANCE_MEASURES_KEY]
        assert isinstance(values, dict)
        assert len(values) == 1

        assert MEASURES_KEY in values
        assert len(values[MEASURES_KEY]) > 0

    def test_transform_aggregate_balance_measures_with_invalid_input(self):
        output = DataBalance.transform_aggregate_balance_measures(df=None)
        assert isinstance(output, dict)
        assert len(output) == 1
        assert AGGREGATE_BALANCE_MEASURES_KEY in output

        values = output[AGGREGATE_BALANCE_MEASURES_KEY]
        assert isinstance(values, dict)
        assert len(values) == 1

        assert MEASURES_KEY in values
        assert len(values[MEASURES_KEY]) == 0
