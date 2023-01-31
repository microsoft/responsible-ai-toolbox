# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from enum import Enum


class ModelTask(str, Enum):
    """Provide model task constants. Can be 'classification', 'regression', or 'forecasting'.
    """

    CLASSIFICATION = 'classification'
    REGRESSION = 'regression'
    FORECASTING = 'forecasting'


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


def is_quantile_forecaster(model):
    """Check if the model is a quantile forecaster.

    :return: True if the model is a quantile forecaster, False otherwise.
    :rtype: bool
    """
    return (model is not None and
            hasattr(model, Forecasting.FORECAST_QUANTILES) and
            model.forecast_quantiles is not None)


# The purpose maps various model outputs to a single set of data structures
# that are passed to the UI to render.
# Internally we can treat forecasts as predictions and quantiles as
# probabilities since we only need to forward them to the UI.
# Depending on task type they get interpreted as either one and
# we don't need to duplicate a lot of code.
class MethodPurpose(Enum):
    PREDICTION = "prediction"
    FORECAST = PREDICTION
    PROBABILITY = "probability"
    QUANTILES = PROBABILITY


# ModelMethod represents methods to call on a model.
# Examples include predict, forecast, etc.
# The optional argument indicates whether a method is required or optional.
# For example, not every classifier has a predict_proba method, but they
# all need a predict method.

class ModelMethod:
    def __init__(self, *, name, optional, purpose):
        self.name = name
        self.optional = optional
        self.purpose = purpose


# Model methods by task type
# Every task has one required method (optional=False) to make predictions,
# forecasts etc. and can additionally have optional methods to calculate
# probabilities, quantiles, etc.
MODEL_METHODS = {
    ModelTask.CLASSIFICATION: [
        ModelMethod(
            name=SKLearn.PREDICT,
            optional=False,
            purpose=MethodPurpose.PREDICTION),
        ModelMethod(
            name=SKLearn.PREDICT_PROBA,
            optional=True,
            purpose=MethodPurpose.PROBABILITY)
    ],
    ModelTask.REGRESSION: [
        ModelMethod(
            name=SKLearn.PREDICT,
            optional=False,
            purpose=MethodPurpose.PREDICTION)
    ],
    ModelTask.FORECASTING: [
        ModelMethod(
            name=Forecasting.FORECAST,
            optional=False,
            purpose=MethodPurpose.FORECAST),
        ModelMethod(
            name=Forecasting.FORECAST_QUANTILES,
            optional=True,
            purpose=MethodPurpose.QUANTILES)
    ]
}