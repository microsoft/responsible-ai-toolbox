# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Package for the fairness, explanation, and error analysis widgets."""

from .__version__ import version
from .model_server import ModelServer

__version__ = version

__all__ = ['ModelServer']
