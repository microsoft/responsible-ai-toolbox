# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


class SystemErrorException(Exception):
    """Exception raised when there is an system error condition
    which is outside the control of the user.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = "System Error"


class UserErrorException(Exception):
    """Exception raised when the user has made an error like
    configuration error.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = "User Error"


class UserConfigValidationException(UserErrorException):
    """An exception indicating that some user configuration is not valid.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = 'Invalid config'
