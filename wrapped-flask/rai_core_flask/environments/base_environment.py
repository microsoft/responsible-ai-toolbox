# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import abc


class BaseEnvironment(abc.ABC):
    """Interface for environments."""
    def display(self, html):
        pass

    def select(self, service):
        pass
