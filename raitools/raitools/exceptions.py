# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


class DuplicateCounterfactualConfigException(Exception):
    """An exception indicating that a duplicate counterfactual configuration
    was detected.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Duplicate counterfactual configuration detected.'


class UserConfigValidationException(Exception):
    """An exception indicating that some user configuration is not valid.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Invalid config'
