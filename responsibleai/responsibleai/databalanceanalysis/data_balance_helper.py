# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import warnings
from typing import Any, Dict, List, Optional

import pandas as pd

from responsibleai.databalanceanalysis.constants import Constants

FEATURE_BALANCE_MEASURES_KEY = "FeatureBalanceMeasures"
DISTRIBUTION_BALANCE_MEASURES_KEY = "DistributionBalanceMeasures"
AGGREGATE_BALANCE_MEASURES_KEY = "AggregateBalanceMeasures"


class DataBalanceHelper:
    """
    Helper class for computing and transforming data balance measures
    to be used in a dashboard.
    """

    @staticmethod
    def prepare_df(
        df: pd.DataFrame, target_column: str, pos_label: Optional[str]
    ) -> pd.DataFrame:
        """
        Prepare DataFrame for data balance analysis.

        :param df: The DataFrame to prepare.
        :type df: pd.DataFrame
        :param target_column: The target column in the dataframe.
        :type target_column: str
        :param pos_label: The positive label of the target column.
        :type pos_label: Optional[str]
        :return: The prepared dataframe.
        :rtype: pd.DataFrame
        """
        try:
            # Deepcopy the df otherwise the original df will mutate
            df = df.copy(deep=True)

            # If the positive label is specified, transform the target column
            # to {0, 1} because Data Balance Analysis only supports binary
            # classification for now.
            if pos_label is not None:
                if pos_label not in df[target_column].unique():
                    raise ValueError(
                        f"Positive label '{pos_label}' not found in "
                        f"target column '{target_column}'"
                    )

                df[target_column] = df[target_column].apply(
                    lambda x: 1 if x == pos_label else 0
                )
        except Exception as e:
            raise ValueError(f"Failed to prepare df due to {e!r}")

        return df

    @staticmethod
    def transform_measures_to_dict(
        feature_balance_measures: pd.DataFrame,
        distribution_balance_measures: pd.DataFrame,
        aggregate_balance_measures: pd.DataFrame,
    ) -> Dict[str, Any]:
        """
        Takes computed data balance measures and transforms them into a
        dictionary acceptable by the RAI dashboard. Even if any set of measures
        fail to be transformed, a valid dict will still be returned.

        :param feature_balance_measures: Feature balance measures.
        :type feature_balance_measures: pd.DataFrame
        :param distribution_balance_measures: Distribution balance measures.
        :type distribution_balance_measures: pd.DataFrame
        :param aggregate_balance_measures: Aggregate balance measures.
        :type aggregate_balance_measures: pd.DataFrame
        :return: A dictionary of data balance measures.
        :rtype: Dict[str, Any]
        """
        feat_measures_dict: Dict[
            str, Dict[str, Any]
        ] = DataBalanceHelper.transform_feature_balance_measures(
            df=feature_balance_measures,
        )
        dist_measures_dict: Dict[
            str, Dict[str, float]
        ] = DataBalanceHelper.transform_distribution_balance_measures(
            df=distribution_balance_measures,
        )
        agg_measures_dict: Dict[
            str, Dict[str, float]
        ] = DataBalanceHelper.transform_aggregate_balance_measures(
            df=aggregate_balance_measures,
        )

        return {
            FEATURE_BALANCE_MEASURES_KEY: feat_measures_dict,
            DISTRIBUTION_BALANCE_MEASURES_KEY: dist_measures_dict,
            AGGREGATE_BALANCE_MEASURES_KEY: agg_measures_dict,
        }

    @staticmethod
    def transform_feature_balance_measures(
        df: pd.DataFrame,
    ) -> Dict[str, Dict[str, Any]]:
        """
        Transform the feature balance measures df into a dictionary
        acceptable by the RAI dashboard.

        :param df: The feature balance measures df.
        :type df: pd.DataFrame
        :return: A dictionary of feature balance measures.
        :rtype: Dict[str, Dict[str, Any]]
        """
        measures: Dict[str, Dict[str, Any]] = {}
        try:
            rows: List[Any] = df.reset_index(drop=True).to_dict(
                orient="records"
            )

            # Transform { "FeatureName": "Col1", "MeasureA": 0.5, ... } to
            # { "Col1": { "BalanceMeasure": 0.5, ... } }
            # which allows us to treat FeatureNames as the keys of the dict
            for row in rows:
                feature_name: str = row.pop(Constants.FEATURE_NAME.value)

                if feature_name not in measures:
                    measures[feature_name] = []

                measures[feature_name].append(row)
        except Exception as e:
            # Warning instead of error so that other measures can be computed
            warnings.warn(
                f"Failed to transform feature measures due to {e!r}."
            )

        return measures

    @staticmethod
    def transform_distribution_balance_measures(
        df: pd.DataFrame,
    ) -> Dict[str, Dict[str, float]]:
        """
        Transform the distribution balance measures df into a dictionary
        acceptable by the RAI dashboard.

        :param df: The distribution balance measures df.
        :type df: pd.DataFrame
        :return: A dictionary of distribution balance measures.
        :rtype: Dict[str, Dict[str, float]]
        """
        measures: Dict[str, Dict[str, float]] = {}

        try:
            rows: List[Any] = df.reset_index(drop=True).to_dict(
                orient="records"
            )

            # Transform { "FeatureName": "Col1", "MeasureA": 0.5, ... } to
            # { "Col1": { "BalanceMeasure": 0.5, ... } }
            # which allows us to treat FeatureNames as the keys of the dict
            for row in rows:
                feature_name: str = row.pop(Constants.FEATURE_NAME.value)
                measures[feature_name] = row
        except Exception as e:
            # Warning instead of error so that other measures can be computed
            warnings.warn(
                f"Failed to transform distribution measures due to {e!r}.",
            )

        return measures

    @staticmethod
    def transform_aggregate_balance_measures(
        df: pd.DataFrame,
    ) -> Dict[str, float]:
        """
        Transform the aggregate balance measures df into a dictionary
        acceptable by the RAI dashboard.

        :param df: The aggregate balance measures df.
        :type df: pd.DataFrame
        :return: A dictionary of aggregate balance measures.
        :rtype: Dict[str, float]
        """
        measures: Dict[str, float] = {}

        try:
            # Since aggregate balance measures output is only one row,
            # get the row via index 0 and return that.
            measures: Dict[str, float] = df.reset_index(drop=True).to_dict(
                orient="records"
            )[0]
        except Exception as e:
            # Warning instead of error so that other measures can be computed
            warnings.warn(
                f"Failed to transform aggregate measures due to {e!r}."
            )

        return measures
