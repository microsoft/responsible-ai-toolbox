# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
from common_vision_utils import (load_clearsight_object_detection_dataset,
                                 load_flowers_dataset, load_fridge_dataset,
                                 load_fridge_object_detection_dataset,
                                 load_imagenet_dataset)

from responsibleai.feature_metadata import FeatureMetadata
from responsibleai_vision.common.constants import (ExtractedFeatures,
                                                   ImageColumns, ImageModes)
from responsibleai_vision.utils.feature_extractors import extract_features

MEAN_PIXEL_VALUE = ExtractedFeatures.MEAN_PIXEL_VALUE.value
FRIDGE_METADATA_FEATURES = [
    'FlashPixVersion', 'WhiteBalance', 'Make', 'ExifImageHeight',
    'ExposureProgram', 'Software', 'CustomRendered', 'Contrast', 'XResolution',
    'GPSTimeStamp', 'Orientation', 'SubjectDistanceRange', 'MakerNote',
    'SubsecTimeDigitized', 'ExifInteroperabilityOffset', 'ColorSpace',
    'BrightnessValue', 'ExifImageWidth', 'SubsecTimeOriginal',
    'YCbCrPositioning', 'ISOSpeedRatings', 'SubsecTime', 'ExposureBiasValue',
    'ComponentsConfiguration', 'ResolutionUnit', 'ImageLength',
    'GPSLatitudeRef', 'ExifVersion', 'Flash', 'ExposureMode', 'ApertureValue',
    'GPSDOP', 'ImageWidth', 'SubjectDistance', 'GPSLongitudeRef', 'FNumber',
    'DigitalZoomRatio', 'FocalLength', 'SceneCaptureType',
    'FocalLengthIn35mmFilm', 'ShutterSpeedValue', 'DateTimeOriginal',
    'Sharpness', 'GPSAltitude', 'GPSLatitude', 'Saturation', 'ExposureTime',
    'GPSLongitude', 'SceneType', 'GPSDateStamp', 'GPSVersionID',
    'GPSAltitudeRef', 'YResolution', 'GPSProcessingMethod', 'DateTime',
    'MeteringMode', 'SensingMethod', 'DateTimeDigitized', 'Model',
    'MaxApertureValue'
]
CLEARSIGHT_METADATA_FEATURES = [
    'FocalLength', 'Make', 'OffsetTimeOriginal', 'FocalPlaneYResolution',
    'ExposureMode', 'LensSerialNumber', 'ApertureValue', 'GPSLatitudeRef',
    'DateTimeDigitized', 'Orientation', 'OffsetTime',
    'FocalPlaneResolutionUnit', 'ExposureProgram', 'ComponentsConfiguration',
    'Flash', 'BodySerialNumber', 'SubsecTimeDigitized', 'CameraOwnerName',
    'SubsecTime', 'ExifInteroperabilityOffset', 'ExposureBiasValue',
    'ISOSpeedRatings', 'SubsecTimeOriginal', 'FNumber', 'WhiteBalance',
    'GPSLatitude', 'XResolution', 'GPSSatellites', 'ShutterSpeedValue',
    'GPSLongitudeRef', 'ExposureTime', 'DigitalZoomRatio', 'MeteringMode',
    'ExifImageHeight', 'GPSTimeStamp', 'LensSpecification', 'Artist',
    'FlashPixVersion', 'YCbCrPositioning', 'SceneCaptureType', 'DateTime',
    'LensModel', 'OffsetTimeDigitized', 'GPSStatus', 'CustomRendered',
    'GPSVersionID', 'SensitivityType', 'DateTimeOriginal', 'Copyright',
    'ColorSpace', 'RecommendedExposureIndex', 'ResolutionUnit', 'GPSAltitude',
    'Model', 'YResolution', 'ExifVersion', 'UserComment',
    'FocalPlaneXResolution', 'GPSAltitudeRef', 'MakerNote', 'GPSMapDatum',
    'GPSLongitude', 'GPSDateStamp', 'ExifImageWidth'
]


def validate_extracted_features(extracted_features, feature_names,
                                expected_feature_names, data,
                                feature_metadata=None):
    assert len(extracted_features) == len(data)
    assert feature_names[0] == expected_feature_names[0]
    for i in range(1, len(feature_names)):
        assert feature_names[i] in expected_feature_names
    assert len(feature_names) == len(expected_feature_names)
    assert len(extracted_features[0]) == len(feature_names)
    if feature_metadata is not None:
        assert len(feature_metadata.categorical_features) <= len(feature_names)
        for categorical_feature in feature_metadata.categorical_features:
            assert categorical_feature in feature_names


def extract_dataset_features(data, feature_metadata=None):
    return extract_features(data, ImageColumns.LABEL, ImageModes.RGB,
                            feature_metadata=feature_metadata)


class TestFeatureExtractors(object):
    @pytest.mark.parametrize("automl_format", [True, False])
    def test_extract_features_fridge_object_detection(self, automl_format):
        data = load_fridge_object_detection_dataset(
            automl_format=automl_format)
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
        feature_metadata = FeatureMetadata()
        extracted_features, feature_names = extract_dataset_features(
            data, feature_metadata=feature_metadata)
        expected_feature_names = [MEAN_PIXEL_VALUE]
        validate_extracted_features(extracted_features, feature_names,
                                    expected_feature_names, data,
                                    feature_metadata)

    def test_extract_features_mixed_exif_XPComment_metadata(self):
        data = load_fridge_dataset(add_extra_mixed_metadata=True)
        feature_metadata = FeatureMetadata()
        extracted_features, feature_names = extract_dataset_features(
            data, feature_metadata=feature_metadata)
        expected_feature_names = [MEAN_PIXEL_VALUE, 'XPComment']
        expected_feature_names += FRIDGE_METADATA_FEATURES
        validate_extracted_features(extracted_features, feature_names,
                                    expected_feature_names, data,
                                    feature_metadata)

    def test_extract_features_clearsight_metadata(self):
        data = load_clearsight_object_detection_dataset()
        feature_metadata = FeatureMetadata()
        extracted_features, feature_names = extract_dataset_features(
            data, feature_metadata=feature_metadata)
        expected_feature_names = [MEAN_PIXEL_VALUE]
        expected_feature_names += CLEARSIGHT_METADATA_FEATURES
        validate_extracted_features(extracted_features, feature_names,
                                    expected_feature_names, data,
                                    feature_metadata)
