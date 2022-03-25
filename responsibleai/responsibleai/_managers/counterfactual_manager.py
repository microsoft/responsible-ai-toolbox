# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Counterfactual Manager class."""

import warnings

from responsibleai.managers.counterfactual_manager import *  # noqa: F401, F403

warnings.warn(
    "MODULE-DEPRECATION-WARNING: The module "
    "responsibleai._managers.counterfactual_manager is deprecated. "
    "Please use responsibleai.managers.counterfactual_manager instead.",
    DeprecationWarning)
