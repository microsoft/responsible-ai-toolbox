# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for defining common utilities related to models."""
from .model_utils import (MODEL_METHODS, Forecasting, MethodPurpose, ModelTask,
                          SKLearn, is_classifier, is_forecaster,
                          is_quantile_forecaster)

__all__ = [
    'is_classifier', 'SKLearn', 'Forecasting', 'is_forecaster',
    'is_quantile_forecaster', 'ModelTask', 'MODEL_METHODS', 'MethodPurpose']
