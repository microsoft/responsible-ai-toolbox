# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from common_vision_utils import (load_flowers_dataset, load_fridge_dataset,
                                 load_fridge_object_detection_dataset,
                                 load_imagenet_dataset)

from responsibleai_vision.common.constants import (ExtractedFeatures,
                                                   ImageColumns, ImageModes)
from responsibleai_vision.utils.feature_extractors import extract_features

MEAN_PIXEL_VALUE = ExtractedFeatures.MEAN_PIXEL_VALUE.value
FRIDGE_METADATA_FEATURES = [
    'Make', 'ResolutionUnit', 'ImageLength', 'ExifOffset', 'Model',
    'GPSInfo', 'ImageWidth', 'DateTime', 'YCbCrPositioning',
    'Software', 'Orientation'
]


def validate_extracted_features(extracted_features, feature_names,
                                expected_feature_names, data):
    assert len(extracted_features) == len(data)
    assert feature_names[0] == expected_feature_names[0]
    for i in range(1, len(feature_names)):
        assert feature_names[i] in expected_feature_names
    assert len(feature_names) == len(expected_feature_names)
    assert len(extracted_features[0]) == len(feature_names)


def extract_dataset_features(data):
    return extract_features(data, ImageColumns.LABEL, ImageModes.RGB, None)


class TestFeatureExtractors(object):
    def test_extract_features_fridge_object_detection(self):
        data = load_fridge_object_detection_dataset(automl_format=False)
        extracted_features, feature_names = extract_dataset_features(data)
        expected_feature_names = [MEAN_PIXEL_VALUE] + FRIDGE_METADATA_FEATURES
        validate_extracted_features(extracted_features, feature_names,
                                    expected_feature_names, data)

    def test_extract_features_fridge_metadata(self):
        data = load_fridge_dataset()
        extracted_features, feature_names = extract_dataset_features(data)
        expected_feature_names = [MEAN_PIXEL_VALUE] + FRIDGE_METADATA_FEATURES
        validate_extracted_features(extracted_features, feature_names,
                                    expected_feature_names, data)

    def test_extract_features_imagenet_metadata(self):
        data = load_imagenet_dataset()
        extracted_features, feature_names = extract_dataset_features(data)
        expected_feature_names = [MEAN_PIXEL_VALUE]
        validate_extracted_features(extracted_features, feature_names,
                                    expected_feature_names, data)

    def test_extract_features_flowers_metadata(self):
        data = load_flowers_dataset(upscale=False)
        extracted_features, feature_names = extract_dataset_features(data)
        expected_feature_names = [MEAN_PIXEL_VALUE]
        validate_extracted_features(extracted_features, feature_names,
                                    expected_feature_names, data)

    def test_extract_features_mixed_exif_XPComment_metadata(self):
        data = load_fridge_dataset(add_extra_mixed_metadata=True)
        extracted_features, feature_names = extract_dataset_features(data)
        expected_feature_names = [MEAN_PIXEL_VALUE, 'XPComment']
        expected_feature_names += FRIDGE_METADATA_FEATURES
        validate_extracted_features(extracted_features, feature_names,
                                    expected_feature_names, data)
