# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for defining error correlation methods."""

from .ebm import compute_ebm_global_importance
from .gbm import compute_gbm_global_importance

__all__ = ["compute_ebm_global_importance", "compute_gbm_global_importance"]
