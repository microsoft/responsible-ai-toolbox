# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for defining common utilities related to models."""
from .model_utils import (Forecasting, ModelTask, SKLearn, is_classifier,
                          is_forecaster, is_object_detector,
                          is_quantile_forecaster)

__all__ = [
    'ModelTask',
    'SKLearn',
    'Forecasting',
    'is_classifier',
    'is_forecaster',
    'is_object_detector',
    'is_quantile_forecaster'
]
