# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from abc import ABC, abstractmethod
from typing import List

import pandas as pd


class BalanceMeasures(ABC):
    """
    An abstract class that computes measures for a given dataset
    and given columns of interest.
    """

    def __init__(self, cols_of_interest: List[str]) -> None:
        """
        Construct a BalanceMeasures class for calculating
        measures on the given columns of interest.

        :param cols_of_interest: The list of columns to compute measures on.
        :type cols_of_interest: List[str]
        """
        self.cols_of_interest = cols_of_interest

    @abstractmethod
    def measures(self, dataset: pd.DataFrame) -> pd.DataFrame:
        """
        Returns measures for the given dataset and columns of interest.

        :param dataset: The dataset to compute measures on.
        :type dataset: pd.DataFrame
        :return: A pandas DataFrame containing the measures.
        :rtype: pd.DataFrame
        """
        ...
