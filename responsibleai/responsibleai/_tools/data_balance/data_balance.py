# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from typing import Any, Dict, List, Optional, Set, Tuple, Union
import warnings

import pandas as pd

from responsibleai._tools.data_balance import BaseDataBalanceService
from responsibleai._tools.data_balance.factory import DataBalanceServiceFactory
from responsibleai._tools.shared.attribute_serialization import (
    convert_nan_to_none,
)
from responsibleai._tools.shared.backends import SupportedBackend

FEATURE_BALANCE_MEASURES_KEY = "featureBalanceMeasures"
DISTRIBUTION_BALANCE_MEASURES_KEY = "distributionBalanceMeasures"
AGGREGATE_BALANCE_MEASURES_KEY = "aggregateBalanceMeasures"

FEATURES_KEY = "features"
MEASURES_KEY = "measures"
UNIQUE_CLASSES_KEY = "uniqueClasses"

FEATURE_NAME = "FeatureName"
CLASS_A = "ClassA"
CLASS_B = "ClassB"


class DataBalance:
    @staticmethod
    def prepare_df(
        df: Union[pd.DataFrame, Any],
        target_column: str,
        backend: SupportedBackend,
        pos_label: Optional[str] = None,
    ) -> Union[pd.DataFrame, Any]:
        """
        Prepare and clone the dataframe using backend of choice.

        :param df: Dataframe to prepare for data balance computation.
        :type df: pd.DataFrame
        :param target_column: Name of target column.
        :type target_column: str
        :param pos_label: Positive label.
        :type pos_label: str
        :param backend: The backend to use.
        :type backend: SupportedBackend
        """
        service: BaseDataBalanceService = (
            DataBalanceServiceFactory.get_service(backend=backend)
        )

        prepared_df: pd.DataFrame = service.prepare_df(
            df=df,
            target_column=target_column,
            pos_label=pos_label,
        )

        return prepared_df

    @staticmethod
    def compute_measures(
        df: Union[pd.DataFrame, Any],
        cols_of_interest: List[str],
        target_column: str,
        backend: SupportedBackend,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Compute data balance using backend of choice.

        :param df: Dataframe to compute data balance measures on.
        :type df: pd.DataFrame
        :param cols_of_interest: List of columns to compute
        data balance measures on.
        :type cols_of_interest: List[str]
        :param target_column: Name of target column.
        :type target_column: str
        :param backend: The backend to use.
        :type backend: SupportedBackend
        """
        service: BaseDataBalanceService = (
            DataBalanceServiceFactory.get_service(backend=backend)
        )

        feature_balance_measures: pd.DataFrame = (
            service.compute_feature_balance_measures(
                df=df,
                cols_of_interest=cols_of_interest,
                target_column=target_column,
            )
        )
        distribution_balance_measures: pd.DataFrame = (
            service.compute_distribution_balance_measures(
                df=df,
                cols_of_interest=cols_of_interest,
            )
        )
        aggregate_balance_measures: pd.DataFrame = (
            service.compute_aggregate_balance_measures(
                df=df,
                cols_of_interest=cols_of_interest,
            )
        )

        return (
            feature_balance_measures,
            distribution_balance_measures,
            aggregate_balance_measures,
        )

    @staticmethod
    def transform_measures_to_dict(
        feature_balance_measures: pd.DataFrame,
        distribution_balance_measures: pd.DataFrame,
        aggregate_balance_measures: pd.DataFrame,
    ) -> Dict[str, Any]:
        """
        Takes computed data balance measures and transforms them into a
        dictionary acceptable by the RAI dashboard.
        """
        feat_measures_dict: Dict[
            str, Dict[str, Any]
        ] = DataBalance.transform_feature_balance_measures(
            df=feature_balance_measures,
        )
        dist_measures_dict: Dict[
            str, Dict[str, float]
        ] = DataBalance.transform_distribution_balance_measures(
            df=distribution_balance_measures,
        )
        agg_measures_dict: Dict[
            str, Dict[str, float]
        ] = DataBalance.transform_aggregate_balance_measures(
            df=aggregate_balance_measures,
        )

        return {
            **feat_measures_dict,
            **dist_measures_dict,
            **agg_measures_dict,
        }

    @staticmethod
    def transform_feature_balance_measures(
        df: pd.DataFrame,
    ) -> Dict[str, Dict[str, Any]]:
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

                row = {k: convert_nan_to_none(v) for k, v in row.items()}

                feature_measures[feature_name][class_key] = row

            unique_classes: Dict[str, List[str]] = {
                k: list(v) for k, v in unique_classes.items()
            }
        except Exception as e:
            warnings.warn(
                f"Failed to transform feature measures due to {e!r}."
            )

        return {
            FEATURE_BALANCE_MEASURES_KEY: {
                "features": list(feature_measures.keys()),
                "uniqueClasses": unique_classes,
                "measures": feature_measures,
            }
        }

    @staticmethod
    def transform_distribution_balance_measures(
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

        return {
            DISTRIBUTION_BALANCE_MEASURES_KEY: {
                "features": list(distribution_measures.keys()),
                "measures": distribution_measures,
            }
        }

    @staticmethod
    def transform_aggregate_balance_measures(
        df: pd.DataFrame,
    ) -> Dict[str, Dict[str, float]]:
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

        return {
            AGGREGATE_BALANCE_MEASURES_KEY: {
                "measures": aggregate_measures,
            }
        }
