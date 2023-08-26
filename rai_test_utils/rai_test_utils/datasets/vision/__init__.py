# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Namespace for vision datasets."""

from .object_detection_data_utils import (get_images,
                                          load_fridge_object_detection_dataset)

__all__ = [
    "get_images",
    "load_fridge_object_detection_dataset"
]
