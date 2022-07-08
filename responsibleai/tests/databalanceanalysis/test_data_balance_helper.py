# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
import pytest

from responsibleai.databalanceanalysis.constants import Constants
from responsibleai.databalanceanalysis.data_balance_utils import (
    AGGREGATE_BALANCE_MEASURES_KEY, DISTRIBUTION_BALANCE_MEASURES_KEY,
    FEATURE_BALANCE_MEASURES_KEY, prepare_df,
    transform_aggregate_balance_measures,
    transform_distribution_balance_measures,
    transform_feature_balance_measures, transform_measures_to_dict)


class TestDataBalanceUtils:
    def test_prepare_df_ensure_cloned(self, adult_data):
        train_df, _, _, _, _ = adult_data
        output = prepare_df(df=train_df)
        assert train_df.equals(output)  # Ensure both dfs have the same data
        assert train_df is not output  # but are different objects

    def test_prepare_df_with_null_input(self):
        with pytest.raises(ValueError):
            output = prepare_df(df=None)
            assert output is None

    def test_prepare_df_with_empty_df(self):
        empty_df = pd.DataFrame()
        output = prepare_df(df=empty_df)
        # Should return an empty df instead of erroring
        assert output.empty
        assert empty_df.equals(output)
        assert empty_df is not output

    def test_transform_measures_to_dict_with_valid_input(
        self,
        adult_data_feature_balance_measures,
        adult_data_distribution_balance_measures,
        adult_data_aggregate_balance_measures,
    ):
        d = transform_measures_to_dict(
            adult_data_feature_balance_measures,
            adult_data_distribution_balance_measures,
            adult_data_aggregate_balance_measures,
        )
        assert isinstance(d, dict)
        assert len(d) == 3

        assert FEATURE_BALANCE_MEASURES_KEY in d
        assert isinstance(d[FEATURE_BALANCE_MEASURES_KEY], dict)
        assert len(d[FEATURE_BALANCE_MEASURES_KEY]) != 0

        assert DISTRIBUTION_BALANCE_MEASURES_KEY in d
        assert isinstance(d[DISTRIBUTION_BALANCE_MEASURES_KEY], dict)
        assert len(d[DISTRIBUTION_BALANCE_MEASURES_KEY]) != 0

        assert AGGREGATE_BALANCE_MEASURES_KEY in d
        assert isinstance(d[AGGREGATE_BALANCE_MEASURES_KEY], dict)
        assert len(d[AGGREGATE_BALANCE_MEASURES_KEY]) != 0

    @pytest.mark.parametrize("measures", [None, pd.DataFrame()])
    def test_transform_measures_to_dict_with_invalid_input(self, measures):
        d = transform_measures_to_dict(
            feature_balance_measures=measures,
            distribution_balance_measures=measures,
            aggregate_balance_measures=measures,
        )
        # Even with invalid input, should return a dict of empty dicts
        assert isinstance(d, dict)
        assert len(d) == 3

        assert FEATURE_BALANCE_MEASURES_KEY in d
        assert isinstance(d[FEATURE_BALANCE_MEASURES_KEY], dict)
        assert len(d[FEATURE_BALANCE_MEASURES_KEY]) == 0

        assert DISTRIBUTION_BALANCE_MEASURES_KEY in d
        assert isinstance(d[DISTRIBUTION_BALANCE_MEASURES_KEY], dict)
        assert len(d[DISTRIBUTION_BALANCE_MEASURES_KEY]) == 0

        assert AGGREGATE_BALANCE_MEASURES_KEY in d
        assert isinstance(d[AGGREGATE_BALANCE_MEASURES_KEY], dict)
        assert len(d[AGGREGATE_BALANCE_MEASURES_KEY]) == 0

    def test_transform_feature_balance_measures_with_valid_input(
        self, adult_data_feature_balance_measures
    ):
        pos_label = "1"

        d = transform_feature_balance_measures(
            dfs=adult_data_feature_balance_measures
        )
        assert isinstance(d, dict)
        assert len(d) != 0

        # FeatureNames in the df are transformed to keys of the dict
        feature_names = adult_data_feature_balance_measures[pos_label][
            Constants.FEATURE_NAME.value
        ].unique()
        for col in feature_names:
            assert col in d[pos_label]

    @pytest.mark.parametrize("dfs", [None, pd.DataFrame(), {}])
    def test_transform_feature_balance_measures_with_invalid_input(self, dfs):
        d = transform_feature_balance_measures(dfs=dfs)
        assert isinstance(d, dict)
        assert len(d) == 0

    def test_transform_distribution_balance_measures_with_valid_input(
        self, adult_data_distribution_balance_measures
    ):
        d = transform_distribution_balance_measures(
            df=adult_data_distribution_balance_measures
        )
        assert isinstance(d, dict)
        assert len(d) != 0

        # FeatureNames in the df are transformed to keys of the dict
        feature_names = adult_data_distribution_balance_measures[
            Constants.FEATURE_NAME.value
        ].unique()
        for col in feature_names:
            assert col in d

    @pytest.mark.parametrize("df", [None, pd.DataFrame()])
    def test_transform_distribution_balance_measures_with_invalid_input(
        self, df
    ):
        d = transform_distribution_balance_measures(df=df)
        assert isinstance(d, dict)
        assert len(d) == 0

    def test_transform_aggregate_balance_measures_with_valid_input(
        self, adult_data_aggregate_balance_measures
    ):
        d = transform_aggregate_balance_measures(
            df=adult_data_aggregate_balance_measures
        )
        assert isinstance(d, dict)
        assert len(d) != 0

    @pytest.mark.parametrize("df", [None, pd.DataFrame()])
    def test_transform_aggregate_balance_measures_with_invalid_input(self, df):
        d = transform_aggregate_balance_measures(df=df)
        assert isinstance(d, dict)
        assert len(d) == 0
