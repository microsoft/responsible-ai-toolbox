# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import uuid

_ErrorReportVersion1 = '1.0'
_ErrorReportVersion2 = '2.0'
_ErrorReportVersion3 = '3.0'
_AllVersions = [_ErrorReportVersion1,
                _ErrorReportVersion2,
                _ErrorReportVersion3]
_VERSION = 'version'

TREE = 'tree'
MATRIX = 'matrix'
TREE_FEATURES = 'tree_features'
MATRIX_FEATURES = 'matrix_features'
IMPORTANCES = 'importances'
ID = 'id'
METADATA = 'metadata'


def json_converter(obj):
    """Helper function to convert ErrorReport object to a dictionary.

    :param obj: Object to convert to a dictionary which can be saved as json.
    :type obj: object
    :return: The converted dictionary which can be saved as json.
    :rtype: dict
    """
    if isinstance(obj, ErrorReport):
        rdict = obj.__dict__
        return rdict
    try:
        return obj.to_json()
    except AttributeError:
        return obj.__dict__


def as_error_report(error_dict):
    """Helper function to convert a dictionary to an ErrorReport object.

    :param error_dict: The dictionary to convert.
    :type error_dict: dict
    :return: The converted ErrorReport.
    :rtype: ErrorReport
    """
    if METADATA in error_dict:
        version = error_dict[METADATA].get(_VERSION)
        if version is None:
            raise ValueError('No version field in the json input')
        elif version not in _AllVersions:
            raise ValueError(
                "Unknown version in read ErrorReport: {}".format(version))
        if version == _ErrorReportVersion1:
            return ErrorReport(error_dict[TREE],
                               error_dict[MATRIX],
                               error_dict[ID])
        elif IMPORTANCES not in error_dict:
            return ErrorReport(error_dict[TREE],
                               error_dict[MATRIX],
                               error_dict[TREE_FEATURES],
                               error_dict[MATRIX_FEATURES],
                               id=error_dict[ID])
        else:
            return ErrorReport(error_dict[TREE],
                               error_dict[MATRIX],
                               error_dict[TREE_FEATURES],
                               error_dict[MATRIX_FEATURES],
                               importances=error_dict[IMPORTANCES],
                               id=error_dict[ID])
    else:
        return error_dict


class ErrorReport(object):

    """Defines the ErrorReport, which contains the tree and matrix filter.

    :param tree: The representation of the tree.
    :type tree: dict
    :param matrix: The representation of the matrix filter.
    :type matrix: dict
    :param id: The unique identifier for the ErrorReport.
        A new unique id is created if none is specified.
    :type id: str
    """

    def __init__(self,
                 tree,
                 matrix,
                 tree_features=None,
                 matrix_features=None,
                 importances=None,
                 id=None):
        """Defines the ErrorReport, which contains the tree and matrix filter.

        :param tree: The representation of the tree.
        :type tree: dict
        :param matrix: The representation of the matrix filter.
        :type matrix: dict
        :param tree_features: The features that were selected to train the
            decision tree on errors.
        :type tree_features: list[str]
        :param matrix_features: The one or two features selected for creating
            the matrix filter (aka heatmap).
        :type matrix_features: list[str]
        :param importances: The feature importances calculated using mutual
            information with the error on the true labels.
        :type importances: list[float]
        :param id: The unique identifier for the ErrorReport.
            A new unique id is created if none is specified.
        :type id: str
        """
        self._id = id or str(uuid.uuid4())
        self._tree = tree
        self._matrix = matrix
        self._tree_features = tree_features
        self._matrix_features = matrix_features
        self._importances = importances
        self._metadata = {_VERSION: _ErrorReportVersion3}

    @property
    def __dict__(self):
        """Returns the dictionary representation of the Error Report.

        The dictionary contains the representation of the tree,
        the matrix filter and any Error Report metadata.

        :return: The dictionary representation of the Error Report.
        :rtype: dict
        """
        error_report_dict = {TREE: self._tree,
                             MATRIX: self._matrix,
                             TREE_FEATURES: self._tree_features,
                             MATRIX_FEATURES: self._matrix_features,
                             ID: self._id,
                             METADATA: self._metadata}
        if self._importances is not None:
            error_report_dict[IMPORTANCES] = self._importances
        return error_report_dict

    @property
    def tree(self):
        """Returns the representation of the tree.

        :return: The representation of the tree.
        :rtype: dict
        """
        return self._tree

    @property
    def matrix(self):
        """Returns the representation of the matrix filter.

        :return: The representation of the matrix filter.
        :rtype: dict
        """
        return self._matrix

    @property
    def tree_features(self):
        """Returns the features that were selected to train tree.

        The features are used to train the surrogate decision
        tree on errors.

        :return: The features selected to train tree.
        :rtype: list[str]
        """
        return self._tree_features

    @property
    def matrix_features(self):
        """Returns the features that were used to create the matrix filter.

        The one or two features are used to create the matrix
        filter (aka heatmap).

        :return: The features selected to create matrix filter.
        :rtype: list[str]
        """
        return self._matrix_features

    @property
    def importances(self):
        """Returns the feature importances for the tree view.

        The feature importances are calculated using mutual
        information with the error on the true labels.

        :return: The feature importances for the tree view
            calculated using mutual information with the error
            on the true labels.
        :rtype: list[float]
        """
        return self._importances

    @property
    def id(self):
        """Returns the unique identifier for this ErrorReport.

        :return: The unique identifier for this ErrorReport.
        :rtype: str
        """
        return self._id

    def to_json(self):
        """Serialize ErrorReport object to json.

        :return: The string json representation of the ErrorReport.
        :rtype: str
        """
        return json.dumps(self, default=json_converter, indent=2)

    @staticmethod
    def from_json(json_str):
        """Deserialize json string to an ErrorReport object.

        :return: The deserialized ErrorReport.
        :rtype: ErrorReport
        """
        return json.loads(json_str, object_hook=as_error_report)
