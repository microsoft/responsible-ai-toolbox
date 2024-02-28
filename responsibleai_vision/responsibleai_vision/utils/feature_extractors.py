# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the feature extractors."""

import warnings
from typing import Optional

import pandas as pd
from PIL import ExifTags, Image
from PIL.ExifTags import TAGS
from PIL.TiffImagePlugin import IFDRational
from tqdm import tqdm

from responsibleai.feature_metadata import FeatureMetadata
from responsibleai_vision.common.constants import (ExtractedFeatures,
                                                   ImageColumns)
from responsibleai_vision.utils.image_reader import (
    IFD_CODE_LOOKUP, get_all_exif_feature_names, get_image_from_path,
    get_image_pointer_from_path)

MEAN_PIXEL_VALUE = ExtractedFeatures.MEAN_PIXEL_VALUE.value
MAX_CUSTOM_LEN = 100
IMAGE_DETAILS = ImageColumns.IMAGE_DETAILS.value


def extract_features(image_dataset: pd.DataFrame,
                     target_column: str,
                     image_mode: str = None,
                     feature_metadata: Optional[FeatureMetadata] = None):
    '''Extract tabular data features from the image dataset.

    :param image_dataset: A pandas dataframe containing the image data.
    :type image_dataset: pandas.DataFrame
    :param target_column: The name of the label column or list of columns.
        This is a list of columns for multilabel models.
    :type target_column: str or list[str]
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
    if not feature_metadata:
        feature_metadata = FeatureMetadata()
    if feature_metadata.categorical_features is None:
        feature_metadata.categorical_features = []
    exif_feature_names = get_all_exif_feature_names(image_dataset)
    feature_names = [MEAN_PIXEL_VALUE] + exif_feature_names

    # append all feature names other than target column and label
    column_names = image_dataset.columns
    has_dropped_features = dropped_features is not None
    start_meta_index = 2
    if isinstance(target_column, list):
        start_meta_index = len(target_column) + 1
    if IMAGE_DETAILS in column_names:
        start_meta_index += 1
    for j in range(start_meta_index, image_dataset.shape[1]):
        if has_dropped_features and column_names[j] in dropped_features:
            continue
        feature_names.append(column_names[j])

    blacklisted_tags = {}
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

        append_exif_features(image, row_feature_values, feature_names,
                             blacklisted_tags, feature_metadata)

        # append all features other than target column and label
        for j in range(start_meta_index, image_dataset.shape[1]):
            if has_dropped_features and column_names[j] in dropped_features:
                continue
            row_feature_values.append(image_dataset.iloc[i, j])
        results.append(row_feature_values)
    return results, feature_names


def process_data(data,
                 tag,
                 feature_names,
                 feature_metadata,
                 row_feature_values,
                 blacklisted_tags):
    if isinstance(data, IFDRational):
        data = data.numerator / data.denominator
    if isinstance(data, (str, int, float)):
        if tag in feature_names:
            if tag not in feature_metadata.categorical_features:
                feature_metadata.categorical_features.append(tag)
            row_feature_values[feature_names.index(tag)] = data
        elif tag not in blacklisted_tags:
            blacklisted_tags.add(tag)
            warnings.warn(
                f'Exif tag {tag} could not be found '
                'in the feature names. Ignoring tag '
                'from extracted metadata.')


def append_exif_features(image,
                         row_feature_values,
                         feature_names,
                         blacklisted_tags,
                         feature_metadata):
    if isinstance(image, str):
        image_pointer_path = get_image_pointer_from_path(image)
        with Image.open(image_pointer_path) as im:
            exifdata = im.getexif()
            for tag_id in exifdata:
                if tag_id in IFD_CODE_LOOKUP:
                    ifd_data = exifdata.get_ifd(tag_id)
                    for nested_tag_id, data in ifd_data.items():
                        tag = ExifTags.GPSTAGS.get(nested_tag_id, None) \
                            or ExifTags.TAGS.get(nested_tag_id, None) \
                            or nested_tag_id
                        process_data(data, tag, feature_names,
                                     feature_metadata, row_feature_values,
                                     blacklisted_tags)
                else:
                    tag = str(TAGS.get(tag_id, tag_id))
                    data = exifdata.get(tag_id)
                    process_data(data, tag, feature_names, feature_metadata,
                                 row_feature_values, blacklisted_tags)
