# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Error Analysis Manager class."""

import warnings

from responsibleai.managers.error_analysis_manager import *  # noqa: F401, F403

warnings.warn(
    "MODULE-DEPRECATION-WARNING: The module "
    "responsibleai._managers.error_analysis_manager is deprecated. "
    "Please use responsibleai.managers.error_analysis_manager instead.",
    DeprecationWarning)
