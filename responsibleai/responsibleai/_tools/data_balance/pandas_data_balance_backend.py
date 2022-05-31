# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import warnings
from typing import List, Optional

import pandas as pd
from raimitigations.databalanceanalysis import (
    AggregateBalanceMeasure,
    DistributionBalanceMeasure,
    FeatureBalanceMeasure,
)

from responsibleai._tools.data_balance.base_data_balance_backend import (
    BaseDataBalanceBackend,
)


class PandasDataBalanceBackend(BaseDataBalanceBackend):
    @classmethod
    def prepare_df(
        cls,
        df: pd.DataFrame,
        target_column: str,
        pos_label: Optional[str] = None,
    ) -> pd.DataFrame:
        """
        Prepare dataframe for data balance analysis.

        :param df: The dataframe to prepare.
        :type df: pd.DataFrame
        :param target_column: The target column in the dataframe.
        :type target_column: str
        :param pos_label: The positive label of the target column.
        :type pos_label: Optional[str]
        :return: The prepared dataframe.
        :rtype: pd.DataFrame
        """
        try:
            # We need to deepcopy the df otherwise original df will mutate
            df = df.copy(deep=True)

            # Transform target_column to {0, 1} because Data Balance
            # only supports binary classification for now
            if pos_label and pos_label in df[target_column].unique():
                df[target_column] = df[target_column].apply(
                    lambda x: 1 if x == pos_label else 0
                )
        except Exception as e:
            raise ValueError(f"Failed to prepare df due to {e!r}")

        return df

    @classmethod
    def compute_feature_balance_measures(
        cls, df: pd.DataFrame, cols_of_interest: List[str], target_column: str
    ) -> pd.DataFrame:
        """
        Compute feature balance measures on columns of interest
        and a target column.

        :param df: The dataframe to compute feature balance measures on.
        :type df: pd.DataFrame
        :param cols_of_interest: The columns to compute measures on.
        :type cols_of_interest: List[str]
        :param target_column: The target column in the dataframe.
        :type target_column: str
        :return: The computed feature balance measures.
        :rtype: pd.DataFrame
        """
        feature_balance_measures: pd.DataFrame = pd.DataFrame()
        try:
            feature_balance_measures: pd.DataFrame = FeatureBalanceMeasure(
                cols_of_interest, target_column
            ).measures(df)
        except Exception as e:
            warnings.warn(
                (
                    "Failed to compute feature balance measures"
                    f" due to {e!r}."
                )
            )

        return feature_balance_measures

    @classmethod
    def compute_distribution_balance_measures(
        cls, df: pd.DataFrame, cols_of_interest: List[str]
    ) -> pd.DataFrame:
        """
        Compute distribution balance measures on columns of interest.

        :param df: The dataframe to compute distribution balance measures on.
        :type df: pd.DataFrame
        :param cols_of_interest: The columns to compute measures on.
        :type cols_of_interest: List[str]
        :return: The computed distribution balance measures.
        :rtype: pd.DataFrame
        """
        distribution_measures: pd.DataFrame = pd.DataFrame()
        try:
            distribution_measures: pd.DataFrame = DistributionBalanceMeasure(
                cols_of_interest
            ).measures(df)
        except Exception as e:
            warnings.warn(
                (
                    "Failed to compute distribution balance measures"
                    f" due to {e!r}."
                )
            )

        return distribution_measures

    @classmethod
    def compute_aggregate_balance_measures(
        cls, df: pd.DataFrame, cols_of_interest: List[str]
    ) -> pd.DataFrame:
        """
        Compute aggregate balance measures on columns of interest.

        :param df: The dataframe to compute aggregate balance measures on.
        :type df: pd.DataFrame
        :param cols_of_interest: The columns to compute measures on.
        :type cols_of_interest: List[str]
        :return: The computed aggregate balance measures.
        :rtype: pd.DataFrame
        """
        aggregate_measures: pd.DataFrame = pd.DataFrame()
        try:
            aggregate_measures: pd.DataFrame = AggregateBalanceMeasure(
                cols_of_interest
            ).measures(df)
        except Exception as e:
            warnings.warn(
                (
                    "Failed to compute aggregate balance measures"
                    f" due to {e!r}."
                )
            )

        return aggregate_measures
