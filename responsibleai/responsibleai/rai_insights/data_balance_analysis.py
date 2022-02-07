# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Computations for Data Balance Measures within a Dataset"""

from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional, Set, Tuple
import warnings

from raimitigations.databalanceanalysis import (
    FeatureBalanceMeasure,
    AggregateBalanceMeasure,
    DistributionBalanceMeasure,
)
import pandas as pd


FEATURE_NAME = "FeatureName"
CLASS_A = "ClassA"
CLASS_B = "ClassB"

SPARK_AGGREGATE_COL = "AggregateBalanceMeasure.*"
SPARK_DISTRIBUTION_COL = "DistributionBalanceMeasure.*"
SPARK_FEATURE_COL = "FeatureBalanceMeasure.*"


@dataclass
class DataBalanceAnalysis:
    df: pd.DataFrame = None
    cols_of_interest: List[str] = None
    label_col: str = None
    label_func: Callable = None
    measures: Dict[str, Any] = None


def _get_data_balance_measures(
    dba: DataBalanceAnalysis,
) -> Optional[Dict[str, Any]]:
    if dba.measures:
        # Assume that they have been pre-computed and are valid, so return them
        return dba.measures

    if (
        not dba
        or dba.df is None
        or not all([dba.cols_of_interest, dba.label_col])
    ):
        return

    try:
        (
            feat_measures_df,
            dist_measures_df,
            agg_measures_df,
        ) = _compute_measures(dba=dba)

        unique_values, feature_measures = _transform_feature_measures(
            df=feat_measures_df
        )
        distribution_measures = _transform_distribution_measures(
            df=dist_measures_df
        )
        aggregate_measures = _transform_aggregate_measures(df=agg_measures_df)

        return _transform_data_balance_measures(
            unique_values=unique_values,
            feature_measures=feature_measures,
            distribution_measures=distribution_measures,
            aggregate_measures=aggregate_measures,
        )
    except Exception as e:
        warnings.warn(
            f"Failed to get data balance measures for dataset due to {e!r}."
        )


def _compute_measures(
    dba: DataBalanceAnalysis,
) -> Tuple[
    Optional[pd.DataFrame], Optional[pd.DataFrame], Optional[pd.DataFrame]
]:
    feature_measures: pd.DataFrame = None
    distribution_measures: pd.DataFrame = None
    aggregate_measures: pd.DataFrame = None

    try:
        # This inner try-catch is to catch an ImportError from importing
        # the Spark implementation, which requires Spark env
        # and SynapseML package to be installed
        try:
            from synapse.ml.exploratory import (
                AggregateBalanceMeasure as SparkAggregateBalanceMeasure,
                DistributionBalanceMeasure as SparkDistributionBalanceMeasure,
                FeatureBalanceMeasure as SparkFeatureBalanceMeasure,
            )

            # If imports succeed, assume that the df is a spark df and
            # compute measures using Spark implementation

            # We don't need to deepcopy the spark df because it is immutable
            dba.df = dba.df.withColumn(dba.label_col, dba.label_func)

            feature_measures: pd.DataFrame = (
                SparkFeatureBalanceMeasure()
                .setSensitiveCols(dba.cols_of_interest)
                .setLabelCol(dba.label_col)
                .transform(dba.df)
                .select(FEATURE_NAME, CLASS_A, CLASS_B, SPARK_FEATURE_COL)
                .toPandas()
            )
            distribution_measures: pd.DataFrame = (
                SparkDistributionBalanceMeasure()
                .setSensitiveCols(dba.cols_of_interest)
                .transform(dba.df)
                .select(FEATURE_NAME, SPARK_DISTRIBUTION_COL)
                .toPandas()
            )
            aggregate_measures: pd.DataFrame = (
                SparkAggregateBalanceMeasure()
                .setSensitiveCols(dba.cols_of_interest)
                .transform(dba.df)
                .select(SPARK_AGGREGATE_COL)
                .toPandas()
            )

        # If imports fail, revert to non-Spark implementation
        except ImportError:
            # We need to deepcopy the df, otherwise the original df will mutate
            dba.df = dba.df.copy(deep=True)

            if dba.label_func:
                dba.df[dba.label_col] = dba.df[dba.label_col].apply(
                    dba.label_func
                )

            feature_measures: pd.DataFrame = FeatureBalanceMeasure(
                dba.cols_of_interest, dba.label_col
            ).measures(dba.df)
            distribution_measures: pd.DataFrame = DistributionBalanceMeasure(
                dba.cols_of_interest
            ).measures(dba.df)
            aggregate_measures: pd.DataFrame = AggregateBalanceMeasure(
                dba.cols_of_interest
            ).measures(dba.df)
    except Exception as e:
        warnings.warn(
            (
                "Failed to compute all data balance measures ",
                f"for dataset due to {e!r}.",
            )
        )

    return feature_measures, distribution_measures, aggregate_measures


def _transform_feature_measures(
    df: pd.DataFrame,
) -> Tuple[Dict[str, List[str]], Dict[str, Dict[str, Dict[str, float]]]]:
    """
    Transform the feature balance measures df into a dictionary
    acceptable by the RAI dashboard
    """
    unique_values: Dict[str, Set[str]] = {}
    feature_measures: Dict[str, Dict[str, Dict[str, float]]] = {}

    try:
        rows: List[Any] = df.reset_index(drop=True).to_dict(orient="records")
        unique_values: Dict[str, Set[str]] = {
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

            unique_values[feature_name].add(class_a)
            unique_values[feature_name].add(class_b)

            del row[FEATURE_NAME]
            del row[CLASS_A]
            del row[CLASS_B]

            feature_measures[feature_name][class_key] = row

        unique_values: Dict[str, List[str]] = {
            k: list(v) for k, v in unique_values.items()
        }
    except Exception as e:
        warnings.warn(
            f"Failed to transform feature measures for dataset due to {e!r}."
        )

    return unique_values, feature_measures


def _transform_distribution_measures(
    df: pd.DataFrame,
) -> Dict[str, Dict[str, float]]:
    """
    Transform the distribution balance measures df into a dictionary
    acceptable by the RAI dashboard
    """
    distribution_measures: Dict[str, Dict[str, float]] = {}

    try:
        rows: List[Any] = df.reset_index(drop=True).to_dict(orient="records")
        distribution_measures: Dict[str, Dict[str, float]] = {
            r[FEATURE_NAME]: r for r in rows
        }

        for measures in distribution_measures.values():
            del measures[FEATURE_NAME]
    except Exception as e:
        warnings.warn(
            (
                "Failed to transform distribution measures ",
                f"for dataset due to {e!r}.",
            )
        )

    return distribution_measures


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
            f"Failed to transform aggregate measures for dataset due to {e!r}."
        )

    return aggregate_measures


def _transform_data_balance_measures(
    unique_values, feature_measures, distribution_measures, aggregate_measures
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
                "featureValues": unique_values,
                "measures": feature_measures,
            },
            "aggregateBalanceMeasures": aggregate_measures,
        }
    except Exception as e:
        warnings.warn(
            (
                "Failed to transform all data balance measures ",
                f"for dataset due to {e!r}.",
            )
        )

    return data_balance_measures
