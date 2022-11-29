# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from typing import Callable, Dict, List

import numpy as np
import pandas as pd

from responsibleai.databalanceanalysis.balance_measures import BalanceMeasures
from responsibleai.databalanceanalysis.constants import Measures


def _get_generalized_entropy_index(
    benefits: np.array,
    alpha: float,
    use_abs_val: bool,
    error_tolerance: float = 1e-12,
) -> float:
    """
    Returns the general entropy index, a measure of redundancy in the data.
    https://en.wikipedia.org/wiki/Generalized_entropy_index

    :param benefits: The probabilities of each feature value combination
        occurring in the data.
    :type benefits: np.array
    :param alpha: A parameter which regulates the weight given to distances
        between benefits at different parts of the distribution.
    :type alpha: float
    :param use_abs_val: Whether to use the absolute value of the benefits
        or not.
    :type use_abs_val: bool
    :param error_tolerance: The error tolerance to use when calculating
        the generalized entropy index.
    :type error_tolerance: float
    :return: The generalized entropy index.
    :rtype: float
    """
    if use_abs_val:
        benefits = np.absolute(benefits)

    benefits_mean = np.mean(benefits)
    norm_benefits = benefits / benefits_mean
    count = norm_benefits.size

    if abs(alpha - 1.0) < error_tolerance:
        gei = np.sum(norm_benefits * np.log(norm_benefits)) / count
    elif abs(alpha) < error_tolerance:
        gei = np.sum(-np.log(norm_benefits)) / count
    else:
        gei = np.sum(np.power(norm_benefits, alpha) - 1.0) / (
            count * alpha * (alpha - 1.0)
        )

    return gei


def get_atkinson_index(
    benefits: np.array,
    epsilon: float = 1.0,
    error_tolerance: float = 1e-12,
) -> float:
    """
    Returns the Atkinson Index, a measure of income inequality that
    indicates the percentage of the data that needs to be foregone
    to have equal shares of income.
    https://en.wikipedia.org/wiki/Atkinson_index

    :param benefits: The probabilities of each feature value combination
        occurring in the data.
    :type benefits: np.array
    :param epsilon: A parameter that regulates the weight given
        to the distances between benefits.
    :type epsilon: float
    :param error_tolerance: The error tolerance to use when calculating
        the Atkinson Index.
    :type error_tolerance: float
    :return: The Atkinson Index.
    :rtype: float
    """
    count = benefits.size
    benefits_mean = np.mean(benefits)
    norm_benefits = benefits / benefits_mean
    alpha = 1 - epsilon

    if abs(alpha) < error_tolerance:
        ati = 1.0 - np.power(np.prod(norm_benefits), 1.0 / count)
    else:
        power_mean = np.sum(np.power(norm_benefits, alpha)) / count
        ati = 1.0 - np.power(power_mean, 1.0 / alpha)

    return ati


def get_theil_t_index(benefits: np.array) -> float:
    """
    Returns Theil T Index, a measure of income inequality that is more
    sensitive to differences at the top of the distribution.
    https://en.wikipedia.org/wiki/Theil_index

    :param benefits: The probabilities of each feature value combination
        occurring in the data.
    :type benefits: np.array
    :return: The Theil T Index.
    :rtype: float
    """
    return _get_generalized_entropy_index(
        benefits=benefits, alpha=1.0, use_abs_val=True
    )


def get_theil_l_index(benefits: np.array) -> float:
    """
    Returns Theil L Index, a measure of income inequality that is
    more sensitive to differences at the lower end of the distribution.
    https://en.wikipedia.org/wiki/Theil_index

    :param benefits: The probabilities of each feature value combination
        occurring in the data.
    :type benefits: np.array
    :return: The Theil L Index.
    :rtype: float
    """
    return _get_generalized_entropy_index(
        benefits=benefits, alpha=0.0, use_abs_val=True
    )


class AggregateBalanceMeasures(BalanceMeasures):
    """
    This class computes a set of aggregated balance measures that represents
    how balanced the given dataset is along the given columns of interest.
    """

    AGGREGATE_METRICS: Dict[Measures, Callable[[np.array], float]] = {
        Measures.THEIL_L_INDEX: get_theil_l_index,
        Measures.THEIL_T_INDEX: get_theil_t_index,
        Measures.ATKINSON_INDEX: get_atkinson_index,
    }

    def __init__(self, cols_of_interest: List[str]) -> None:
        """
        Construct a AggregateBalanceMeasures class for calculating
        aggregate balance measures on a dataset.

        :param cols_of_interest: The list of columns to compute
            aggregate balance measures on.
        :type cols_of_interest: List[str]
        """
        super().__init__(cols_of_interest=cols_of_interest)

    def measures(self, dataset: pd.DataFrame) -> pd.DataFrame:
        """
        Returns aggregate balance measures for the given dataset and
        columns of interest.

        The following measures are computed:
        * Atkinson Index - https://en.wikipedia.org/wiki/Atkinson_index
        * Theil Index (L and T) - https://en.wikipedia.org/wiki/Theil_index

        :param dataset: The dataset to compute aggregate measures on.
        :type dataset: pd.DataFrame
        :return: A pandas DataFrame that contains the names and values of
            aggregate balance measures for the given dataset and
            columns of interest.
        :rtype: pd.DataFrame
        """
        aggregate_measures_dict = {}
        benefits = (
            dataset.groupby(self.cols_of_interest).size() / dataset.shape[0]
        )

        for measure, func in self.AGGREGATE_METRICS.items():
            aggregate_measures_dict[measure.value] = [func(benefits)]

        aggregate_measures = pd.DataFrame.from_dict(aggregate_measures_dict)
        return aggregate_measures
