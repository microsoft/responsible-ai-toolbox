# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


class UserErrorException(Exception):
    """Exception raised when the user has made an error like
    configuration error.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = "User Error"


class SystemErrorException(Exception):
    """Exception raised when there is an system error condition
    which is outside the control of the user.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = "System Error"


class DuplicateManagerConfigException(UserErrorException):
    """An exception indicating that a duplicate configuration
    was detected in any of the RAI managers.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Duplicate RAI configuration detected'


class UserConfigValidationException(UserErrorException):
    """An exception indicating that some user configuration is not valid.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Invalid config'


class ConfigAndResultMismatchException(SystemErrorException):
    """An exception indicating that number of configuration and
       results are different.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Config and result mismatch'


class SchemaErrorException(SystemErrorException):
    """An exception indicating that the schema of the RAI
    component has some error or is not supported.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Schema Error'
