# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Model Analysis Dashboard class."""

import warnings

from responsibleai import RAIInsights

from .responsibleai_dashboard import ResponsibleAIDashboard


class ModelAnalysisDashboard(object):
    """The dashboard class, wraps the dashboard component.

    Note: this class is now deprecated, please use the
    ResponsibleAIDashboard instead.

    :param analysis: An object that represents an model analysis.
    :type analysis: RAIInsights
    :param public_ip: Optional. If running on a remote vm,
        the external public ip address of the VM.
    :type public_ip: str
    :param port: The port to use on locally hosted service.
    :type port: int

    """

    def __init__(self, analysis: RAIInsights,
                 public_ip=None, port=None, locale=None):
        warnings.warn("ModelAnalysisDashboard in raiwidgets package is "
                      "deprecated."
                      "Please use ResponsibleAIDashboard instead.")
        rai = ResponsibleAIDashboard(analysis, public_ip, port, locale)
        self.input = rai.input
