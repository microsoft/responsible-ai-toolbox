# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Error Analysis Manager class."""

import warnings

from responsibleai.managers.explainer_manager import *  # noqa: F401, F403

warnings.warn(
    "MODULE-DEPRECATION-WARNING: The module "
    "responsibleai._managers.explainer_manager is deprecated. "
    "Please use responsibleai.managers.explainer_manager instead.",
    DeprecationWarning)
