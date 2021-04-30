# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Causal Manager class."""

from responsibleai._internal.constants import ManagerNames
from responsibleai._managers.base_manager import BaseManager


class CausalManager(BaseManager):
    def __init__(self):
        pass

    def add(self):
        raise NotImplementedError("Add not implemented for CausalManager")

    def compute(self):
        pass

    def get(self):
        raise NotImplementedError("Get not implemented for CausalManager")

    def list(self):
        pass

    @property
    def name(self):
        """Get the name of the causal manager.

        :return: The name of the causal manager.
        :rtype: str
        """
        return ManagerNames.CAUSAL

    def _save(self, path):
        pass

    @staticmethod
    def _load(path, model_analysis):
        pass
