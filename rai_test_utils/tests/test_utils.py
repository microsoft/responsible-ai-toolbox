# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from rai_test_utils.utilities import is_valid_uuid, get_images
from rai_test_utils.datasets.vision import load_fridge_object_detection_dataset


class TestUtils:
    def test_is_valid_uuid(self):
        assert is_valid_uuid("123e4567-e89b-12d3-a456-426614174000")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400g")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400-")
        assert not is_valid_uuid("123e4567-e89b-12d3-a456-42661417400-143")

    def test_get_images(self):
        # initialize the fridge dataset, invoke the get_image method, and perform assertions
        fridge_dataset = load_fridge_object_detection_dataset().iloc[:2]
        images = get_images(fridge_dataset, "RGB", None)
        assert len(images) == 2
        assert images[0].shape == (666, 499, 3)
        assert images[1].shape == (666, 499, 3)
