# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for defining common utilities related to models."""
from .model_utils import (
    SKLearn, is_classifier, is_forecaster, is_quantile_forecaster, Forecasting)

__all__ = [
    'is_classifier',
    'SKLearn',
    'is_forecaster',
    'is_quantile_forecaster',
    "Forecasting"
]
