# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Data Balance Manager class."""

from typing import Any, Dict, List, Optional, Set, Tuple, Union
import warnings

import pandas as pd
from raimitigations.databalanceanalysis import (
    FeatureBalanceMeasure,
    AggregateBalanceMeasure,
    DistributionBalanceMeasure,
)

from responsibleai._internal.constants import ManagerNames
from responsibleai.managers.base_manager import BaseManager


FEATURE_NAME = "FeatureName"
CLASS_A = "ClassA"
CLASS_B = "ClassB"

SPARK_AGGREGATE_COL = "AggregateBalanceMeasure.*"
SPARK_DISTRIBUTION_COL = "DistributionBalanceMeasure.*"
SPARK_FEATURE_COL = "FeatureBalanceMeasure.*"


class DataBalanceManager(BaseManager):
    def __init__(
        self,
        train: pd.DataFrame,
        test: pd.DataFrame,
        target_column: str,
        dataset_name: Optional[str] = None,
    ):
        self._train = train
        self._test = test
        self._target_column = target_column
        self._dataset_name = dataset_name

        # Populated in compute()
        self._data_balance_measures = None

    def add(
        self,
        cols_of_interest: List[str],
        pos_label: Optional[str] = None,
        custom_data: Optional[Any] = None,
    ):
        self._cols_of_interest = cols_of_interest
        self._pos_label = pos_label
        self._custom_data = custom_data

    def compute(self):
        if (
            self._train is None
            or self._train.empty
            or not all([self._cols_of_interest, self._target_column])
        ):
            return

        if self._custom_data is not None:
            self._df = self._custom_data
        elif self._test is not None and not self._test.empty:
            self._df = pd.concat([self._train, self._test])
        else:
            self._df = self._train

        self._data_balance_measures = (
            DataBalanceManager._get_data_balance_measures(
                df=self._df,
                cols_of_interest=self._cols_of_interest,
                target_column=self._target_column,
                pos_label=self._pos_label,
            )
        )

    def get(self):
        ...

    def list(self):
        ...

    def get_data(self):
        return (
            self._data_balance_measures if self._data_balance_measures else {}
        )

    @property
    def name(self):
        return ManagerNames.DATA_BALANCE

    @staticmethod
    def _get_data_balance_measures(
        df: Union[pd.DataFrame, Any],
        cols_of_interest: List[str],
        target_column: str,
        pos_label: str,
    ) -> Optional[Dict[str, Any]]:
        try:
            (
                feat_measures_df,
                dist_measures_df,
                agg_measures_df,
            ) = DataBalanceManager._compute_measures(
                df=df,
                cols_of_interest=cols_of_interest,
                target_column=target_column,
                pos_label=pos_label,
            )

            (
                unique_values,
                feature_measures,
            ) = DataBalanceManager._transform_feature_measures(
                df=feat_measures_df
            )
            distribution_measures = (
                DataBalanceManager._transform_distribution_measures(
                    df=dist_measures_df
                )
            )
            aggregate_measures = (
                DataBalanceManager._transform_aggregate_measures(
                    df=agg_measures_df
                )
            )

            return DataBalanceManager._transform_data_balance_measures(
                unique_values=unique_values,
                feature_measures=feature_measures,
                distribution_measures=distribution_measures,
                aggregate_measures=aggregate_measures,
            )
        except Exception as e:
            warnings.warn(f"Failed to get data balance measures due to {e!r}.")

    def _save(self, path):
        """Abstract method to save the manager.

        :param path: The directory path to save the manager to.
        :type path: str
        """
        ...

    @staticmethod
    def _load(path, rai_insights):
        """Static method to load the manager.

        :param path: The directory path to load the manager from.
        :type path: str
        :param rai_insights: The loaded parent RAIInsights.
        :type rai_insights: RAIInsights
        :return: The BaseManager after loading.
        :rtype: BaseManager
        """
        ...

    @staticmethod
    def _compute_measures(
        df: Union[pd.DataFrame, Any],
        cols_of_interest: List[str],
        target_column: str,
        pos_label: str,
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
                from synapse.ml import exploratory as SparkDataBalance
                import pyspark.sql.functions as F

                # If imports succeed, assume that the df is a spark df and
                # compute measures using Spark implementation

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

            # If imports fail, revert to non-Spark implementation
            except ImportError:
                # We need to deepcopy the df otherwise original df will mutate
                df = df.copy(deep=True)

                if pos_label and pos_label in df[target_column].unique():
                    df[target_column] = df[target_column].apply(
                        lambda x: 1 if x == pos_label else 0
                    )

                feature_measures: pd.DataFrame = FeatureBalanceMeasure(
                    cols_of_interest, target_column
                ).measures(df)
                distribution_measures: pd.DataFrame = (
                    DistributionBalanceMeasure(cols_of_interest).measures(df)
                )
                aggregate_measures: pd.DataFrame = AggregateBalanceMeasure(
                    cols_of_interest
                ).measures(df)
        except Exception as e:
            warnings.warn(
                f"Failed to compute all data balance measures due to {e!r}.",
            )

        return feature_measures, distribution_measures, aggregate_measures

    @staticmethod
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
            rows: List[Any] = df.reset_index(drop=True).to_dict(
                orient="records"
            )
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
                f"Failed to transform feature measures due to {e!r}."
            )

        return unique_values, feature_measures

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
        unique_values,
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
                    "featureValues": unique_values,
                    "measures": feature_measures,
                },
                "aggregateBalanceMeasures": aggregate_measures,
            }
        except Exception as e:
            warnings.warn(
                f"Failed to transform all data balance measures due to {e!r}."
            )

        return data_balance_measures
