# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Responsible AI SDK package."""

# importing ModelTask from raiutils.models for backwards compatibility.
from responsibleai.rai_insights import ModelTask
from responsibleai.modelanalysis import ModelAnalysis
from responsibleai.rai_insights import RAIInsights

from .__version__ import version
from .feature_metadata import FeatureMetadata

__version__ = version

__all__ = ['ModelAnalysis', 'ModelTask', 'RAIInsights', 'FeatureMetadata']
