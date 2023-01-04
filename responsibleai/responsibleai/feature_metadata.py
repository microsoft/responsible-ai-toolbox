# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import warnings
from typing import Any, Dict, List, Optional

from responsibleai.exceptions import UserConfigValidationException


class FeatureMetadata:
    def __init__(self, identity_feature_name: Optional[str] = None,
                 datetime_features: Optional[List[str]] = None,
                 categorical_features: Optional[List[str]] = None,
                 dropped_features: Optional[List[str]] = None):
        """Placeholder class for feature metadata provided by the user.

        :param identity_feature_name: Name of the feature which helps to
                                      uniquely identify a row or instance
                                      in user input dataset.
        :type identity_feature_name: Optional[str]
        :param datetime_features: List of datetime features in the
                                  user input dataset.
        :type datetime_features: Optional[List[str]]
        :param categorical_features: List of categorical features in the
                                     user input dataset.
        :type categorical_features: Optional[List[str]]
        :param dropped_features: List of features that were dropped by the
                                 the user during training of their model.
        :type dropped_features: Optional[List[str]]
        """
        self.identity_feature_name = identity_feature_name
        self.datetime_features = datetime_features
        self.categorical_features = categorical_features
        self.dropped_features = dropped_features
        if self.datetime_features is not None:
            warnings.warn('datetime_features are not in use currently.')
        if self.categorical_features is not None:
            warnings.warn('categorical_features are not in use currently.')

    def validate_feature_metadata_with_user_features(
            self, user_features: Optional[List[str]] = None):
        """Validate the feature metadata with the user features.

        :param user_features: List of features in the user input dataset.
        :type user_features: Optional[List[str]]
        """
        if user_features is None:
            return
        if self.identity_feature_name is not None:
            if self.identity_feature_name not in user_features:
                raise UserConfigValidationException(
                    'The given identity feature name {0} is not present'
                    ' in user features.'.format(
                        self.identity_feature_name))

    def to_dict(self) -> Dict[str, Any]:
        """Convert the feature metadata to a dictionary.

        :return: Dictionary of feature metadata.
        :rtype: Dict[str, Any]
        """
        return {
            'identity_feature_name': self.identity_feature_name,
            'datetime_features': self.datetime_features,
            'categorical_features': self.categorical_features,
            'dropped_features': self.dropped_features
        }

    def __eq__(self, other_feature_metadata) -> bool:
        """Compare the feature metadata with another feature metadata.

        :param other_feature_metadata: Feature metadata to compare with.
        :type other_feature_metadata: FeatureMetadata
        :return: True if the feature metadata is equal to the other feature
                 metadata.
        :rtype: bool
        """
        return self.identity_feature_name == \
            other_feature_metadata.identity_feature_name and \
            self.datetime_features == \
            other_feature_metadata.datetime_features and \
            self.categorical_features == \
            other_feature_metadata.categorical_features and \
            self.dropped_features == \
            other_feature_metadata.dropped_features
