# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

_ErrorReportVersion = '1.0'
_AllVersions = [_ErrorReportVersion]


def json_converter(obj):
    """Helper function to convert ErrorReport object to json.

    :param obj: Object to convert to json.
    :type obj: object
    :return: The converted json.
    :rtype: dict
    """
    if isinstance(obj, ErrorReport):
        rdict = obj.__dict__
        return rdict
    try:
        return obj.to_json()
    except AttributeError:
        return obj.__dict__


def as_error_report(json_dict):
    """Helper function to convert json to an ErrorReport object.

    :param json_dict: The json to convert.
    :type json_dict: dict
    :return: The converted ErrorReport.
    :rtype: ErrorReport
    """
    if 'metadata' in json_dict:
        version = json_dict['metadata'].get('version')
        if version is None:
            raise ValueError("No version field in the json input")
        elif version not in _AllVersions:
            raise ValueError(
                "Unknown version in read ErrorReport: {}".format(version))
        return ErrorReport(json_dict["json_tree"], json_dict["json_matrix"])
    else:
        return json_dict


class ErrorReport(object):

    """Defines the ErrorReport, which contains the tree and matrix filter.

    :param json_tree: The json representation of the tree.
    :type json_tree: dict
    :param json_matrix: The json representation of the matrix filter.
    :type json_matrix: dict
    """

    def __init__(self, json_tree, json_matrix):
        """Defines the ErrorReport, which contains the tree and matrix filter.

        :param json_tree: The json representation of the tree.
        :type json_tree: dict
        :param json_matrix: The json representation of the matrix filter.
        :type json_matrix: dict
        """
        self._json_tree = json_tree
        self._json_matrix = json_matrix
        self._metadata = {'version': _ErrorReportVersion}

    @property
    def __dict__(self):
        """Returns the dictionary representation of the Error Report.

        The dictionary contains the json representation of the tree,
        the matrix filter and any Error Report metadata.

        :return: The dictionary representation of the Error Report.
        :rtype: dict
        """
        return {'json_tree': self._json_tree,
                'json_matrix': self._json_matrix,
                'metadata': self._metadata}

    @property
    def json_tree(self):
        """Returns the json representation of the tree.

        :return: The json representation of the tree.
        :rtype: dict
        """
        return self._json_tree

    @property
    def json_matrix(self):
        """Returns the json representation of the matrix filter.

        :return: The json representation of the matrix filter.
        :rtype: dict
        """
        return self._json_matrix

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
