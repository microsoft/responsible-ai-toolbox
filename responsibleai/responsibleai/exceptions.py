# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


class DuplicateManagerConfigException(Exception):
    """An exception indicating that a duplicate configuration
    was detected in any of the RAI managers.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Duplicate RAI configuration detected.'


class UserConfigValidationException(Exception):
    """An exception indicating that some user configuration is not valid.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Invalid config'


class ConfigAndResultMismatchException(Exception):
    """An exception indicating that number of configuration and
       results are different.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Config and result mismatch'


class SchemaErrorException(Exception):
    """An exception indicating that the schema of the RAI
    component has some error or is not supported.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Schema Error'
