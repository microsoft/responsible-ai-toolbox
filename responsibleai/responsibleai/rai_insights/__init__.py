# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Implementation of Model Analysis API."""

# ModelTask is only imported for backwards compatibility.
from raiutils.models import ModelTask
from responsibleai.rai_insights.rai_insights import RAIInsights

__all__ = ['ModelTask', 'RAIInsights']
