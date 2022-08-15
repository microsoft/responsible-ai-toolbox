# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from typing import Callable, Dict, List

import numpy as np
import pandas as pd
import scipy

from responsibleai.databalanceanalysis.balance_measures import BalanceMeasures
from responsibleai.databalanceanalysis.constants import Constants, Measures


def get_cross_entropy(obs: np.array, ref: np.array) -> float:
    """
    Returns the cross entropy between two probability distributions.
    https://en.wikipedia.org/wiki/Cross_entropy

    :param obs: The observed probability distribution.
    :type obs: np.array
    :param ref: The reference probability distribution.
    :type ref: np.array
    :return: The cross entropy between the two probability distributions.
    :rtype: float
    """
    return -np.sum(ref * np.log2(obs))


def get_kl_divergence(obs: np.array, ref: np.array) -> float:
    """
    Returns the Kullback-Leibler (KL) divergence, a measure of how one
    probability distribution is different from another.
    https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence

    :param obs: The observed probability distribution.
    :type obs: np.array
    :param ref: The reference probability distribution.
    :type ref: np.array
    :return: The KL divergence between the two probability distributions.
    :rtype: float
    """
    return scipy.stats.entropy(obs, qk=ref)


def get_js_distance(obs: np.array, ref: np.array) -> float:
    """
    Returns the Jenson-Shannon Distance, a measure that is the
    symmetrized and smoothed version of the KL divergence.
    https://en.wikipedia.org/wiki/Jensen%E2%80%93Shannon_divergence

    :param obs: The observed probability distribution.
    :type obs: np.array
    :param ref: The reference probability distribution.
    :type ref: np.array
    :return: The JS Distance between the two probability distributions.
    :rtype: float
    """
    avg = (obs + ref) / 2
    divergence = (
        scipy.stats.entropy(obs, avg) + scipy.stats.entropy(ref, avg)
    ) / 2
    distance = np.sqrt(divergence)
    return distance


def get_ws_distance(obs: np.array, ref: np.array) -> float:
    """
    Returns the Wasserstein Distance, a measure that symbolizes the
    minimum cost to turn one probability distribution into another.
    https://en.wikipedia.org/wiki/Wasserstein_metric

    :param obs: The observed probability distribution.
    :type obs: np.array
    :param ref: The reference probability distribution.
    :type ref: np.array
    :return: The Wasserstein Distance between the two probability
        distributions.
    :rtype: float
    """
    return scipy.stats.wasserstein_distance(obs, ref)


def get_inf_norm_dist(obs: np.array, ref: np.array) -> float:
    """
    Returns the Infinity norm distance (AKA the Chebyshev distance),
    a measure of the maximum absolute difference between two probability
    distributions.
    https://en.wikipedia.org/wiki/Chebyshev_distance

    :param obs: The observed probability distribution.
    :type obs: np.array
    :param ref: The reference probability distribution.
    :type ref: np.array
    :return: The Infinity norm distance between the two probability
        distributions.
    :rtype: float
    """
    return scipy.spatial.distance.chebyshev(obs, ref)


def get_total_var_dist(obs: np.array, ref: np.array) -> float:
    """
    Returns the total variation distance, a measure similar to the KL
    divergence in specifying the distance between two probability
    distributions.
    https://en.wikipedia.org/wiki/Total_variation_distance_of_probability_measures

    :param obs: The observed probability distribution.
    :type obs: np.array
    :param ref: The reference probability distribution.
    :type ref: np.array
    :return: The total variation distance between the two probability
        distributions.
    :rtype: float
    """
    return 0.5 * np.sum(np.abs(obs - ref))


def get_chisq_statistic(f_obs: np.array, f_ref: np.array) -> float:
    """
    Returns the Chi-Square test statistic, a measure that determines the
    statistical significant difference between two frequencies.
    https://en.wikipedia.org/wiki/Chi-squared_test

    :param f_obs: Frequencies of the observed probability distribution.
    :type f_obs: np.array
    :param f_ref: Frequencies of the reference probability distribution.
    :type f_ref: np.array
    :return: The Chi-Square test statistic between the frequencies of the
        two probability distributions.
    :rtype: float
    """
    res = scipy.stats.chisquare(f_obs, f_ref)
    chisq: float = res[0]
    return chisq


def get_chisq_pvalue(f_obs: np.array, f_ref: np.array) -> float:
    """
    Returns the p-value of the Chi-Square, which is the probability of
    obtaining test results at least as extreme as the observed results.
    A small p-value means that the observed results are very unlikely
    under the null hypothesis (i.e. the distributions are the same).
    https://en.wikipedia.org/wiki/Chi-squared_test

    :param f_obs: Frequencies of the observed probability distribution.
    :type f_obs: np.array
    :param f_ref: Frequencies of the reference probability distribution.
    :type f_ref: np.array
    :return: The p-value of the Chi-Square test statistic between the
        frequencies of the two probability distributions.
    :rtype: float
    """
    res = scipy.stats.chisquare(f_obs, f_ref)
    pvalue: float = res[1]
    return pvalue


class DistributionBalanceMeasures(BalanceMeasures):
    """
    This class computes data balance measures for columns of interest
    based on a reference distribution. Currently, only the uniform reference
    distribution is supported.
    """

    DISTRIBUTION_METRICS: Dict[
        Measures, Callable[[np.array, np.array], float]
    ] = {
        Measures.KL_DIVERGENCE: get_kl_divergence,
        Measures.JS_DISTANCE: get_js_distance,
        Measures.WS_DISTANCE: get_ws_distance,
        Measures.INF_NORM_DIST: get_inf_norm_dist,
        Measures.TOTAL_VAR_DIST: get_total_var_dist,
        Measures.CHISQ_PVALUE: get_chisq_pvalue,
        Measures.CHISQ_STATISTIC: get_chisq_statistic,
        Measures.CROSS_ENTROPY: get_cross_entropy,
    }

    def __init__(self, cols_of_interest: List[str]) -> None:
        """
        Construct a DistributionBalanceMeasure class for calculating
        distribution balance measures on a dataset.

        :param cols_of_interest: The list of columns to compute
            distribution balance measures on.
        :type cols_of_interest: List[str]
        """
        super().__init__(cols_of_interest=cols_of_interest)

    def measures(self, dataset: pd.DataFrame) -> pd.DataFrame:
        """
        Returns distribution balance measures for the given dataset and
        columns of interest.

        The following measures are computed:
        * Kullback-Leibler Divergence -
            https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence
        * Jensen-Shannon Distance -
            https://en.wikipedia.org/wiki/Jensen%E2%80%93Shannon_divergence
        * Wasserstein Distance -
            https://en.wikipedia.org/wiki/Wasserstein_metric
        * Infinity Norm Distance -
            https://en.wikipedia.org/wiki/Chebyshev_distance
        * Total Variation Distance -
            https://en.wikipedia.org/wiki/Total_variation_distance_of_probability_measures
        * Chi-Squared Test -
            https://en.wikipedia.org/wiki/Chi-squared_test
        * Cross Entropy -
            https://en.wikipedia.org/wiki/Cross_entropy

        :param dataset: The dataset to compute distribution measures on.
        :type dataset: pd.DataFrame
        :return: A pandas DataFrame that contains the given
            columns of interest and for each column of interest,
            a `dict` of <measure name, measure value> pairs.
        :rtype: pd.DataFrame
        """
        all_measures = [
            DistributionBalanceMeasures._get_distribution_measures_for_col(
                df=dataset, col_of_interest=col
            )
            for col in self.cols_of_interest
        ]
        return pd.DataFrame.from_dict(all_measures)

    @staticmethod
    def _get_distribution_measures_for_col(
        df: pd.DataFrame, col_of_interest: str
    ) -> Dict[Measures, float]:
        """
        Returns a dictionary of distribution balance measures based on the
        given dataset and column of interest.

        :param df: The dataset to compute distribution measures on.
        :type df: pd.DataFrame
        :param col_of_interest: The column of interest to compute
            distribution measures on.
        :type col_of_interest: str
        :return: A `dict` of <measure name, measure value> pairs.
        :rtype: Dict[Measures, float]
        """
        f_obs = df.groupby(col_of_interest).size().reset_index(name="count")
        sum_obs = f_obs["count"].sum()
        obs = f_obs["count"] / sum_obs
        ref = DistributionBalanceMeasures._create_reference_distribution(
            n=f_obs.shape[0]
        )
        f_ref = ref * sum_obs

        measures = {Constants.FEATURE_NAME.value: col_of_interest}
        for (
            measure,
            func,
        ) in DistributionBalanceMeasures.DISTRIBUTION_METRICS.items():
            if measure in [Measures.CHISQ_PVALUE, Measures.CHISQ_STATISTIC]:
                measures[measure.value] = func(f_obs["count"], f_ref)
            else:
                measures[measure.value] = func(obs, ref)

        return measures

    @staticmethod
    def _create_reference_distribution(n: int) -> np.array:
        """
        Returns a reference distribution based on `n` outcomes.
        For now, this is a uniform distribution.

        :param n: The number of outcomes.
        :type n: int
        :return: The reference distribution.
        :rtype: numpy.ndarray
        """
        uniform_val: float = 1.0 / n
        return np.ones(n) * uniform_val
