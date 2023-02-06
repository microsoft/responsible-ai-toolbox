# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

# All wrappers in this file will be migrated to ml-wrappers.

import inspect
import sys
from ml_wrappers.model.base_wrapped_model import BaseWrappedModel
from responsibleai.rai_insights.constants import ModelTask
from .constants import _Forecasting

_AZUREML = "azureml"
_SKTIME = "sktime"


def _get_model_package(model):
    module = inspect.getmodule(self.model)
    module_name = module.__name__.partition('.')[0]
    model_package = sys.modules[module_name].__package__
    return model_package


def _wrap_model(model, examples):
    """Choose the appropriate wrapper for the model.

    If the model has a forecast_quantiles method
    (or in the sktime case: predict_quantiles) then choose the wrapped
    quantile forecasting model, otherwise the basic wrapper without
    quantile forecasting capabilities.
    """
    model_package = _get_model_package(model)
    if (model_package == _SKTIME and hasattr(model, "predict_quantiles")) or
            (hasattr(model, _Forecasting.FORECAST_QUANTILES)):
        return _WrappedQuantileForecastingModel(model, examples)
    else:
        return _WrappedForecastingModel(model, examples)


class _WrappedForecastingModel(BaseWrappedModel):
    def __init__(self, model, examples):
        super(WrappedClassificationModel, self).__init__(
            model,
            eval_function=None,
            examples=examples,
            task_type=ModelTask.FORECASTING)
        self._model_package = _get_model_package(model)
        if not self._model_package in [_AZUREML, _SKTIME] and
                not hasattr(model, _Forecasting.FORECAST):
            raise ValueError(
                "The passed model does not have a 'forecast' method. "
                "'forecast' is required for the forecasting task_type. "
                "Alternatively, pass a sktime forecasting model.")

    def forecast(self, X):
        if self._model_package == _AZUREML:
            # AzureML forecasting models return a tuple of (forecast, data)
            # but we only want to return the actual forecast.
            return self._model.forecast(X)[0]
        if self._model_package == _SKTIME:
            # TODO: add fh
            return self._model.predict(X)
        return self._model.forecast(X)


class _WrappedQuantileForecastingModel(WrappedForecastingModel):
    def __init__(self, model, examples):
        super(WrappedClassificationModel, self).__init__(
            model,
            examples=examples)
        if not self._model_package in [_AZUREML, _SKTIME] and
                not hasattr(model, _Forecasting.FORECAST_QUANTILES):
            raise ValueError(
                "The passed model does not have a 'forecast_quantiles' "
                "method. 'forecast_quantiles' is optional for the "
                "forecasting task_type, but required for "
                "WrappedQuantileForecastingModel. Alternatively, pass a "
                "sktime forecasting model that supports predict_quantiles.")

    def forecast_quantiles(self, X, quantiles):
        if (type(quantiles) != list or
                len(quantiles) == 0 or
                any([type(q) != float or
                     q <= 0 or
                     q >= 1 for q in quantiles])):
            raise ValueError(
                "quantiles must be a list of floats between 0 and 1.")
        if self._model_package == _AZUREML:
            # AzureML forecasting models don't take quantiles as an
            # argument but instead need to have it set on the model
            # object.
            self._model.quantiles = quantiles
            return self._model.forecast_quantiles(X)
        if self._model_package == _SKTIME:
            # TODO: add fh
            return self._model.predict_quantiles(X, alpha=quantiles)
                
        return self._model.forecast_quantiles(X, quantiles)
