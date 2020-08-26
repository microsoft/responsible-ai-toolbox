# Copyright (c) Microsoft Corporation and contributors.
# Licensed under the MIT License.

"""Package for the fairlearn Dashboard widget."""

from ._fairlearn_dashboard import FairlearnDashboard


__version__ = "0.1.0-dev"

__all__ = ['FairlearnDashboard']


def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'js/dist',
        'dest': 'fairlearnboard',
        'require': 'fairlearnboard/extension'
    }]
