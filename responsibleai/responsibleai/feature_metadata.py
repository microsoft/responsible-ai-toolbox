# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from typing import Any, Dict, List, Optional

from responsibleai.exceptions import UserConfigValidationException

_DROPPED_FEATURE_PURPOSE = 'dropped feature'
_CATEGORICAL_FEATURE_PURPOSE = 'categorical feature'
_IDENTITY_FEATURE_PURPOSE = 'identity feature name'
_DATETIME_FEATURE_PURPOSE = 'datetime feature'
_TIME_SERIES_ID_FEATURE_PURPOSE = 'time series ID feature'


class FeatureMetadata:
    def __init__(self,
                 identity_feature_name: Optional[str] = None,
                 datetime_features: Optional[List[str]] = None,
                 categorical_features: Optional[List[str]] = None,
                 dropped_features: Optional[List[str]] = None,
                 time_series_id_features: Optional[List[str]] = None):
        """Placeholder class for feature metadata provided by the user.

        :param identity_feature_name: Name of the feature which helps to
            uniquely identify a row or instance in user input dataset.
        :type identity_feature_name: Optional[str]
        :param datetime_features: Names of datetime features in the user input
            dataset.
        :type datetime_features: Optional[List[str]]
        :param categorical_features: List of categorical features in the
            user input dataset.
        :type categorical_features: Optional[List[str]]
        :param dropped_features: List of features that were dropped by the
            the user during training of their model.
        :type dropped_features: Optional[List[str]]
        :param time_series_id_features: List of features that are used
            to uniquely identify a time series in the user input dataset.
            Time series ID features are only relevant for forecasting, i.e.,
            when the task is 'forecasting'. Specifying time series ID features
            for other tasks will result in validation errors.
        :type time_series_id_features: Optional[List[str]]
        """
        self.identity_feature_name = identity_feature_name
        self.datetime_features = datetime_features
        self.categorical_features = categorical_features
        self.dropped_features = dropped_features
        self.time_series_id_features = time_series_id_features

    def validate_feature_metadata_with_user_features(
            self, feature_names: List[str]):
        """Validate the user-provided feature metadata.

        :param feature_names: list of features in the dataset.
        :type feature_names: List[str]
        """
        identity_feature = ([self.identity_feature_name]
                            if self.identity_feature_name else None)
        self._validate_columns(
            _DROPPED_FEATURE_PURPOSE, self.dropped_features, feature_names)
        self._validate_columns(
            _CATEGORICAL_FEATURE_PURPOSE,
            self.categorical_features, feature_names)
        self._validate_columns(
            _IDENTITY_FEATURE_PURPOSE, identity_feature, feature_names)
        self._validate_columns(
            _DATETIME_FEATURE_PURPOSE, self.datetime_features, feature_names)
        self._validate_columns(
            _TIME_SERIES_ID_FEATURE_PURPOSE, self.time_series_id_features,
            feature_names)

    def to_dict(self) -> Dict[str, Any]:
        """Convert the feature metadata to a dictionary.

        :return: Dictionary of feature metadata.
        :rtype: Dict[str, Any]
        """
        return {
            'identity_feature_name': self.identity_feature_name,
            'datetime_features': self.datetime_features,
            'categorical_features': self.categorical_features,
            'dropped_features': self.dropped_features,
            'time_series_id_features': self.time_series_id_features
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
            other_feature_metadata.dropped_features and \
            self.time_series_id_features == \
            other_feature_metadata.time_series_id_features

    @staticmethod
    def _validate_columns(
            column_purpose: str,
            column_names: List[str],
            feature_names: List[str]):
        """Ensure the provided column is present in the dataset.

        :param column_purpose: The purpose the column fulfills in the dataset.
        :type column_purpose: str
        :param column_names: List of column names to validate.
        :type column_names: List[str]
        :param feature_names: List of features in the input dataset.
        :type feature_names: List[str]
        """
        if column_names is None:
            return
        feature_name_set = set(feature_names)
        for column_name in column_names:
            if column_name not in feature_name_set:
                raise UserConfigValidationException(
                    f'The given {column_purpose} {column_name} is not present '
                    f'in the provided features: {", ".join(feature_names)}.')
