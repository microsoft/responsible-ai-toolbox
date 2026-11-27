# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os

from rai_test_utils.utilities import (DOWNLOADED_DATASET_DIR, is_valid_uuid,
                                      retrieve_dataset)


class TestUtils:
    def test_is_valid_uuid(self):
        assert is_valid_uuid("123e4567-e89b-12d3-a456-426614174000")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400g")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400-")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400-143")

    def test_retrieve_dataset(self):
        energy_data = retrieve_dataset('energyefficiency2012_data.train.csv')
        assert energy_data is not None
        assert not os.path.exists(DOWNLOADED_DATASET_DIR)
        assert not os.path.exists(DOWNLOADED_DATASET_DIR + '.zip')
