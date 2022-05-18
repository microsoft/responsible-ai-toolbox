# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum


class SupportedBackend(Enum):
    """Supported backends."""

    PANDAS = "pandas"
    SPARK = "spark"


def get_spark():
    """Tries to import and return spark. If the import fails, returns None."""
    try:
        from pyspark.shell import spark

        return spark
    except ImportError:
        return None
