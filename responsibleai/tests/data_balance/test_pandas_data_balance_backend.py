# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from responsibleai._tools.data_balance.pandas_data_balance_backend import (
    PandasDataBalanceBackend,
)


class TestPandasDataBalanceBackend:
    def test_prepare_df_ensure_cloned(self, adult_data):
        train_df, _, _, target_col = adult_data
        output = PandasDataBalanceBackend.prepare_df(
            df=train_df, target_column=target_col, pos_label=None
        )
        assert train_df.equals(output)  # Same elements within the dataframes
        assert train_df is not output  # Different objects

    def test_prepare_df_with_valid_input_no_pos_label(self, adult_data):
        train_df, _, _, target_col = adult_data
        assert train_df[target_col].unique().tolist() == [0, 1]

        output = PandasDataBalanceBackend.prepare_df(
            df=train_df, target_column=target_col, pos_label=None
        )
        assert output[target_col].unique().tolist() == [0, 1]
        assert train_df.equals(output)
        assert train_df is not output

    def test_prepare_df_with_valid_input_and_pos_label(self, adult_data):
        train_df, _, _, target_col = adult_data
        assert train_df[target_col].unique().tolist() == [0, 1]

        train_df = train_df.copy(deep=True)
        neg_label, pos_label = "<=50k", ">50k"
        train_df[target_col] = train_df[target_col].apply(
            lambda x: neg_label if x == 0 else pos_label
        )
        assert train_df[target_col].unique().tolist() == [neg_label, pos_label]

        output = PandasDataBalanceBackend.prepare_df(
            df=train_df, target_column=target_col, pos_label=pos_label
        )
        assert output[target_col].unique().tolist() == [0, 1]

    def test_prepare_df_with_null_input(self):
        with pytest.raises(ValueError):
            output = PandasDataBalanceBackend.prepare_df(
                df=None, target_column=None, pos_label=None
            )
            assert output is None

    def test_prepare_df_with_empty_df(self):
        empty_df = pd.DataFrame()
        output = PandasDataBalanceBackend.prepare_df(
            df=empty_df, target_column=None, pos_label=None
        )
        assert output.empty
        assert empty_df.equals(output)
        assert empty_df is not output

    def test_prepare_df_with_invalid_target_column(self, adult_data):
        train_df, _, _, _ = adult_data
        with pytest.raises(ValueError):
            output = PandasDataBalanceBackend.prepare_df(
                df=train_df, target_column=None, pos_label=">50k"
            )
            assert train_df.equals(output)
            assert train_df is not output

        with pytest.raises(ValueError):
            output = PandasDataBalanceBackend.prepare_df(
                df=train_df, target_column="", pos_label=">50k"
            )
            assert train_df.equals(output)
            assert train_df is not output

        with pytest.raises(ValueError):
            output = PandasDataBalanceBackend.prepare_df(
                df=train_df, target_column="invalid column", pos_label=">50k"
            )
            assert train_df.equals(output)
            assert train_df is not output

    def test_prepare_df_with_empty_pos_label(self, adult_data):
        train_df, _, _, target_col = adult_data
        output = PandasDataBalanceBackend.prepare_df(
            df=train_df, target_column=target_col, pos_label=""
        )
        assert output[target_col].unique().tolist() == [0, 1]
        assert train_df.equals(output)
        assert train_df is not output

    def test_prepare_df_with_invalid_pos_label(self, adult_data):
        train_df, _, _, target_col = adult_data
        assert train_df[target_col].unique().tolist() == [0, 1]

        with pytest.warns():
            output = PandasDataBalanceBackend.prepare_df(
                df=train_df, target_column=target_col, pos_label="invalid"
            )
            assert output[target_col].unique().tolist() == [0, 1]

    def test_compute_feature_balance_measures_with_valid_input(
        self, adult_data
    ):
        train_df, _, cols_of_interest, target_col = adult_data
        output = PandasDataBalanceBackend.compute_feature_balance_measures(
            df=train_df,
            cols_of_interest=cols_of_interest,
            target_column=target_col,
        )

        measures = [
            "dp",
            "pmi",
            "sdc",
            "ji",
            "krc",
            "llr",
            "t_test",
            "ttest_pvalue",
        ]
        expected_cols = ["ClassA", "ClassB", "FeatureName"] + measures
        assert len(output.columns) == len(expected_cols)
        assert sorted(output.columns) == sorted(expected_cols)
        assert sorted(output["FeatureName"].unique()) == sorted(
            cols_of_interest
        )

        for col in cols_of_interest:
            filtered_df = output.query(f"FeatureName == '{col}'")
            classes = np.unique(filtered_df[["ClassA", "ClassB"]].values)
            assert sorted(train_df[col].unique()) == sorted(classes)

    def test_compute_feature_balance_measures_with_null_input(self):
        with pytest.warns():
            output = PandasDataBalanceBackend.compute_feature_balance_measures(
                df=None, cols_of_interest=None, target_column=None
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

    def test_compute_feature_balance_measures_with_empty_df(self, adult_data):
        _, _, cols_of_interest, target_col = adult_data
        empty_df = pd.DataFrame()
        output = PandasDataBalanceBackend.compute_feature_balance_measures(
            df=empty_df,
            cols_of_interest=cols_of_interest,
            target_column=target_col,
        )
        assert isinstance(output, pd.DataFrame)
        assert output.empty

    def test_compute_feature_balance_measures_with_invalid_cols_of_interest(
        self, adult_data
    ):
        train_df, _, _, target_col = adult_data
        with pytest.warns():
            output = PandasDataBalanceBackend.compute_feature_balance_measures(
                df=train_df, cols_of_interest=None, target_column=target_col
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

        with pytest.warns():
            output = PandasDataBalanceBackend.compute_feature_balance_measures(
                df=train_df, cols_of_interest=[], target_column=target_col
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

        with pytest.warns():
            output = PandasDataBalanceBackend.compute_feature_balance_measures(
                df=train_df,
                cols_of_interest=["invalid"],
                target_column=target_col,
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

    def test_compute_feature_balance_measures_with_invalid_target_column(
        self, adult_data
    ):
        train_df, _, cols_of_interest, _ = adult_data
        with pytest.warns():
            output = PandasDataBalanceBackend.compute_feature_balance_measures(
                df=train_df,
                cols_of_interest=cols_of_interest,
                target_column=None,
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

        with pytest.warns():
            output = PandasDataBalanceBackend.compute_feature_balance_measures(
                df=train_df,
                cols_of_interest=cols_of_interest,
                target_column="",
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

        with pytest.warns():
            output = PandasDataBalanceBackend.compute_feature_balance_measures(
                df=train_df,
                cols_of_interest=cols_of_interest,
                target_column="invalid",
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

    def test_compute_distribution_balance_measures_with_valid_input(
        self, adult_data
    ):
        train_df, _, cols_of_interest, _ = adult_data
        output = (
            PandasDataBalanceBackend.compute_distribution_balance_measures(
                df=train_df,
                cols_of_interest=cols_of_interest,
            )
        )

        measures = [
            "kl_divergence",
            "js_dist",
            "wasserstein_dist",
            "inf_norm_dist",
            "chi_sq_stat",
            "chi_sq_p_value",
            "total_variation_dist",
        ]
        expected_cols = ["FeatureName"] + measures
        assert output.shape == (len(cols_of_interest), len(expected_cols))
        assert sorted(output.columns) == sorted(expected_cols)
        assert sorted(output["FeatureName"].unique()) == sorted(
            cols_of_interest
        )

    def test_compute_distribution_balance_measures_with_null_input(self):
        with pytest.warns():
            output = (
                PandasDataBalanceBackend.compute_distribution_balance_measures(
                    df=None, cols_of_interest=None
                )
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

    def test_compute_distribution_balance_measures_with_empty_df(
        self, adult_data
    ):
        _, _, cols_of_interest, _ = adult_data
        empty_df = pd.DataFrame()
        output = (
            PandasDataBalanceBackend.compute_distribution_balance_measures(
                df=empty_df, cols_of_interest=cols_of_interest
            )
        )
        assert isinstance(output, pd.DataFrame)
        assert output.empty

    def test_compute_distribution_balance_measures_with_invalid_cols(
        self, adult_data
    ):
        train_df, _, _, _ = adult_data
        with pytest.warns():
            output = (
                PandasDataBalanceBackend.compute_distribution_balance_measures(
                    df=train_df, cols_of_interest=None
                )
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

        with pytest.warns():
            output = (
                PandasDataBalanceBackend.compute_distribution_balance_measures(
                    df=train_df, cols_of_interest=["invalid"]
                )
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

    def test_compute_distribution_balance_measures_with_no_cols_of_interest(
        self, adult_data
    ):
        train_df, _, _, _ = adult_data
        output = (
            PandasDataBalanceBackend.compute_distribution_balance_measures(
                df=train_df, cols_of_interest=[]
            )
        )
        assert isinstance(output, pd.DataFrame)
        assert output.empty

    def test_compute_aggregate_balance_measures_with_valid_input(
        self, adult_data
    ):
        train_df, _, cols_of_interest, _ = adult_data
        output = PandasDataBalanceBackend.compute_aggregate_balance_measures(
            df=train_df, cols_of_interest=cols_of_interest
        )

        measures = ["theil_l_index", "theil_t_index", "atkinson_index"]
        expected_cols = measures
        assert output.shape == (1, len(expected_cols))
        assert sorted(output.columns) == sorted(expected_cols)

    def test_compute_aggregate_balance_measures_with_null_input(self):
        with pytest.warns():
            output = (
                PandasDataBalanceBackend.compute_aggregate_balance_measures(
                    df=None, cols_of_interest=None
                )
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

    def test_compute_aggregate_balance_measures_with_empty_df(
        self, adult_data
    ):
        _, _, cols_of_interest, _ = adult_data
        empty_df = pd.DataFrame()
        output = PandasDataBalanceBackend.compute_aggregate_balance_measures(
            df=empty_df, cols_of_interest=cols_of_interest
        )
        assert isinstance(output, pd.DataFrame)
        assert output.empty

    def test_compute_aggregate_balance_measures_with_invalid_cols_of_interest(
        self, adult_data
    ):
        train_df, _, _, _ = adult_data
        with pytest.warns():
            output = (
                PandasDataBalanceBackend.compute_aggregate_balance_measures(
                    df=train_df, cols_of_interest=None
                )
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

        with pytest.warns():
            output = (
                PandasDataBalanceBackend.compute_aggregate_balance_measures(
                    df=train_df, cols_of_interest=[]
                )
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty

        with pytest.warns():
            output = (
                PandasDataBalanceBackend.compute_aggregate_balance_measures(
                    df=train_df, cols_of_interest=["invalid"]
                )
            )
            assert isinstance(output, pd.DataFrame)
            assert output.empty
