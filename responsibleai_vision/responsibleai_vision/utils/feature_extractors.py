# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the feature extractors."""

from typing import List, Optional

import pandas as pd
from tqdm import tqdm

from responsibleai_vision.utils.image_reader import get_image_from_path


def extract_features(image_dataset: pd.DataFrame,
                     target_column: str, task_type: str,
                     image_mode: str = None,
                     dropped_features: Optional[List[str]] = None):
    '''Extract tabular data features from the image dataset.

    :param image_dataset: A pandas dataframe containing the image data.
    :type image_dataset: pandas.DataFrame
    :param target_column: The name of the label column or list of columns.
        This is a list of columns for multilabel models.
    :type target_column: str or list[str]
    :param task_type: The type of task to be performed.
    :type task_type: str
    :param image_mode: The mode to open the image in.
        See pillow documentation for all modes:
        https://pillow.readthedocs.io/en/stable/handbook/concepts.html
    :type image_mode: str
    :param dropped_features: The list of features to drop from the dataset.
    :type dropped_features: list[str]
    :return: The list of extracted features and the feature names.
    :rtype: list, list
    '''
    results = []
    feature_names = ["mean_pixel_value"]
    column_names = image_dataset.columns
    has_dropped_features = dropped_features is not None
    start_meta_index = 2
    if isinstance(target_column, list):
        start_meta_index = len(target_column) + 1
    for j in range(start_meta_index, image_dataset.shape[1]):
        if has_dropped_features and column_names[j] in dropped_features:
            continue
        feature_names.append(column_names[j])
    for i in tqdm(range(image_dataset.shape[0])):
        image = image_dataset.iloc[i][0]
        if isinstance(image, str):
            image = get_image_from_path(image, image_mode)
        mean_pixel_value = image.mean()
        row_feature_values = [mean_pixel_value]
        # append all features other than target column and label
        for j in range(start_meta_index, image_dataset.shape[1]):
            if has_dropped_features and column_names[j] in dropped_features:
                continue
            row_feature_values.append(image_dataset.iloc[i][j])
        results.append(row_feature_values)
    return results, feature_names
