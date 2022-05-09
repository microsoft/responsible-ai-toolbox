# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Utilities for data balance module."""

from abc import ABC, abstractmethod
from typing import List

import pandas as pd


class BaseDataBalance(ABC):
    """
    BaseDataBalance enables multiple backends to compute data balance.
    """

    @abstractmethod
    @staticmethod
    def prepare_df(
        df: pd.DataFrame, target_column: str, pos_label: str,
    ) -> pd.DataFrame:
        """
        Prepare dataframe for data balance analysis.
        """

    @abstractmethod
    @staticmethod
    def compute_feature_balance_measures(
        df: pd.DataFrame, cols_of_interest: List[str], target_column: str,
    ) -> pd.DataFrame:
        """
        Compute feature balance measures on columns of interest
        and a target column.
        """

    @abstractmethod
    @staticmethod
    def compute_distribution_balance_measures(
        df: pd.DataFrame, cols_of_interest: List[str],
    ) -> pd.DataFrame:
        """
        Compute distribution balance measures on columns of interest.
        """

    @abstractmethod
    def compute_aggregate_balance_measures(
        df: pd.DataFrame, cols_of_interest: List[str],
    ) -> pd.DataFrame:
        """
        Compute aggregate balance measures on columns of interest.
        """
