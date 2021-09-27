# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import abc


class BaseEnvironment(abc.ABC):
    """Interface for environments."""
    def display(self, html):
        from IPython.display import HTML, display
        display(HTML(html), metadata=dict(isolated=True))

    def select(self, service):
        pass
