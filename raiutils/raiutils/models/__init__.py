# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for defining common utilities related to models."""
from .model_utils import SKLearn, is_classifier, Forecasting, is_forecaster, is_quantile_forecaster

__all__ = ['is_classifier', 'SKLearn', 'Forecasting', 'is_forecaster', 'is_quantile_forecaster']
