# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


class SKLearn(object):
    """Provide scikit-learn related constants."""

    EXAMPLES = 'examples'
    LABELS = 'labels'
    PREDICT = 'predict'
    PREDICTIONS = 'predictions'
    PREDICT_PROBA = 'predict_proba'


def is_classifier(model):
    """Check if the model is a classifier.

    :return: True if the model is a classifier, False otherwise.
    :rtype: bool
    """
    return (model is not None and
            hasattr(model, SKLearn.PREDICT_PROBA) and
            model.predict_proba is not None)


class Forecasting(object):
    """Provide forecasting-related constants."""
    PREDICT_QUANTILES = 'predict_quantiles'

def is_forecaster(model):
    """Check if the model is a forecaster.
    
    :return: True if the model is a forecaster, False otherwise.
    :rtype: bool
    """
    return (model is not None and
            hasattr(model, SKLearn.PREDICT) and
            model.forecast is not None)

def is_quantile_forecaster(model):
    """Check if the model can forecast quantiles.
    
    :return: True if the model can forecast quantiles, False otherwise.
    :rtype: bool
    """
    return (is_forecaster(model) and
            hasattr(model, Forecasting.PREDICT_QUANTILES) and
            model.predict_quantiles is not None)
