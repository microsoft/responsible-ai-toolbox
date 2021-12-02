# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Constant strings related to Error Analysis."""


class ErrorAnalysisDashboardInterface(object):
    """Dictionary properties shared between python and javascript object."""
    TREE_URL = 'treeUrl'
    MATRIX_URL = 'matrixUrl'
    ENABLE_PREDICT = 'enablePredict'
    METHOD = 'method'


class MethodConstants(object):
    REGRESSION = 'regression'
    MULTICLASS = 'multiclass'
    BINARY = 'binary'
