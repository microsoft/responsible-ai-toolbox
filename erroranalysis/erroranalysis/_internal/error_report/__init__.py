# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Init file, used for backwards compatibility."""
from erroranalysis.report import ErrorReport, as_error_report, json_converter

__all__ = ['ErrorReport',
           'as_error_report',
           'json_converter']
