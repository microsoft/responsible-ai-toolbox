# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

# All wrappers in this file will be migrated to ml-wrappers.

import inspect
import sys

import pandas as pd
from ml_wrappers.model.base_wrapped_model import BaseWrappedModel

from raiutils.models import Forecasting, ModelTask

_AZUREML = "azureml"
_SKTIME = "sktime"


def _get_model_package(model):
    """Return the package name of the passed model."""
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
            hasattr(model, Forecasting.FORECAST_QUANTILES)):
        return _WrappedQuantileForecastingModel(
            model, examples, time_feature, time_series_id_features)
    else:
        return _WrappedForecastingModel(
            model, examples, time_feature, time_series_id_features)


class _WrappedForecastingModel(BaseWrappedModel):
    """Wrapper for forecasting models.

    This provides a unified API for the forecast method.
    Additionally, this wrapper knows how to work with models from
    certain packages such as AzureML and sktime.
    Other models are expected to have a forecast method that takes
    a DataFrame with the time series ID features and time feature.
    """
    def __init__(self, model, examples, time_feature,
                 time_series_id_features):
        super(_WrappedForecastingModel, self).__init__(
            model,
            eval_function=None,
            examples=examples,
            model_task=ModelTask.FORECASTING)
        self._model_package = _get_model_package(model)
        if (self._model_package not in [_AZUREML, _SKTIME] and
                not hasattr(model, Forecasting.FORECAST)):
            raise ValueError(
                "The passed model does not have a 'forecast' method. "
                "'forecast' is required for the forecasting task_type. "
                "Alternatively, pass a sktime forecasting model.")
        self._validate_time_features(time_feature, time_series_id_features)

    def _validate_time_features(self, time_feature, time_series_id_features):
        """Ensures that time and time series ID features are present."""
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
        """Returns the forecast for the passed data."""
        if self._model_package == _AZUREML:
            # AzureML forecasting models return a tuple of (forecast, data)
            # but we only want to return the actual forecast.
            return self._model.forecast(X)[0]
        if self._model_package == _SKTIME:
            return self._apply_sktime_method(self._model.predict, X)

        # default case
        return self._model.forecast(X)

    def _get_forecast_horizon(self, X):
        """Returns the forecast horizon for the passed data."""
        # This method is only called if the model is from the sktime package
        # so we can assume that sktime is installed.
        # For non-sktime or more generally non-forecasting scenarios sktime
        # won't be needed so we don't want to add it as a requirement to the
        # responsibleai package.
        from sktime.forecasting.base import ForecastingHorizon
        return ForecastingHorizon(
            pd.to_datetime(X[self._time_feature].unique()).sort_values(),
            is_relative=False)

    def _apply_sktime_method(self, method, X):
        """Applies the passed sktime forecasting method.

        This method is just a helper for sktime models.
        """
        fh = self._get_forecast_horizon(X)
        # sktime expects the time series ID features and time feature
        # in the index rather than as a regular column.
        X_temp = X.copy()
        X_temp.set_index(
            self._time_series_id_features + [self._time_feature],
            inplace=True, drop=True)
        if len(self._time_series_id_features) == 0:
            return method(X=X_temp, fh=fh)

        # If there are potentially multiple time series in the data
        # we need to ensure that sktime receives data for all of them.
        # This is currently an issue in sktime:
        # https://github.com/sktime/sktime/issues/4209
        # When this is supported in sktime we can remove the code in this
        # if-branch.

        # Check that all input time series have all required rows.
        time_series_id_features_index_levels = \
            list(range(len(self._time_series_id_features)))
        time_series_counts = X_temp.groupby(
            level=time_series_id_features_index_levels).size().to_list()
        all_time_series_have_same_number_of_rows = \
            all(count == time_series_counts[0] for count in time_series_counts)
        if not all_time_series_have_same_number_of_rows:
            raise ValueError(
                "Not all time series have the same number of rows.")
        # Determine which time series are missing from the data.
        # All index levels except for the last one are time series ID features.
        # The last level is the datetime feature.
        existing_time_series = \
            X_temp.index.droplevel(level=-1).unique().to_list()
        all_time_series = self._model.forecasters_.index.to_list()
        missing_time_series = \
            list(set(all_time_series) - set(existing_time_series))
        # Add the missing time series to the data by duplicating
        # the first time series.
        n_rows = int(len(X_temp) / len(existing_time_series))
        for time_series in missing_time_series:
            X_add = X_temp.iloc[:n_rows].copy()
            id_feature_value_mapping = \
                dict(zip(self._time_series_id_features, time_series))
            for id_feature, value in id_feature_value_mapping.items():
                X_add[id_feature] = value
            X_add[self._time_feature] = X_add.index.get_level_values(level=-1)
            X_add.set_index(
                self._time_series_id_features + [self._time_feature],
                drop=True, inplace=True)
            X_temp = pd.concat((X_temp, X_add))

        preds = method(X=X_temp, fh=fh)
        # Remove the predictions that weren't requested.
        return preds.head(len(X))


class _WrappedQuantileForecastingModel(_WrappedForecastingModel):
    """Wrapper for quantile forecasting models.

    This provides a unified API for the forecast_quantile method
    in addition to the forecast method provided by the base class.
    Additionally, this wrapper knows how to work with models from
    certain packages such as AzureML and sktime.
    Other models are expected to have a forecast method that takes
    a DataFrame with the time series ID features and time feature.
    """
    def __init__(self, model, examples, time_feature,
                 time_series_id_features):
        super(_WrappedQuantileForecastingModel, self).__init__(
            model,
            examples=examples,
            time_feature=time_feature,
            time_series_id_features=time_series_id_features)
        if (self._model_package not in [_AZUREML, _SKTIME] and
                not hasattr(model, Forecasting.FORECAST_QUANTILES)):
            raise ValueError(
                "The passed model does not have a 'forecast_quantiles' "
                "method. 'forecast_quantiles' is optional for the "
                "forecasting task_type, but required for "
                "WrappedQuantileForecastingModel. Alternatively, pass a "
                "sktime forecasting model that supports predict_quantiles.")

    def forecast_quantiles(self, X, quantiles=None):
        """Returns the forecast for the given quantiles.

        If no quantiles are passed, the default quantiles 0.025 and 0.975
        are used.
        """
        if quantiles is None:
            quantiles = [0.025, 0.975]
        if (not isinstance(quantiles, list) or
                len(quantiles) == 0 or
                any([not isinstance(q, float) or
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
            def forecast_quantiles_method(X, fh):
                return self._model.predict_quantiles(
                    X=X, fh=fh, alpha=quantiles)
            return self._apply_sktime_method(forecast_quantiles_method, X)
        return self._model.forecast_quantiles(X, quantiles)
