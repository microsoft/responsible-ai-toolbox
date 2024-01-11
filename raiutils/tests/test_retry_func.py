# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import time

import pytest

from raiutils.common.retries import retry_function


class TestRetryFunction:
    _DELTA = 1.0

    def test_no_error(self):
        x = 5

        def func():
            return x + 1

        result = retry_function(func, 'test', 'test failed')
        assert result == 6

        result = retry_function(func, 'test', 'test failed', retry_delay=1)
        assert result == 6

        result = retry_function(func, 'test', 'test failed', retry_delay=1.1)
        assert result == 6

        result = retry_function(func, 'test', 'test failed', retry_delay=0)
        assert result == 6

    def test_error_with_int_delay(self):
        x = 'a'

        def func():
            return x + 1

        t_start = time.time()
        with pytest.raises(RuntimeError, match='test failed'):
            retry_function(func, 'test', 'test failed',
                           max_retries=4, retry_delay=1)
        time_taken = time.time() - t_start
        expected_time_taken = 1 + 2 + 4
        assert abs(time_taken - expected_time_taken) < self._DELTA

    def test_error_with_zero_delay(self):
        x = 'a'

        def func():
            return x + 1

        t_start = time.time()
        with pytest.raises(RuntimeError, match='test failed'):
            retry_function(func, 'test', 'test failed',
                           max_retries=4, retry_delay=0)
        time_taken = time.time() - t_start
        expected_time_taken = 0
        assert abs(time_taken - expected_time_taken) < self._DELTA

    def test_error_with_float_delay(self):
        x = 'a'

        def func():
            return x + 1

        t_start = time.time()
        with pytest.raises(RuntimeError, match='test failed'):
            retry_function(func, 'test', 'test failed',
                           max_retries=4, retry_delay=0.5)
        time_taken = time.time() - t_start
        expected_time_taken = 0.5 + 1.0 + 2.0
        assert abs(time_taken - expected_time_taken) < self._DELTA
