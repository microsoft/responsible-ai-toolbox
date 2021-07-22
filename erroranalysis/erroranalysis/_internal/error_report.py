# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import uuid

_ErrorReportVersion = '1.0'
_AllVersions = [_ErrorReportVersion]
_VERSION = 'version'

TREE = 'tree'
MATRIX = 'matrix'
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
        return ErrorReport(error_dict[TREE],
                           error_dict[MATRIX],
                           error_dict[ID])
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

    def __init__(self, tree, matrix, id=None):
        """Defines the ErrorReport, which contains the tree and matrix filter.

        :param tree: The representation of the tree.
        :type tree: dict
        :param matrix: The representation of the matrix filter.
        :type matrix: dict
        :param id: The unique identifier for the ErrorReport.
            A new unique id is created if none is specified.
        :type id: str
        """
        self._id = id or str(uuid.uuid4())
        self._tree = tree
        self._matrix = matrix
        self._metadata = {_VERSION: _ErrorReportVersion}

    @property
    def __dict__(self):
        """Returns the dictionary representation of the Error Report.

        The dictionary contains the representation of the tree,
        the matrix filter and any Error Report metadata.

        :return: The dictionary representation of the Error Report.
        :rtype: dict
        """
        return {TREE: self._tree,
                MATRIX: self._matrix,
                ID: self._id,
                METADATA: self._metadata}

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
