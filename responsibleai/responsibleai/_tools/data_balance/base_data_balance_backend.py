# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from abc import ABC, abstractmethod
from typing import Any, List, Optional


class BaseDataBalanceBackend(ABC):
    """
    BaseDataBalanceBackend enables multiple backends to compute data balance.
    """

    @abstractmethod
    def prepare_df(
        cls, df: Any, target_column: str, pos_label: Optional[str] = None
    ) -> Any:
        """
        Prepare dataframe for data balance analysis.

        :param df: The dataframe to prepare.
        :type df: Any
        :param target_column: The target column in the dataframe.
        :type target_column: str
        :param pos_label: The positive label of the target column.
        :type pos_label: Optional[str]
        :return: The prepared dataframe.
        :rtype: Any
        """

    @abstractmethod
    def compute_feature_balance_measures(
        cls, df: Any, cols_of_interest: List[str], target_column: str
    ) -> Any:
        """
        Compute feature balance measures on columns of interest
        and a target column.

        :param df: The dataframe to compute feature balance measures on.
        :type df: Any
        :param cols_of_interest: The columns to compute measures on.
        :type cols_of_interest: List[str]
        :param target_column: The target column in the dataframe.
        :type target_column: str
        :return: The computed feature balance measures.
        :rtype: Any
        """

    @abstractmethod
    def compute_distribution_balance_measures(
        cls, df: Any, cols_of_interest: List[str]
    ) -> Any:
        """
        Compute distribution balance measures on columns of interest.

        :param df: The dataframe to compute distribution balance measures on.
        :type df: Any
        :param cols_of_interest: The columns to compute measures on.
        :type cols_of_interest: List[str]
        :return: The computed distribution balance measures.
        :rtype: Any
        """

    @abstractmethod
    def compute_aggregate_balance_measures(
        cls, df: Any, cols_of_interest: List[str]
    ) -> Any:
        """
        Compute aggregate balance measures on columns of interest.

        :param df: The dataframe to compute aggregate balance measures on.
        :type df: Any
        :param cols_of_interest: The columns to compute measures on.
        :type cols_of_interest: List[str]
        :return: The computed aggregate balance measures.
        :rtype: Any
        """
