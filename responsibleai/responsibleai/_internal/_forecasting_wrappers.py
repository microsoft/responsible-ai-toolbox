# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

# All wrappers in this file will be migrated to ml-wrappers.

import inspect
import pandas as pd
import sys
from ml_wrappers.model.base_wrapped_model import BaseWrappedModel
from responsibleai.rai_insights.constants import ModelTask
from .constants import _Forecasting

_AZUREML = "azureml"
_SKTIME = "sktime"


def _get_model_package(model):
    module = inspect.getmodule(model)
    module_name = module.__name__.partition('.')[0]
    model_package = sys.modules[module_name].__package__
    return model_package


def _wrap_model(model, examples, time_feature, time_series_id_features):
    """Choose the appropriate wrapper for the model.

    If the model has a forecast_quantiles method
    (or in the sktime case: predict_quantiles) then choose the wrapped
    quantile forecasting model, otherwise the basic wrapper without
    quantile forecasting capabilities.
    """
    model_package = _get_model_package(model)
    if ((model_package == _SKTIME and hasattr(model, "predict_quantiles")) or
            hasattr(model, _Forecasting.FORECAST_QUANTILES)):
        return _WrappedQuantileForecastingModel(
            model, examples, time_feature, time_series_id_features)
    else:
        return _WrappedForecastingModel(
            model, examples, time_feature, time_series_id_features)


class _WrappedForecastingModel(BaseWrappedModel):
    def __init__(self, model, examples, time_feature,
                 time_series_id_features):
        super(_WrappedForecastingModel, self).__init__(
            model,
            eval_function=None,
            examples=examples,
            model_task=ModelTask.FORECASTING)
        self._model_package = _get_model_package(model)
        if (not self._model_package in [_AZUREML, _SKTIME] and
                not hasattr(model, _Forecasting.FORECAST)):
            raise ValueError(
                "The passed model does not have a 'forecast' method. "
                "'forecast' is required for the forecasting task_type. "
                "Alternatively, pass a sktime forecasting model.")
        self._validate_time_features(time_feature, time_series_id_features)
        
    def _validate_time_features(self, time_feature, time_series_id_features):
        if time_feature not in self._examples.columns:
            raise ValueError(
                "The passed time_feature is not in the examples DataFrame.")
        self._time_feature = time_feature
        for ts_id in time_series_id_features:
            if ts_id not in self._examples.columns:
                raise ValueError(
                    f"The passed time series ID feature {ts_id} is not "
                    "in the examples DataFrame.")
        self._time_feature = time_feature
        self._time_series_id_features = time_series_id_features

    def forecast(self, X):
        if self._model_package == _AZUREML:
            # AzureML forecasting models return a tuple of (forecast, data)
            # but we only want to return the actual forecast.
            return self._model.forecast(X)[0]
        if self._model_package == _SKTIME:
            fh = self._get_forecast_horizon(X)
            # sktime expects the time series Id features and time feature
            # in the index rather than as a regular column.
            X_temp = X.copy()
            X_temp.set_index(self._time_series_id_features + [self._time_feature],
                             inplace=True, drop=True)
            print(X_temp.head(50))
            return self._model.predict(X=X_temp, fh=fh)
        return self._model.forecast(X)

    def _get_forecast_horizon(self, X):
        # This method is only called if the model is from the sktime package
        # so we can assume that sktime is installed.
        # For non-sktime or more generally non-forecasting scenarios sktime
        # won't be needed so we don't want to add it as a requirement to the
        # responsibleai package.
        from sktime.forecasting.base import ForecastingHorizon
        return ForecastingHorizon(
            pd.to_datetime(X[self._time_feature].unique()).sort_values(),
            is_relative=False)


class _WrappedQuantileForecastingModel(_WrappedForecastingModel):
    def __init__(self, model, examples, time_feature,
                 time_series_id_features):
        super(_WrappedQuantileForecastingModel, self).__init__(
            model,
            examples=examples,
            time_feature=time_feature,
            time_series_id_features=time_series_id_features)
        if (not self._model_package in [_AZUREML, _SKTIME] and
                not hasattr(model, _Forecasting.FORECAST_QUANTILES)):
            raise ValueError(
                "The passed model does not have a 'forecast_quantiles' "
                "method. 'forecast_quantiles' is optional for the "
                "forecasting task_type, but required for "
                "WrappedQuantileForecastingModel. Alternatively, pass a "
                "sktime forecasting model that supports predict_quantiles.")

    def forecast_quantiles(self, X, quantiles=None):
        if quantiles is None:
            quantiles = [0.025, 0.975]
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
            fh = self._get_forecast_horizon(X)
            return self._model.predict_quantiles(X=X, fh=fh, alpha=quantiles)
                
        return self._model.forecast_quantiles(X, quantiles)
