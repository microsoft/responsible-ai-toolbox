# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Namespace for models."""

from .model_utils import create_models_classification, create_models_regression

__all__ = [
    "create_models_regression",
    "create_models_classification"
]
