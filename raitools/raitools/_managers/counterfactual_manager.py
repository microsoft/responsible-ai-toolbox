# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Counterfactual Manager class."""

from raitools.rai_analyzer.constants import ManagerNames
from raitools._managers.base_manager import BaseManager


class CounterfactualManager(BaseManager):
    def __init__(self):
        pass

    def add(self,
            continuous_features=None,
            outcome_name=None,
            total_CFs=None,
            desired_range=None,
            desired_class="opposite",
            permitted_range=None,
            features_to_vary=None,
            method=None):
        raise NotImplementedError(
            "Add not implemented for CounterfactualManager")

    def compute(self):
        pass

    def get(self):
        raise NotImplementedError(
            "Get not implemented for CounterfactualManager")

    def list(self):
        pass

    @property
    def name(self):
        """Get the name of the counterfactual manager.

        :return: The name of the counterfactual manager.
        :rtype: str
        """
        return ManagerNames.COUNTERFACTUAL

    def save(self, path):
        pass

    @staticmethod
    def load(path, rai_analyzer):
        pass
