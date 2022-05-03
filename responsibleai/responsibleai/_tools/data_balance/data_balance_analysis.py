# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from typing import Any, Dict, List, Optional, Set, Tuple, Union
import warnings

import pandas as pd
from raimitigations.databalanceanalysis import (
    FeatureBalanceMeasure,
    AggregateBalanceMeasure,
    DistributionBalanceMeasure,
)
try:
    import pyspark.sql.functions as F
    from synapse.ml import exploratory as SparkDataBalance
except ImportError:
    pass

from responsibleai._tools.shared.backends import SupportedBackend

FEATURE_NAME = "FeatureName"
CLASS_A = "ClassA"
CLASS_B = "ClassB"

SPARK_AGGREGATE_COL = "AggregateBalanceMeasure.*"
SPARK_DISTRIBUTION_COL = "DistributionBalanceMeasure.*"
SPARK_FEATURE_COL = "FeatureBalanceMeasure.*"


class DataBalanceAnalysis:
    @staticmethod
    def compute_measures(
        df: Union[pd.DataFrame, Any],
        cols_of_interest: List[str],
        target_column: str,
        pos_label: str,
        backend: str,
    ) -> Optional[Dict[str, Any]]:
        try:
            feat_measures_df, dist_measures_df, agg_measures_df = (
                DataBalanceAnalysis._compute_measures(
                    df=df,
                    cols_of_interest=cols_of_interest,
                    target_column=target_column,
                    pos_label=pos_label,
                    backend=backend,
                )
            )
            
            unique_classes, feature_measures = (
                DataBalanceAnalysis._transform_feature_measures(
                    df=feat_measures_df
                )
            )

            distribution_measures = (
                DataBalanceAnalysis._transform_distribution_measures(
                    df=dist_measures_df
                )
            )
            aggregate_measures = (
                DataBalanceAnalysis._transform_aggregate_measures(
                    df=agg_measures_df
                )
            )

            return DataBalanceAnalysis._transform_data_balance_measures(
                unique_classes=unique_classes,
                feature_measures=feature_measures,
                distribution_measures=distribution_measures,
                aggregate_measures=aggregate_measures,
            )
        except Exception as e:
            warnings.warn(f"Failed to get data balance measures due to {e!r}.")

    @staticmethod
    def _compute_measures(
        df: Union[pd.DataFrame, Any],
        cols_of_interest: List[str],
        target_column: str,
        pos_label: str,
        backend: str,
    ) -> Optional[Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]]:
        if backend == SupportedBackend.SPARK.value:
            try:
                return DataBalanceAnalysis._compute_measures_spark(
                    df=df,
                    cols_of_interest=cols_of_interest,
                    target_column=target_column,
                    pos_label=pos_label,
                )
            except Exception as e:
                warnings.warn(
                    f"Failed to compute data balance with spark due to {e!r}.",
                )

        # If spark backend fails or backend != spark, use pandas backend
        try:
            return DataBalanceAnalysis._compute_measures_pandas(
                df=df,
                cols_of_interest=cols_of_interest,
                target_column=target_column,
                pos_label=pos_label,
            )
        except Exception as e:
            warnings.warn(
                f"Failed to compute data balance with pandas due to {e!r}.",
            )

    @staticmethod
    def _compute_measures_spark(
        df: Any,
        cols_of_interest: List[str],
        target_column: str,
        pos_label: str,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        # df is actually of type pyspark.sql.DataFrame
        # but we don't specify that type since pyspark may not be installed

        # We don't need to deepcopy the spark df because it's immutable
        if pos_label:
            df = df.withColumn(
                target_column,
                F.when(
                    F.col(target_column).contains(pos_label), F.lit(1)
                ).otherwise(F.lit(0)),
            )

        feature_measures: pd.DataFrame = (
            SparkDataBalance.FeatureBalanceMeasure()
            .setSensitiveCols(cols_of_interest)
            .setLabelCol(target_column)
            .transform(df)
            .select(FEATURE_NAME, CLASS_A, CLASS_B, SPARK_FEATURE_COL)
            .toPandas()
        )
        distribution_measures: pd.DataFrame = (
            SparkDataBalance.DistributionBalanceMeasure()
            .setSensitiveCols(cols_of_interest)
            .transform(df)
            .select(FEATURE_NAME, SPARK_DISTRIBUTION_COL)
            .toPandas()
        )
        aggregate_measures: pd.DataFrame = (
            SparkDataBalance.AggregateBalanceMeasure()
            .setSensitiveCols(cols_of_interest)
            .transform(df)
            .select(SPARK_AGGREGATE_COL)
            .toPandas()
        )

        return feature_measures, distribution_measures, aggregate_measures

    @staticmethod
    def _compute_measures_pandas(
        df: pd.DataFrame,
        cols_of_interest: List[str],
        target_column: str,
        pos_label: str,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        # We need to deepcopy the df otherwise original df will mutate
        df = df.copy(deep=True)

        if pos_label and pos_label in df[target_column].unique():
            df[target_column] = df[target_column].apply(
                lambda x: 1 if x == pos_label else 0
            )

        feature_measures: pd.DataFrame = FeatureBalanceMeasure(
            cols_of_interest, target_column
        ).measures(df)
        distribution_measures: pd.DataFrame = DistributionBalanceMeasure(
            cols_of_interest
        ).measures(df)
        aggregate_measures: pd.DataFrame = AggregateBalanceMeasure(
            cols_of_interest
        ).measures(df)

        return feature_measures, distribution_measures, aggregate_measures

    @staticmethod
    def _transform_feature_measures(
        df: pd.DataFrame,
    ) -> Tuple[Dict[str, List[str]], Dict[str, Dict[str, Dict[str, float]]]]:
        """
        Transform the feature balance measures df into a dictionary
        acceptable by the RAI dashboard
        """
        unique_classes: Dict[str, Set[str]] = {}
        feature_measures: Dict[str, Dict[str, Dict[str, float]]] = {}

        try:
            rows: List[Any] = df.reset_index(drop=True).to_dict(
                orient="records"
            )
            unique_classes: Dict[str, Set[str]] = {
                r[FEATURE_NAME]: set() for r in rows
            }
            feature_measures: Dict[str, Dict[str, Dict[str, float]]] = {
                r[FEATURE_NAME]: {} for r in rows
            }

            for row in rows:
                feature_name: str = row[FEATURE_NAME]
                class_a: str = row[CLASS_A]
                class_b: str = row[CLASS_B]
                class_key: str = f"{class_a}__{class_b}"

                unique_classes[feature_name].add(class_a)
                unique_classes[feature_name].add(class_b)

                del row[FEATURE_NAME], row[CLASS_A], row[CLASS_B]

                feature_measures[feature_name][class_key] = row

            unique_classes: Dict[str, List[str]] = {
                k: list(v) for k, v in unique_classes.items()
            }
        except Exception as e:
            warnings.warn(
                f"Failed to transform feature measures due to {e!r}."
            )

        return unique_classes, feature_measures

    @staticmethod
    def _transform_distribution_measures(
        df: pd.DataFrame,
    ) -> Dict[str, Dict[str, float]]:
        """
        Transform the distribution balance measures df into a dictionary
        acceptable by the RAI dashboard
        """
        distribution_measures: Dict[str, Dict[str, float]] = {}

        try:
            rows: List[Any] = df.reset_index(drop=True).to_dict(
                orient="records"
            )
            distribution_measures: Dict[str, Dict[str, float]] = {
                r[FEATURE_NAME]: r for r in rows
            }

            for measures in distribution_measures.values():
                del measures[FEATURE_NAME]
        except Exception as e:
            warnings.warn(
                f"Failed to transform distribution measures due to {e!r}.",
            )

        return distribution_measures

    @staticmethod
    def _transform_aggregate_measures(df: pd.DataFrame) -> Dict[str, float]:
        """
        Transform the aggregate balance measures df into a dictionary
        acceptable by the RAI dashboard
        """
        aggregate_measures: Dict[str, float] = {}

        try:
            aggregate_measures: Dict[str, float] = df.reset_index(
                drop=True
            ).to_dict(orient="records")[0]
        except Exception as e:
            warnings.warn(
                f"Failed to transform aggregate measures due to {e!r}."
            )

        return aggregate_measures

    @staticmethod
    def _transform_data_balance_measures(
        unique_classes,
        feature_measures,
        distribution_measures,
        aggregate_measures,
    ) -> Dict[str, Any]:
        """
        Transform all data balance measures into a dictionary
        acceptable by the RAI dashboard
        """
        data_balance_measures: Dict[str, Any] = {}

        try:
            data_balance_measures: Dict[str, Any] = {
                "distributionBalanceMeasures": {
                    "features": list(distribution_measures.keys()),
                    "measures": distribution_measures,
                },
                "featureBalanceMeasures": {
                    "features": list(feature_measures.keys()),
                    "uniqueClasses": unique_classes,
                    "measures": feature_measures,
                },
                "aggregateBalanceMeasures": {
                    "measures": aggregate_measures,
                },
            }
        except Exception as e:
            warnings.warn(
                f"Failed to transform all data balance measures due to {e!r}."
            )

        return data_balance_measures
