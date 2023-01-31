# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Responsible AI SDK package."""

from responsibleai.modelanalysis import ModelAnalysis
from responsibleai.rai_insights import RAIInsights
from .feature_metadata import FeatureMetadata

# importing ModelTask from raiutils.models for backwards compatibility.
from raiutils.models import ModelTask


from .__version__ import version

__version__ = version

__all__ = ['ModelAnalysis', 'ModelTask', 'RAIInsights', 'FeatureMetadata']
