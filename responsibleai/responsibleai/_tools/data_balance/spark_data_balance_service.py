# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import warnings
from typing import Any, List

import pandas as pd

try:
    import pyspark.sql.functions as F
    from synapse.ml import exploratory as SparkDataBalanceAnalysis
except ImportError:
    pass

from responsibleai._tools.data_balance import BaseDataBalanceService

SPARK_AGGREGATE_COL = "AggregateBalanceMeasure.*"
SPARK_DISTRIBUTION_COL = "DistributionBalanceMeasure.*"
SPARK_FEATURE_COL = "FeatureBalanceMeasure.*"

FEATURE_NAME = "FeatureName"
CLASS_A = "ClassA"
CLASS_B = "ClassB"


class SparkDataBalanceService(BaseDataBalanceService):
    @classmethod
    def prepare_df(cls, df: Any, target_column: str, pos_label: str) -> Any:
        try:
            if pos_label:
                df = df.withColumn(
                    target_column,
                    F.when(
                        F.col(target_column).contains(pos_label), F.lit(1)
                    ).otherwise(F.lit(0)),
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
            feature_balance_measures: pd.DataFrame = (
                SparkDataBalanceAnalysis.FeatureBalanceMeasure()
                .setSensitiveCols(cols_of_interest)
                .setLabelCol(target_column)
                .transform(df)
                .select(FEATURE_NAME, CLASS_A, CLASS_B, SPARK_FEATURE_COL)
                .toPandas()
            )
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
            distribution_measures: pd.DataFrame = (
                SparkDataBalanceAnalysis.DistributionBalanceMeasure()
                .setSensitiveCols(cols_of_interest)
                .transform(df)
                .select(FEATURE_NAME, SPARK_DISTRIBUTION_COL)
                .toPandas()
            )
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
            aggregate_measures: pd.DataFrame = (
                SparkDataBalanceService.AggregateBalanceMeasure()
                .setSensitiveCols(cols_of_interest)
                .transform(df)
                .select(SPARK_AGGREGATE_COL)
                .toPandas()
            )
        except Exception as e:
            warnings.warn(
                (
                    "Failed to compute aggregate balance measures"
                    f" due to {e!r}."
                )
            )

        return aggregate_measures
