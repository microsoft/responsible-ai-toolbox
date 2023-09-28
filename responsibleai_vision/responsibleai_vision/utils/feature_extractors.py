# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the feature extractors."""

from typing import Optional

import pandas as pd
from PIL import Image
from PIL.ExifTags import TAGS
from tqdm import tqdm

from responsibleai.feature_metadata import FeatureMetadata
from responsibleai_vision.utils.image_reader import (
    get_all_exif_feature_names, get_image_from_path,
    get_image_pointer_from_path)


def extract_features(image_dataset: pd.DataFrame,
                     target_column: str, task_type: str,
                     image_mode: str = None,
                     feature_metadata: Optional[FeatureMetadata] = None):
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
    :param feature_metadata: Feature metadata for the dataset
        to identify different kinds of features.
    :type feature_metadata: Optional[FeatureMetadata]
    :return: The list of extracted features and the feature names.
    :rtype: list, list
    '''
    results = []
    dropped_features = feature_metadata.dropped_features \
        if feature_metadata else None
    if feature_metadata and feature_metadata.categorical_features is None:
        feature_metadata.categorical_features = []
    exif_feature_names = get_all_exif_feature_names(image_dataset)
    feature_names = ["mean_pixel_value"] + exif_feature_names

    # append all feature names other than target column and label
    column_names = image_dataset.columns
    has_dropped_features = dropped_features is not None
    start_meta_index = 2
    if isinstance(target_column, list):
        start_meta_index = len(target_column) + 1
    for j in range(start_meta_index, image_dataset.shape[1]):
        if has_dropped_features and column_names[j] in dropped_features:
            continue
        feature_names.append(column_names[j])

    # append all features
    for i in tqdm(range(image_dataset.shape[0])):
        image = image_dataset.iloc[i, 0]
        if isinstance(image, str):
            image_arr = get_image_from_path(image, image_mode)
            mean_pixel_value = image_arr.mean()
        else:
            mean_pixel_value = image.mean()
        row_feature_values = [mean_pixel_value] + \
            [None] * len(exif_feature_names)

        # append all exif features
        if isinstance(image, str):
            image_pointer_path = get_image_pointer_from_path(image)
            with Image.open(image_pointer_path) as im:
                exifdata = im.getexif()
                for tag_id in exifdata:
                    # get the tag name, instead of human unreadable tag id
                    tag = TAGS.get(tag_id, tag_id)
                    data = exifdata.get(tag_id)
                    # decode bytes
                    if isinstance(data, bytes):
                        data = data.decode()
                    if isinstance(data, str):
                        feature_metadata.categorical_features.append(str(tag))
                        row_feature_values[feature_names.index(tag)] = data
                    elif isinstance(data, int) or isinstance(data, float):
                        row_feature_values[feature_names.index(tag)] = data

        # append all features other than target column and label
        for j in range(start_meta_index, image_dataset.shape[1]):
            if has_dropped_features and column_names[j] in dropped_features:
                continue
            row_feature_values.append(image_dataset.iloc[i, j])
        results.append(row_feature_values)
    return results, feature_names
