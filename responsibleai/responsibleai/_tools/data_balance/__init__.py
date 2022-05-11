# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Utilities for data balance module."""

from abc import ABC, abstractmethod
from typing import Any, List

import pandas as pd


class BaseDataBalanceService(ABC):
    """
    BaseDataBalanceService enables multiple backends to compute data balance.
    """

    @abstractmethod
    def prepare_df(
        cls, df: Any, target_column: str, pos_label: str
    ) -> pd.DataFrame:
        """
        Prepare dataframe for data balance analysis.
        """

    @abstractmethod
    def compute_feature_balance_measures(
        cls, df: Any, cols_of_interest: List[str], target_column: str
    ) -> pd.DataFrame:
        """
        Compute feature balance measures on columns of interest
        and a target column.
        """

    @abstractmethod
    def compute_distribution_balance_measures(
        cls, df: Any, cols_of_interest: List[str]
    ) -> pd.DataFrame:
        """
        Compute distribution balance measures on columns of interest.
        """

    @abstractmethod
    def compute_aggregate_balance_measures(
        cls, df: Any, cols_of_interest: List[str]
    ) -> pd.DataFrame:
        """
        Compute aggregate balance measures on columns of interest.
        """
