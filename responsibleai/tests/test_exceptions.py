# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


from responsibleai.exceptions import (ConfigAndResultMismatchException,
                                      DuplicateManagerConfigException,
                                      SchemaErrorException,
                                      SystemErrorException,
                                      UserConfigValidationException,
                                      UserErrorException)

TEST_MESSAGE = "Test message"


class TestExceptions:
    def test_user_exceptions(self):
        ucve = UserConfigValidationException(TEST_MESSAGE)
        assert ucve._error_code == 'Invalid config'
        assert str(ucve) == TEST_MESSAGE
        assert isinstance(ucve, UserErrorException)

        de = DuplicateManagerConfigException(TEST_MESSAGE)
        assert de._error_code == 'Duplicate RAI configuration detected.'
        assert str(de) == TEST_MESSAGE
        assert isinstance(de, UserErrorException)

        uee = UserErrorException(TEST_MESSAGE)
        assert uee._error_code == 'User Error'
        assert str(uee) == TEST_MESSAGE
        assert isinstance(uee, UserErrorException)

    def test_system_exceptions(self):
        cerm = ConfigAndResultMismatchException(TEST_MESSAGE)
        assert cerm._error_code == 'Config and result mismatch'
        assert str(cerm) == TEST_MESSAGE
        assert isinstance(cerm, SystemErrorException)

        se = SchemaErrorException(TEST_MESSAGE)
        assert se._error_code == 'Schema Error'
        assert str(se) == TEST_MESSAGE
        assert isinstance(se, SystemErrorException)

        se = SystemErrorException(TEST_MESSAGE)
        assert se._error_code == 'System Error'
        assert str(se) == TEST_MESSAGE
        assert isinstance(se, SystemErrorException)
