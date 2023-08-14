# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum


class ModelTask(str, Enum):
    """Provide model task constants.

    Can be 'classification', 'regression', 'object_detection',
    'forecasting', or 'unknown'.

    Note: Keeping sentence case constants (Classification, Regression)
    for backwards compatibility, please use ALL_UPPER_CASE instead.
    """

    CLASSIFICATION = 'classification'
    REGRESSION = 'regression'
    OBJECT_DETECTION = 'object_detection'
    FORECASTING = 'forecasting'
    UNKNOWN = 'unknown'
    Classification = 'classification'
    Regression = 'regression'


class SKLearn(object):
    """Provide scikit-learn related constants."""

    EXAMPLES = 'examples'
    LABELS = 'labels'
    PREDICT = 'predict'
    PREDICTIONS = 'predictions'
    PREDICT_PROBA = 'predict_proba'


class Forecasting(object):
    """Provide forecasting related constants."""

    FORECAST = "forecast"
    FORECAST_QUANTILES = "forecast_quantiles"


def is_classifier(model):
    """Check if the model is a classifier.

    :return: True if the model is a classifier, False otherwise.
    :rtype: bool
    """
    return (model is not None and
            hasattr(model, SKLearn.PREDICT_PROBA) and
            model.predict_proba is not None)


def is_forecaster(model):
    """Check if the model is a forecaster.

    :return: True if the model is a forecaster, False otherwise.
    :rtype: bool
    """
    return (model is not None and
            hasattr(model, Forecasting.FORECAST) and
            model.forecast is not None)


def is_object_detector(model):
    """Check if the model is an object detection model.

    :return: True if the model is an object detector, False otherwise.
    :rtype: bool
    """
    return (is_classifier(model) and
            hasattr(model, SKLearn.PREDICT) and
            model.predict is not None)


def is_quantile_forecaster(model):
    """Check if the model is a quantile forecaster.

    :return: True if the model is a quantile forecaster, False otherwise.
    :rtype: bool
    """
    return (model is not None and
            hasattr(model, Forecasting.FORECAST_QUANTILES) and
            model.forecast_quantiles is not None)
