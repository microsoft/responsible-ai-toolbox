# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines common private constants."""


class ManagerNames(object):
    """Provide the manager names."""

    CAUSAL = 'causal'
    COUNTERFACTUAL = 'counterfactual'
    ERROR_ANALYSIS = 'error_analysis'
    EXPLAINER = 'explainer'


class Metadata(object):
    """Provide constants for metadata and saved files."""

    META_JSON = 'meta.json'
    MODEL = 'model'


class ListProperties(object):
    """Provide constants for listing manager properties."""

    MANAGER_TYPE = 'manager_type'


class ExplainerManagerKeys(object):
    """Provide constants for ExplainerManager key properties."""
    ID = 'id'
    IS_COMPUTED = 'is_computed'
    IS_ENGINEERED = 'is_engineered'
    IS_RAW = 'is_raw'
    METHOD = 'method'
    MODEL_TASK = 'model_task'
    MODEL_TYPE = 'model_type'


class ErrorAnalysisManagerKeys(object):
    """Provide constants for ErrorAnalysisManager key properties."""
    IS_COMPUTED = 'is_computed'
    MAX_DEPTH = 'max_depth'
    NUM_LEAVES = 'num_leaves'
    FILTER_FEATURES = 'filter_features'
    REPORTS = 'reports'
