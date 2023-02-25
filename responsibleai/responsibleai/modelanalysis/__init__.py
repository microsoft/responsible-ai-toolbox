# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Implementation of Model Analysis API."""

# ModelTask is only imported for backwards compatibility
from raiutils.models import ModelTask
from responsibleai.modelanalysis.model_analysis import ModelAnalysis

__all__ = ["ModelAnalysis", "ModelTask"]
