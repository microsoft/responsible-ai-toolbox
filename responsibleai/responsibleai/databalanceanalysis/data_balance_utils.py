# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import warnings
from typing import Any, Dict, List

import pandas as pd

from responsibleai.databalanceanalysis.constants import Constants

FEATURE_BALANCE_MEASURES_KEY = "FeatureBalanceMeasures"
DISTRIBUTION_BALANCE_MEASURES_KEY = "DistributionBalanceMeasures"
AGGREGATE_BALANCE_MEASURES_KEY = "AggregateBalanceMeasures"


def prepare_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare DataFrame for data balance analysis.

    :param df: The DataFrame to prepare.
    :type df: pd.DataFrame
    :return: The prepared DataFrame.
    :rtype: pd.DataFrame
    """
    try:
        # Deepcopy the df otherwise the original df will mutate
        df = df.copy(deep=True)
    except Exception as e:
        raise ValueError(f"Failed to prepare df due to {e!r}")

    return df


def transform_measures_to_dict(
    feature_balance_measures: Dict[str, pd.DataFrame],
    distribution_balance_measures: pd.DataFrame,
    aggregate_balance_measures: pd.DataFrame,
) -> Dict[str, Any]:
    """
    Takes computed data balance measures and transforms them into a
    dictionary acceptable by the RAI dashboard. Even if any set of measures
    fail to be transformed, a valid dict will still be returned.

    :param feature_balance_measures: Feature balance measures.
    :type feature_balance_measures: Dict[str, pd.DataFrame]
    :param distribution_balance_measures: Distribution balance measures.
    :type distribution_balance_measures: pd.DataFrame
    :param aggregate_balance_measures: Aggregate balance measures.
    :type aggregate_balance_measures: pd.DataFrame
    :return: A dictionary of data balance measures.
    :rtype: Dict[str, Any]
    """
    feat_measures_dict: Dict[
        str, Dict[str, Any]
    ] = transform_feature_balance_measures(dfs=feature_balance_measures)
    dist_measures_dict: Dict[
        str, Dict[str, float]
    ] = transform_distribution_balance_measures(
        df=distribution_balance_measures
    )
    agg_measures_dict: Dict[
        str, Dict[str, float]
    ] = transform_aggregate_balance_measures(df=aggregate_balance_measures)

    return {
        FEATURE_BALANCE_MEASURES_KEY: feat_measures_dict,
        DISTRIBUTION_BALANCE_MEASURES_KEY: dist_measures_dict,
        AGGREGATE_BALANCE_MEASURES_KEY: agg_measures_dict,
    }


def transform_feature_balance_measures(
    dfs: Dict[str, pd.DataFrame]
) -> Dict[str, Dict[str, Any]]:
    """
    Transform the dict of <positive label, feature balance measures DataFrame>
    pairs into a dictionary acceptable by the RAI dashboard.

    :param dfs: A dict of <positive label, measure DataFrame> pairs.
    :type dfs: Dict[str, pd.DataFrame]
    :return: A dictionary of feature balance measures.
    :rtype: Dict[str, Dict[str, Any]]
    """
    all_measures: Dict[str, Dict[str, Any]] = {}

    try:
        for pos_label, df in dfs.items():
            measures: Dict[str, Dict[str, Any]] = {}
            rows: List[Any] = df.reset_index(drop=True).to_dict(
                orient="records"
            )

            # Transform { "FeatureName": "Col1", "MeasureA": 0.5, ... } to
            # { "Col1": { "MeasureA": 0.5, ... } }
            # which allows us to treat FeatureNames as the keys of the dict
            for row in rows:
                feature_name: str = row.pop(Constants.FEATURE_NAME.value)

                if feature_name not in measures:
                    measures[feature_name] = []

                measures[feature_name].append(row)

            all_measures[pos_label] = measures
    except Exception as e:
        # Warning instead of error so that other measures can be computed
        warnings.warn(f"Failed to transform feature measures due to {e!r}.")

    return all_measures


def transform_distribution_balance_measures(
    df: pd.DataFrame,
) -> Dict[str, Dict[str, float]]:
    """
    Transform the distribution balance measures df into a dictionary
    acceptable by the RAI dashboard.

    :param df: The distribution balance measures DataFrame.
    :type df: pd.DataFrame
    :return: A dictionary of distribution balance measures.
    :rtype: Dict[str, Dict[str, float]]
    """
    measures: Dict[str, Dict[str, float]] = {}

    try:
        rows: List[Any] = df.reset_index(drop=True).to_dict(orient="records")

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


def transform_aggregate_balance_measures(
    df: pd.DataFrame,
) -> Dict[str, float]:
    """
    Transform the aggregate balance measures df into a dictionary
    acceptable by the RAI dashboard.

    :param df: The aggregate balance measures DataFrame.
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
        warnings.warn(f"Failed to transform aggregate measures due to {e!r}.")

    return measures
