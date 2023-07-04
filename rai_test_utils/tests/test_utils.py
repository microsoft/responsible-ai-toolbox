# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from rai_test_utils.utilities import is_valid_uuid


class TestUtils:
    def test_is_valid_uuid(self):
        assert is_valid_uuid("123e4567-e89b-12d3-a456-426614174000")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400g")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400-")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400-143")
