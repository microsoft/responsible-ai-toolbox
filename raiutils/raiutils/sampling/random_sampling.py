# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from typing import Optional

import pandas as pd
from sklearn.model_selection import train_test_split

from raiutils.exceptions import UserConfigValidationException


def generate_random_sample(
        dataset: pd.DataFrame, target_column: str,
        number_samples: int,
        is_classification: Optional[bool] = False) -> pd.DataFrame:

    """
    Pick random samples of data from dataset.

    :param dataset: Input dataset.
    :type X: pd.DataFrame
    :param target_column: The name of the column which may be used in case of
        stratified splitting.
    :type target_column: str
    :param number_samples: The number of intended samples in the sampled data
    :type number_samples: int
    :param is_classification: If this is a classification scenario and we
        should do a stratified split based on the column target_column.
    :type is_classification: bool
    :return: Sub-sample of input dataset
    :rtype: pd.DataFrame
    """
    if not isinstance(dataset, pd.DataFrame):
        raise UserConfigValidationException(
            "Expecting a pandas dataframe for generating a dataset sample.")

    if not isinstance(target_column, str):
        raise UserConfigValidationException(
            "Expecting a string for target_column.")

    if not isinstance(number_samples, int):
        raise UserConfigValidationException(
            "Expecting an integer for number_samples.")

    if not isinstance(is_classification, bool):
        raise UserConfigValidationException(
            "Expecting a boolean for is_classification.")

    if target_column not in dataset.columns.tolist():
        raise UserConfigValidationException(
            "The column {0} is not present in dataset".format(
                target_column))

    if number_samples <= 0:
        raise UserConfigValidationException(
            "The number_samples should be greater than zero.")

    n_samples = len(dataset)
    if n_samples <= number_samples:
        return dataset

    target = dataset[target_column].values
    try:
        stratified_split = target if is_classification else None
        dataset_sampled, _, = train_test_split(
            dataset, train_size=number_samples,
            random_state=777,
            stratify=stratified_split)
    except Exception:
        # in case stratification fails, fall back to non-stratify train/test
        # split
        dataset_sampled, _, = train_test_split(
            dataset, random_state=777, train_size=number_samples)

    return dataset_sampled
