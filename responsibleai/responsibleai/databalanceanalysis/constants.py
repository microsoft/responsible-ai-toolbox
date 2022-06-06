# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum


class Constants(Enum):
    """
    Enum providing general constants that are not measures.
    """

    FEATURE_NAME = "FeatureName"


class Measures(Enum):
    """
    Enum providing the supported data imbalance measures. Its values are used
    to denote dataframe column names, and don't contain spaces
    so that measures can be accessed via dot notation (i.e. `df.measure`).
    """

    # Feature Balance Measures
    STATISTICAL_PARITY = "StatisticalParity"
    POINTWISE_MUTUAL_INFO = "PointwiseMutualInfo"
    SD_COEF = "SorensonDiceCoeff"
    JACCARD_INDEX = "JaccardIndex"
    KR_CORRELATION = "KendallRankCorrelation"
    LOG_LIKELIHOOD = "LogLikelihoodRatio"
    TTEST = "TTest"
    TTEST_PVALUE = "TTestPValue"

    # Aggregate Balance Measures
    ATKINSON_INDEX = "AtkinsonIndex"
    THEIL_L_INDEX = "TheilLIndex"
    THEIL_T_INDEX = "TheilTIndex"

    # Distribution Balance Measures
    CROSS_ENTROPY = "CrossEntropy"
    KL_DIVERGENCE = "KLDivergence"
    JS_DISTANCE = "JensenShannonDist"
    WS_DISTANCE = "WassersteinDist"
    INF_NORM_DIST = "InfiniteNormDist"
    TOTAL_VAR_DIST = "TotalVarianceDist"
    CHISQ_STATISTIC = "ChiSquareStat"
    CHISQ_PVALUE = "ChiSquarePValue"
