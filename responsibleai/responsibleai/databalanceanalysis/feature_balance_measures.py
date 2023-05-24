# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import itertools
import warnings
from typing import Callable, Dict, List, Tuple

import numpy as np
import pandas as pd
import scipy

from responsibleai.databalanceanalysis.balance_measures import BalanceMeasures
from responsibleai.databalanceanalysis.constants import Constants, Measures


def get_statistical_parity(
    p_pos: float, p_feature: float, p_pos_feature: float, total_count: int
) -> float:
    """
    Returns the Statistical Parity of a feature, a fairness measure which
    states the probability that the feature sees the positive outcome.
    https://en.wikipedia.org/wiki/Fairness_%28machine_learning%29

    :param p_pos: The probability of the positive outcome in the dataset.
    :type p_pos: float
    :param p_feature: The probability of the feature in the dataset.
    :type p_feature: float
    :param p_pos_feature: The probability of the positive outcome and the
        feature in the dataset.
    :type p_pos_feature: float
    :param total_count: The total number of observations in the dataset.
    :type total_count: int
    :return: The Statistical Parity of the feature.
    :rtype: float
    """
    return p_pos_feature / p_feature


def get_point_mutual(
    p_pos: float, p_feature: float, p_pos_feature: float, total_count: int
) -> float:
    """
    Returns the Point Mutual Information of a feature, an entropy measure
    which quantifies the discrepancy between the probability of their
    coincidence given their joint distribution and their individual
    distributions (assuming independence).
    https://en.wikipedia.org/wiki/Pointwise_mutual_information

    :param p_pos: The probability of the positive outcome in the dataset.
    :type p_pos: float
    :param p_feature: The probability of the feature in the dataset.
    :type p_feature: float
    :param p_pos_feature: The probability of the positive outcome and the
        feature in the dataset.
    :type p_pos_feature: float
    :param total_count: The total number of observations in the dataset.
    :type total_count: int
    :return: The Point Mutual Information of the feature.
    :rtype: float
    """
    dp = get_statistical_parity(p_pos, p_feature, p_pos_feature, total_count)
    return -np.inf if dp == 0 else np.log(dp)


def get_sorenson_dice(
    p_pos: float, p_feature: float, p_pos_feature: float, total_count: int
) -> float:
    """
    Returns the Sørensen-Dice coefficient of a feature, an
    intersection-over-union measure used to gauge the similarity between
    two samples. Also known as the F1 score.
    https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient

    :param p_pos: The probability of the positive outcome in the dataset.
    :type p_pos: float
    :param p_feature: The probability of the feature in the dataset.
    :type p_feature: float
    :param p_pos_feature: The probability of the positive outcome and the
        feature in the dataset.
    :type p_pos_feature: float
    :param total_count: The total number of observations in the dataset.
    :type total_count: int
    :return: The Sørensen-Dice coefficient of the feature.
    :rtype: float
    """
    return p_pos_feature / (p_feature + p_pos)


def get_jaccard_index(
    p_pos: float, p_feature: float, p_pos_feature: float, total_count: int
) -> float:
    """
    Returns the Jaccard Index of a feature, an
    intersection-over-union measure used for gauging similarity and
    diversity of sample sets.
    https://en.wikipedia.org/wiki/Jaccard_index

    :param p_pos: The probability of the positive outcome in the dataset.
    :type p_pos: float
    :param p_feature: The probability of the feature in the dataset.
    :type p_feature: float
    :param p_pos_feature: The probability of the positive outcome and the
        feature in the dataset.
    :type p_pos_feature: float
    :param total_count: The total number of observations in the dataset.
    :type total_count: int
    :return: The Jaccard Index of the feature.
    :rtype: float
    """
    return p_pos_feature / (p_feature + p_pos - p_pos_feature)


def get_kr_correlation(
    p_pos: float, p_feature: float, p_pos_feature: float, total_count: int
) -> float:
    """
    Returns the Kendall Rank Correlation of a feature, a correlation
    and statistical test that measures the ordinal association between two
    measured quantities.
    https://en.wikipedia.org/wiki/Kendall_rank_correlation_coefficient

    :param p_pos: The probability of the positive outcome in the dataset.
    :type p_pos: float
    :param p_feature: The probability of the feature in the dataset.
    :type p_feature: float
    :param p_pos_feature: The probability of the positive outcome and the
        feature in the dataset.
    :type p_pos_feature: float
    :param total_count: The total number of observations in the dataset.
    :type total_count: int
    :return: The Kendall Rank Correlation of the feature.
    :rtype: float
    """
    a = np.power(total_count, 2) * (
        1 -
        2 * p_feature -
        2 * p_pos +
        2 * p_pos_feature +
        2 * p_pos * p_feature
    )
    b = total_count * (2 * p_feature + 2 * p_pos - 4 * p_pos_feature - 1)
    c = np.power(total_count, 2) * np.sqrt(
        (p_feature - np.power(p_feature, 2)) * (p_pos - np.power(p_pos, 2))
    )
    return (a + b) / c


def get_log_likelihood_ratio(
    p_pos: float, p_feature: float, p_pos_feature: float, total_count: int
) -> float:
    """
    Returns the Log likelihood ratio of a feature, a correlation
    and statistical test that gives the probability of correctly predicting
    the label in ratio to probability of incorrectly predicting the label.
    https://en.wikipedia.org/wiki/Likelihood_function#Likelihood_ratio

    :param p_pos: The probability of the positive outcome in the dataset.
    :type p_pos: float
    :param p_feature: The probability of the feature in the dataset.
    :type p_feature: float
    :param p_pos_feature: The probability of the positive outcome and the
        feature in the dataset.
    :type p_pos_feature: float
    :param total_count: The total number of observations in the dataset.
    :type total_count: int
    :return: The Log likelihood ratio of the feature.
    :rtype: float
    """
    return -np.inf if p_pos_feature == 0 else np.log(p_pos_feature / p_pos)


def get_ttest_stat(
    p_pos: float, p_feature: float, p_pos_feature: float, total_count: int
) -> float:
    """
    Returns the t-test statistic of a feature, a correlation
    and statistical test that is used to compare the means of two groups
    (pairwise). t-test compares the means of two groups and
    this gets a value to be looked up on t-distribution.
    https://en.wikipedia.org/wiki/Student%27s_t-test

    :param p_pos: The probability of the positive outcome in the dataset.
    :type p_pos: float
    :param p_feature: The probability of the feature in the dataset.
    :type p_feature: float
    :param p_pos_feature: The probability of the positive outcome and the
        feature in the dataset.
    :type p_pos_feature: float
    :param total_count: The total number of observations in the dataset.
    :type total_count: int
    :return: The t-test statistic of the feature.
    :rtype: float
    """
    return (p_pos - (p_feature * p_pos)) / np.sqrt(p_feature * p_pos)


def get_ttest_pvalue(metric: float, num_unique_vals: int) -> float:
    """
    Returns the t-test p-value. Once the t-test statistic and degrees
    of freedom are determined, the p-value can be found using a table
    of values from the t-distribution.
    https://en.wikipedia.org/wiki/Student%27s_t-test

    :param metric: The t-test statistic of the feature.
    :type metric: float
    :param num_unique_vals: The number of unique values in the feature.
    :type num_unique_vals: int
    :return: The t-test p-value of the feature.
    :rtype: float
    """
    t_statistic = metric
    dof = num_unique_vals - 1
    return scipy.stats.t.sf(abs(t_statistic), dof)


class FeatureBalanceMeasures(BalanceMeasures):
    """
    This class computes a set of feature balance measures that allow us to see
    whether each combination of a feature is receiving the positive outcome
    (true prediction) at balanced probability.
    """

    CLASS_A = "ClassA"
    CLASS_B = "ClassB"
    PROB_POSITIVE = "p_pos"
    PROB_FEATURE = "p_feature"
    PROB_POS_FEATURE = "p_pos_feature"

    FEATURE_METRICS: Dict[
        Measures, Callable[[float, float, float, int], float]
    ] = {
        Measures.STATISTICAL_PARITY: get_statistical_parity,
        Measures.POINTWISE_MUTUAL_INFO: get_point_mutual,
        Measures.SD_COEF: get_sorenson_dice,
        Measures.JACCARD_INDEX: get_jaccard_index,
        Measures.KR_CORRELATION: get_kr_correlation,
        Measures.LOG_LIKELIHOOD: get_log_likelihood_ratio,
        Measures.TTEST: get_ttest_stat,
    }

    OVERALL_METRICS: Dict[
        Tuple[Measures, Measures], Callable[[float, int], float]
    ] = {
        (
            Measures.TTEST_PVALUE,
            Measures.TTEST,
        ): get_ttest_pvalue,
    }

    def __init__(
        self, cols_of_interest: List[str], label_col: str, pos_label: str
    ) -> None:
        """
        Construct a FeatureBalanceMeasures class for calculating
        feature balance measures on a dataset.

        :param cols_of_interest: The list of columns to compute
            feature balance measures on.
        :type cols_of_interest: List[str]
        :param label_col: The name of the label column.
        :type label_col: str
        :param pos_label: The label value that denotes a positive label.
        :type pos_label: str
        """
        super().__init__(cols_of_interest=cols_of_interest)
        self.label_col = label_col
        self.pos_label = pos_label

    def measures(self, dataset: pd.DataFrame) -> pd.DataFrame:
        """
        Returns feature balance measures for the given dataset,
        columns of interest, and label column.

        The following measures are computed:
        * Statistical Parity -
            https://en.wikipedia.org/wiki/Fairness_%28machine_learning%29
        * Pointwise Mutual Information -
            https://en.wikipedia.org/wiki/Pointwise_mutual_information
        * Sorensen-Dice Coefficient -
            https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
        * Jaccard Index -
            https://en.wikipedia.org/wiki/Jaccard_index
        * Kendall Rank Correlation -
            https://en.wikipedia.org/wiki/Kendall_rank_correlation_coefficient
        * Log-Likelihood Ratio -
            https://en.wikipedia.org/wiki/Likelihood_function#Likelihood_ratio
        * t-test -
            https://en.wikipedia.org/wiki/Student%27s_t-test

        :param dataset: The dataset to compute the measures on.
        :type df: pd.DataFrame
        :return: A pandas DataFrame that contains four columns and has the
            format: <Feature Name>, <Class A value>, <Class B value>, <dict of
            measure name -> measure value key-value pairs>
        :rtype: pd.DataFrame
        """
        feature_balance_measures = [
            FeatureBalanceMeasures._get_measure_gaps_for_col(
                df=dataset,
                col_of_interest=col,
                label_col=self.label_col,
                pos_label=self.pos_label,
            )
            for col in self.cols_of_interest
        ]
        return pd.concat(feature_balance_measures)

    @staticmethod
    def _get_measure_gaps_for_col(
        df: pd.DataFrame, col_of_interest: str, label_col: str, pos_label: str
    ) -> pd.DataFrame:
        """
        For the column of interest, computes "gaps" between two classes
        (feature values) for every combination of values in the column.
        Returns a dataframe that contains as many rows as there are unique
        combinations in the column of interest and for each row, the
        two feature values being compared and a dictionary of measure values.

        :param df: The dataset to compute gaps between feature values on.
        :type df: pd.DataFrame
        :param col_of_interest: The column of interest to compute gaps between
            feature values on.
        :type col_of_interest: str
        :param label_col: The name of the label column.
        :type label_col: str
        :param pos_label: The label value that denotes a positive label.
        :type pos_label: str
        :return: A dataframe that contains four columns.
        :rtype: pd.DataFrame
        """
        unique_vals = df[col_of_interest].unique()

        if unique_vals.size < 2:
            warnings.warn((f"Column '{col_of_interest}' has less than 2"
                           " unique values, so feature balance measures for"
                           f" {label_col}=={pos_label} are not being computed"
                           " for this column."))
            return pd.DataFrame()

        # create list of tuples of the pairings of classes
        pairs = list(itertools.combinations(unique_vals, 2))
        gap_df = pd.DataFrame(
            pairs,
            columns=[
                FeatureBalanceMeasures.CLASS_A,
                FeatureBalanceMeasures.CLASS_B,
            ],
        )
        gap_df[Constants.FEATURE_NAME.value] = col_of_interest

        metrics_df = FeatureBalanceMeasures._get_individual_measures(
            df=df,
            col_of_interest=col_of_interest,
            label_col=label_col,
            pos_label=pos_label,
        )

        for measure in FeatureBalanceMeasures.FEATURE_METRICS.keys():
            classA_metric = gap_df[FeatureBalanceMeasures.CLASS_A].apply(
                lambda row: metrics_df.loc[row]
            )[measure.value]
            classB_metric = gap_df[FeatureBalanceMeasures.CLASS_B].apply(
                lambda row: metrics_df.loc[row]
            )[measure.value]
            gap_df[measure.value] = classA_metric - classB_metric

        # For overall stats
        for (
            measure,
            test_stat,
        ), func in FeatureBalanceMeasures.OVERALL_METRICS.items():
            gap_df[measure.value] = gap_df[test_stat.value].apply(
                lambda row: func(row, len(unique_vals))
            )

        return gap_df

    @staticmethod
    def _get_individual_measures(
        df: pd.DataFrame, col_of_interest: str, label_col: str, pos_label: str
    ):
        """
        For the column of interest, computes the individual feature balance
        measures for every unique value in the column. These measures are
        used to compute "gaps" between two classes (feature values).

        :param df: The df to compute individual feature balance
            measures on.
        :type df: pd.DataFrame
        :param col_of_interest: The column of interest to compute the
            individual feature balance measures on.
        :type col_of_interest: str
        :param label_col: The name of the label column.
        :type label_col: str
        :param pos_label: The label value that denotes a positive label.
        :type pos_label: str
        :return: A dataframe that contains individual feature balance measures.
        :rtype: pd.DataFrame
        """
        num_rows = df.shape[0]

        p_feature_col = (
            df[col_of_interest]
            .value_counts()
            .rename(FeatureBalanceMeasures.PROB_FEATURE) / num_rows
        )
        p_pos_feature_col = (
            df[
                df[label_col].astype("str") == str(pos_label)
            ][col_of_interest]
            .value_counts()
            .rename(FeatureBalanceMeasures.PROB_POS_FEATURE) / num_rows
        ).fillna(0)

        new_df = pd.concat([p_feature_col, p_pos_feature_col], axis=1)
        new_df[FeatureBalanceMeasures.PROB_POSITIVE] = (
            df[
                df[label_col].astype("str") == str(pos_label)
            ].shape[0] / num_rows
        )

        for measure, func in FeatureBalanceMeasures.FEATURE_METRICS.items():
            new_df[measure.value] = new_df.apply(
                lambda row: func(
                    row[FeatureBalanceMeasures.PROB_POSITIVE],
                    row[FeatureBalanceMeasures.PROB_FEATURE],
                    row[FeatureBalanceMeasures.PROB_POS_FEATURE],
                    num_rows,
                ),
                axis=1,
            )

        return new_df
