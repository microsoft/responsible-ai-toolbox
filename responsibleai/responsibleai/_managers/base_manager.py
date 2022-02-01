# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the base class for managers."""

import warnings

from responsibleai.managers.base_manager import *  # noqa: F401, F403

warnings.warn(
    "MODULE-DEPRECATION-WARNING: The module "
    "responsibleai._managers.base_manager is deprecated. "
    "Please use responsibleai.managers.base_manager instead.",
    DeprecationWarning)
