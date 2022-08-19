# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from responsibleai.exceptions import UserConfigValidationException
from responsibleai.feature_metadata import FeatureMetadata


class TestFeatureMetadata:
    def test_feature_metadata(self):
        feature_metadata = FeatureMetadata()
        assert feature_metadata.identity_feature_name is None
        assert feature_metadata.datetime_features is None
        assert feature_metadata.categorical_features is None
        assert feature_metadata.dropped_features is None

        feature_metadata_dict = feature_metadata.to_dict()
        expected_feature_metadata_dict = {
            'identity_feature_name': None,
            'datetime_features': None,
            'categorical_features': None,
            'dropped_features': None
        }
        assert feature_metadata_dict == expected_feature_metadata_dict

    def test_feature_metadata_with_identity_feature(self):
        feature_metadata = FeatureMetadata(identity_feature_name='id')
        assert feature_metadata.identity_feature_name == 'id'
        assert feature_metadata.datetime_features is None
        assert feature_metadata.categorical_features is None
        assert feature_metadata.dropped_features is None
        with pytest.raises(
                UserConfigValidationException,
                match='The given identity feature name id is not present'
                      ' in user features.'):
            feature_metadata.validate_feature_metadata_with_user_features(
                user_features=['id1', 's1', 's2'])

        feature_metadata_dict = feature_metadata.to_dict()
        expected_feature_metadata_dict = {
            'identity_feature_name': 'id',
            'datetime_features': None,
            'categorical_features': None,
            'dropped_features': None
        }
        assert feature_metadata_dict == expected_feature_metadata_dict

    def test_feature_metadata_with_datetime_features(self):
        with pytest.warns(
                UserWarning,
                match='datetime_features are not in use currently.'):
            feature_metadata = FeatureMetadata(datetime_features=['d1', 'd2'])
        assert feature_metadata.identity_feature_name is None
        assert feature_metadata.datetime_features == ['d1', 'd2']
        assert feature_metadata.categorical_features is None
        assert feature_metadata.dropped_features is None

        feature_metadata_dict = feature_metadata.to_dict()
        expected_feature_metadata_dict = {
            'identity_feature_name': None,
            'datetime_features': ['d1', 'd2'],
            'categorical_features': None,
            'dropped_features': None
        }
        assert feature_metadata_dict == expected_feature_metadata_dict

    def test_feature_metadata_with_categorical_features(self):
        with pytest.warns(
                UserWarning,
                match='categorical_features are not in use currently.'):
            feature_metadata = FeatureMetadata(
                categorical_features=['c1', 'c2'])
        assert feature_metadata.identity_feature_name is None
        assert feature_metadata.datetime_features is None
        assert feature_metadata.categorical_features == ['c1', 'c2']
        assert feature_metadata.dropped_features is None

        feature_metadata_dict = feature_metadata.to_dict()
        expected_feature_metadata_dict = {
            'identity_feature_name': None,
            'datetime_features': None,
            'categorical_features': ['c1', 'c2'],
            'dropped_features': None
        }
        assert feature_metadata_dict == expected_feature_metadata_dict

    def test_feature_metadata_with_dropped_features(self):
        with pytest.warns(
                UserWarning,
                match='dropped_features are not in use currently.'):
            feature_metadata = FeatureMetadata(dropped_features=['d1', 'd2'])
        assert feature_metadata.identity_feature_name is None
        assert feature_metadata.datetime_features is None
        assert feature_metadata.categorical_features is None
        assert feature_metadata.dropped_features == ['d1', 'd2']

        feature_metadata_dict = feature_metadata.to_dict()
        expected_feature_metadata_dict = {
            'identity_feature_name': None,
            'datetime_features': None,
            'categorical_features': None,
            'dropped_features': ['d1', 'd2']
        }
        assert feature_metadata_dict == expected_feature_metadata_dict

    def test_feature_metadata_with_other_feature_metadata(self):
        feature_metadata_1 = FeatureMetadata(
            identity_feature_name='id',
            datetime_features=['d1', 'd2'],
            categorical_features=['c1', 'c2'],
            dropped_features=['d3', 'd4'])

        feature_metadata_2 = FeatureMetadata(
            identity_feature_name='id',
            datetime_features=['d1', 'd2'],
            categorical_features=['c1', 'c2'],
            dropped_features=['d3', 'd4'])

        feature_metadata_3 = FeatureMetadata(
            identity_feature_name='id',
            datetime_features=['d1', 'd2'],
            categorical_features=['c1', 'c2'],
            dropped_features=['d3', 'd5'])

        assert feature_metadata_1 == feature_metadata_2
        assert feature_metadata_1 != feature_metadata_3
