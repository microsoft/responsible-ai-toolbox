# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Base configuration class."""

from abc import ABC, abstractmethod


class BaseConfig(ABC):
    def __init__(self):
        self.is_computed = False

    @abstractmethod
    def __eq__(self, other_ea_config):
        pass

    def is_duplicate(self, config_list):
        for config in config_list:
            if self == config:
                return True
        return False
