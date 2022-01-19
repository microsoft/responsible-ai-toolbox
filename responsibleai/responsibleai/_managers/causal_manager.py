# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Manager for causal analysis."""

import warnings

from responsibleai.managers.causal_manager import *  # noqa: F401, F403

warnings.warn(
    "MODULE-DEPRECATION-WARNING: The module "
    "responsibleai._managers.causal_manager is deprecated. "
    "Please use responsibleai.managers.causal_manager instead.",
    DeprecationWarning)
