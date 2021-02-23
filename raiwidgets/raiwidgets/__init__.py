# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Package for the fairness, explanation, and error analysis widgets."""

from .fairness_dashboard import FairnessDashboard
from .explanation_dashboard import ExplanationDashboard
from .error_analysis_dashboard import ErrorAnalysisDashboard
from .model_performance_dashboard import ModelPerformanceDashboard


__version__ = "0.2.2"

__all__ = ['FairnessDashboard', 'ExplanationDashboard',
           'ErrorAnalysisDashboard', 'ModelPerformanceDashboard']
