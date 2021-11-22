# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Package for the fairness, explanation, and error analysis widgets."""

from .__version__ import version
from .error_analysis_dashboard import ErrorAnalysisDashboard
from .explanation_dashboard import ExplanationDashboard
from .fairness_dashboard import FairnessDashboard
from .model_analysis_dashboard import ModelAnalysisDashboard
from .model_performance_dashboard import ModelPerformanceDashboard
from .responsibleai_dashboard import ResponsibleAIDashboard

__version__ = version

__all__ = ['FairnessDashboard', 'ExplanationDashboard',
           'ErrorAnalysisDashboard', 'ModelPerformanceDashboard',
           'ModelAnalysisDashboard', 'ResponsibleAIDashboard']
