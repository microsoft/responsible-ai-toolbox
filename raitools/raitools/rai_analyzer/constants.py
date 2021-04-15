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
    ERROR_ANALYSIS = 'error analysis'
    EXPLAINER = 'explainer'
    FAIRNESS = 'fairness'

    @classmethod
    def _name_filter(cls, name):
        return not name.startswith('__') and not callable(getattr(cls, name))

    @classmethod
    def get_managers(cls):
        """Return the manager names

        :param cls: ManagerNames input class.
        :type cls: ManagerNames
        :return: A set of manager names, e.g., 'causal', 'counterfactual', etc.
        :rtype: set[str]
        """
        keys = vars(cls).keys()
        fkeys = filter(cls._name_filter, keys)
        values = map(lambda key: getattr(ManagerNames, key), fkeys)
        return set(values)


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
