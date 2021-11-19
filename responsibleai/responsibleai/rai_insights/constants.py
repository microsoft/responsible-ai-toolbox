# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines common constants."""

from enum import Enum


class ModelTask(str, Enum):
    """Provide model task constants. Can be 'classification' or 'regression'.
    """

    CLASSIFICATION = 'classification'
    REGRESSION = 'regression'
