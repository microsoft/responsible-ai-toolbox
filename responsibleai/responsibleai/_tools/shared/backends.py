# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum


class SupportedBackend(Enum):
    """Supported backends."""

    PANDAS = "pandas"
    SPARK = "spark"
