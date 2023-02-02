# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines common constants."""

from enum import Enum


class ModelTask(str, Enum):
    """Provide model task constants. Can be 'classification', 'regression',
    or 'forecasting'."""

    CLASSIFICATION = 'classification'
    REGRESSION = 'regression'
    FORECASTING = 'forecasting'
