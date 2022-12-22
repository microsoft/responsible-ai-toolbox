# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from raiutils.exceptions import (UserConfigValidationException,
                                 UserErrorException)

TEST_MESSAGE = "Test message"


class TestExceptions:
    def _verify_exception_hierarchy(
            self, exception, parent_exception,
            error_code, exception_message):
        assert exception._error_code == error_code
        assert str(exception) == exception_message
        assert isinstance(exception, type(parent_exception))

    def test_user_exceptions(self):
        ucve = UserConfigValidationException(TEST_MESSAGE)
        self._verify_exception_hierarchy(
            ucve, UserErrorException(), 'Invalid config', TEST_MESSAGE)

        uee = UserErrorException(TEST_MESSAGE)
        self._verify_exception_hierarchy(
            uee, UserErrorException(),
            'User Error', TEST_MESSAGE)
