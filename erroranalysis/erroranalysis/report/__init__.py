# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for defining the ErrorReport which is created from Error Analysis."""
from .error_report import ErrorReport, as_error_report, json_converter

__all__ = ['ErrorReport',
           'as_error_report',
           'json_converter']
