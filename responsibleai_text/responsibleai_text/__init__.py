# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Responsible AI Text SDK package."""

from responsibleai_text.common.constants import ModelTask
from responsibleai_text.rai_text_insights import RAITextInsights

from .version import name, version

__name__ = name
__version__ = version

__all__ = ['ModelTask', 'RAITextInsights']
