# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Package for the fairness, explanation, and error analysis widgets."""

from .fairness_dashboard import FairnessDashboard
from .explanation_dashboard import ExplanationDashboard
from .debugml_dashboard import DebugMLDashboard
from .model_performance_dashboard import ModelPerformanceDashboard


__version__ = "0.2.0"

__all__ = ['FairnessDashboard', 'ExplanationDashboard',
           'DebugMLDashboard', 'ModelPerformanceDashboard']
