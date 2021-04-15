# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines common constants."""

from enum import Enum


class ModelTask(str, Enum):
    """Provide model task constants. Can be 'classification' or 'regression'.
    """

    CLASSIFICATION = 'classification'
    REGRESSION = 'regression'


class ManagerNames(str):
    """Provide the manager names."""

    CAUSAL = 'causal'
    COUNTERFACTUAL = 'counterfactual'
    ERROR_ANALYSIS = 'error_analysis'
    EXPLAINER = 'explainer'
    FAIRNESS = 'fairness'


class Metadata(str):
    """Provide constants for metadata and saved files."""

    META_JSON = 'meta.json'
    MODEL = 'model'


class ListProperties(str):
    """Provide constants for listing manager properties."""

    MANAGER_TYPE = 'manager_type'


class ExplainerManagerKeys(str):
    """Provide constants for ExplainerManager key properties."""
    ID = 'id'
    IS_COMPUTED = 'is_computed'
    IS_ENGINEERED = 'is_engineered'
    IS_RAW = 'is_raw'
    METHOD = 'method'
    MODEL_TASK = 'model_task'
    MODEL_TYPE = 'model_type'
