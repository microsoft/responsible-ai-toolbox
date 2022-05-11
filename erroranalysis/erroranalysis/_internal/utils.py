# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import random

import numpy as np

try:
    import pyspark.pandas as ps
    spark_available = True
except ImportError:
    spark_available = False
    pass


def generate_random_unique_indexes(count, nnz):
    """Utility to generate a list of random unique indexes in memory.

    Uses Knuth's n of k algorithm to generate the list in memory.

    :param count: The range of values to choose from.
    :type count: int
    :param nnz: The number of unique values to choose.
    :type nnz: int
    :return: The list of unique indexes of length nnz.
    :rtype: numpy.ndarray
    """
    if nnz > count:
        raise Exception("Knuth n-of-k algorithms requires 0 < n < k")
    indexes = np.zeros(nnz, dtype=int)
    current = 0
    i = 0
    while i < count and current < nnz:
        probability = (nnz - current) / (count - i)
        if random.random() < probability:
            indexes[current] = i
            current += 1
        i += 1
    return indexes


def is_spark(df):
    """Utility to check if a dataframe is a spark dataframe.

    :param df: The dataframe to check.
    :type df: pyspark.sql.dataframe.DataFrame or pandas.DataFrame
    :return: True if the dataframe is a spark dataframe, False otherwise.
    :rtype: bool
    """
    try:
        return spark_available and isinstance(df, ps.frame.DataFrame)
    except Exception:
        return False
