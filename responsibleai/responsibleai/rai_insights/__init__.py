# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Implementation of Model Analysis API."""

from responsibleai.rai_insights.rai_insights import RAIInsights
# keep the following line for backward compatibility
from raiutils.models import ModelTask


__all__ = ['ModelTask', 'RAIInsights']
