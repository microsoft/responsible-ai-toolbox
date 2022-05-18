# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import warnings
from typing import Any, List

import pandas as pd
from raimitigations.databalanceanalysis import (AggregateBalanceMeasure,
                                                DistributionBalanceMeasure,
                                                FeatureBalanceMeasure)

from responsibleai._tools.data_balance import BaseDataBalanceService


class PandasDataBalanceService(BaseDataBalanceService):
    @classmethod
    def prepare_df(
        cls, df: Any, target_column: str, pos_label: str
    ) -> pd.DataFrame:
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
            warnings.warn(f"Failed to prepare df due to {e!r}")

        return df

    @classmethod
    def compute_feature_balance_measures(
        cls, df: Any, cols_of_interest: List[str], target_column: str
    ) -> pd.DataFrame:
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
        cls, df: Any, cols_of_interest: List[str]
    ) -> pd.DataFrame:
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
        cls, df: Any, cols_of_interest: List[str]
    ) -> pd.DataFrame:
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
