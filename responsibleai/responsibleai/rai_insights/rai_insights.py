# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the RAIInsights class."""

import inspect
import json
import pickle
import sys
import warnings
from pathlib import Path
from typing import Any, List, Optional, Union

import numpy as np
import pandas as pd

from erroranalysis._internal.cohort_filter import FilterDataWithCohortFilters
from erroranalysis._internal.process_categoricals import process_categoricals
from raiutils.data_processing import convert_to_list
from raiutils.models import MODEL_METHODS, MethodPurpose, ModelTask, SKLearn
from responsibleai._interfaces import Dataset, RAIInsightsData
from responsibleai._internal.constants import (FileFormats, ManagerNames,
                                               Metadata,
                                               SerializationAttributes)
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.feature_metadata import FeatureMetadata
from responsibleai.managers.causal_manager import CausalManager
from responsibleai.managers.counterfactual_manager import CounterfactualManager
from responsibleai.managers.data_balance_manager import DataBalanceManager
from responsibleai.managers.error_analysis_manager import ErrorAnalysisManager
from responsibleai.managers.explainer_manager import ExplainerManager
from responsibleai.rai_insights.rai_base_insights import RAIBaseInsights

_TRAIN_LABELS = 'train_labels'
_MODEL = "model"
_PREDICT_OUTPUT = 'predict_output'
_FORECAST_OUTPUT = 'forecast_output'
_PREDICT_PROBA_OUTPUT = 'predict_proba_output'
_FORECAST_QUANTILES_OUTPUT = 'forecast_quantiles_output'
_COLUMN_NAME = 'column_name'
_RANGE_TYPE = 'range_type'
_UNIQUE_VALUES = 'unique_values'
_MIN_VALUE = 'min_value'
_MAX_VALUE = 'max_value'


_DATA_TO_FILE_MAPPING = {
    "_" + _PREDICT_OUTPUT: SerializationAttributes.PREDICT_JSON,
    "_" + _FORECAST_OUTPUT: SerializationAttributes.FORECAST_JSON,
    "_" + _PREDICT_PROBA_OUTPUT: SerializationAttributes.PREDICT_PROBA_JSON,
    "_" + _FORECAST_QUANTILES_OUTPUT:
        SerializationAttributes.FORECAST_QUANTILES_JSON,
    "_large_" + _PREDICT_OUTPUT: SerializationAttributes.LARGE_PREDICT_JSON,
    "_large_" + _FORECAST_OUTPUT: SerializationAttributes.LARGE_FORECAST_JSON,
    "_large_" + _PREDICT_PROBA_OUTPUT:
        SerializationAttributes.LARGE_PREDICT_PROBA_JSON,
    "_large_" + _FORECAST_QUANTILES_OUTPUT:
        SerializationAttributes.LARGE_FORECAST_QUANTILES_JSON,
}

_MODEL_METHOD_EXCEPTION_MESSAGE = (
    'The passed model cannot be used for getting predictions via {0}')


class ForecastingWrapper(object):
    def __init__(self, forecast_method, forecast_quantiles_method=None):
        self._forecast_method = forecast_method
        self._forecast_quantiles_method = forecast_quantiles_method

    def forecast(self, X):
        return self._forecast_method(X)

    def forecast_quantiles(self, X, quantiles):
        return self._forecast_quantiles_method(X, quantiles)


class RAIInsights(RAIBaseInsights):
    """Defines the top-level Model Analysis API.
    Use RAIInsights to analyze errors, explain the most important
    features, compute counterfactuals and run causal analysis in a
    single API.
    """

    def __init__(self,
                 model: Optional[Any],
                 train: pd.DataFrame,
                 test: pd.DataFrame,
                 target_column: str,
                 task_type: str,
                 categorical_features: Optional[List[str]] = None,
                 classes: Optional[np.ndarray] = None,
                 serializer: Optional[Any] = None,
                 maximum_rows_for_test: int = 5000,
                 feature_metadata: Optional[FeatureMetadata] = None):
        """Creates an RAIInsights object.
        :param model: The model to compute RAI insights for.
            A model that implements sklearn-style predict or predict_proba
            or a function that accepts a 2d ndarray.
        :type model: object
        :param train: The training dataset including the label column.
        :type train: pandas.DataFrame
        :param test: The test dataset including the label column.
        :type test: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: The task to run, can be `classification`,
            `regression`, or `forecasting`.
        :type task_type: str
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param classes: The class labels in the training dataset
        :type classes: numpy.ndarray
        :param serializer: Picklable custom serializer with save and load
            methods for custom model serialization.
            The save method writes the model to file given a parent directory.
            The load method returns the deserialized model from the same
            parent directory.
        :type serializer: object
        :param maximum_rows_for_test: Limit on size of test data
            (for performance reasons)
        :type maximum_rows_for_test: int
        :param feature_metadata: Feature metadata for the train/test
                                 dataset to identify different kinds
                                 of features in the dataset.
        :type feature_metadata: FeatureMetadata
        """
        self._feature_metadata = feature_metadata or FeatureMetadata()
        self.categorical_features = categorical_features or []
        self._consolidate_categorical_features()

        self._large_test = None

        if len(test) > maximum_rows_for_test:
            warnings.warn(
                f"The size of the test set {len(test)} is greater than the "
                f"supported limit of {maximum_rows_for_test}. "
                "Computing insights for the first "
                f"{maximum_rows_for_test} samples of the test set")
            self._large_test = test.copy()
            test = test.copy()[0:maximum_rows_for_test]

        super(RAIInsights, self).__init__(
            model, train, test, target_column, task_type, serializer)

        self._predict_output = None
        self._forecast_output = None
        self._predict_proba_output = None
        self._forecast_quantiles_output = None
        self._large_predict_output = None
        self._large_forecast_output = None
        self._large_predict_proba_output = None
        self._large_forecast_quantiles_output = None

        self._validate_rai_insights_input_parameters(
            model=model, train=train,
            test=test,
            target_column=target_column,
            task_type=task_type,
            classes=classes,
            serializer=serializer,
            feature_metadata=self._feature_metadata)

        self._classes = RAIInsights._get_classes(
            task_type=task_type,
            train=train,
            target_column=target_column,
            classes=classes
        )
        self._wrap_model_if_needed()

        self._feature_columns = \
            test.drop(columns=[target_column]).columns.tolist()
        self._feature_ranges = RAIInsights._get_feature_ranges(
            test=test,
            categorical_features=self.categorical_features,
            feature_columns=self._feature_columns,
            time_column_name=self._feature_metadata.time_column_name)
        self._categories, self._categorical_indexes, \
            self._category_dictionary, self._string_ind_data = \
            process_categoricals(
                all_feature_names=self._feature_columns,
                categorical_features=self.categorical_features,
                dataset=test.drop(columns=[target_column]))

        if model is not None:
            # Cache predictions of the model
            self._set_model_outputs(input_data=self.get_test_data(
                test_data=test).drop(columns=[target_column]), large=False)

            if self._large_test is not None:
                self._set_model_outputs(
                    input_data=self._large_test.drop(columns=[target_column]),
                    large=True)
        # keep managers at the end since they rely on everything above
        self._initialize_managers()
        self._try_add_data_balance()

    def get_train_data(self):
        """Returns the training dataset after dropping
        features if any were configured to be dropped.

        :return: The training dataset after dropping features.
        :rtype: pandas.DataFrame
        """
        if self._feature_metadata is None:
            return self.train
        else:
            if self._feature_metadata.dropped_features is None or \
                    len(self._feature_metadata.dropped_features) == 0:
                return self.train
            else:
                return self.train.drop(
                    columns=self._feature_metadata.dropped_features,
                    axis=1)

    def get_test_data(self, test_data=None):
        """Returns the test dataset after dropping
        features if any were configured to be dropped.

        :return: The test dataset after dropping features.
        :rtype: pandas.DataFrame
        """
        if self._feature_metadata is None:
            return test_data if test_data is not None else self.test
        else:
            if self._feature_metadata.dropped_features is None or \
                    len(self._feature_metadata.dropped_features) == 0:
                return test_data if test_data is not None else self.test
            else:
                if test_data is None:
                    return self.test.drop(
                        columns=self._feature_metadata.dropped_features,
                        axis=1)
                else:
                    return test_data.drop(
                        columns=self._feature_metadata.dropped_features,
                        axis=1)

    def _consolidate_categorical_features(self):
        """Consolidates the categorical features.

        Originally, only the RAIInsights constructor accepted
        categorical_features. Later on, feature_metadata was added as an
        argument that also includes categorical_features.
        This method consolidates them or raises an exception if it is not
        possible. The resulting categorical features should be set on the
        self._feature_metadata object. Eventually, the categorical_features
        argument on the RAIInsights constructor will be deprecated.
        """
        if self._feature_metadata.categorical_features is None:
            if self.categorical_features is None:
                return
            else:
                self._feature_metadata.categorical_features = \
                    self.categorical_features
                return
        else:
            if self.categorical_features is None:
                self.categorical_features = \
                    self._feature_metadata.categorical_features
                return
            else:
                # Both are specified. Raise an exception if they don't match.
                if (set(self.categorical_features) ==
                        set(self._feature_metadata.categorical_features)):
                    return
                else:
                    raise UserConfigValidationException(
                        'The categorical_features provided via the '
                        'RAIInsights constructor and the categorical_features '
                        'provided via the feature_metadata argument do not '
                        'match.')

    def _initialize_managers(self):
        """Initializes the managers.

        Initialized the causal, counterfactual, error analysis
        and explainer managers.
        """
        if self.task_type == ModelTask.FORECASTING:
            self._managers = []
            return

        dropped_features = self._feature_metadata.dropped_features
        self._causal_manager = CausalManager(
            self.get_train_data(), self.get_test_data(), self.target_column,
            self.task_type, self.categorical_features, self._feature_metadata)

        self._counterfactual_manager = CounterfactualManager(
            model=self.model, train=self.get_train_data(),
            test=self.get_test_data(),
            target_column=self.target_column, task_type=self.task_type,
            categorical_features=self.categorical_features)

        self._data_balance_manager = DataBalanceManager(
            train=self.train, test=self.test, target_column=self.target_column,
            classes=self._classes, task_type=self.task_type)

        self._error_analysis_manager = ErrorAnalysisManager(
            self.model, self.test, self.target_column,
            self._classes,
            categorical_features=self.categorical_features,
            dropped_features=dropped_features)

        self._explainer_manager = ExplainerManager(
            self.model, self.get_train_data(), self.get_test_data(),
            self.target_column,
            self._classes,
            categorical_features=self.categorical_features)

        self._managers = [self._causal_manager,
                          self._counterfactual_manager,
                          self._data_balance_manager,
                          self._error_analysis_manager,
                          self._explainer_manager]

    @staticmethod
    def _get_classes(task_type, train, target_column, classes):
        if task_type == ModelTask.CLASSIFICATION:
            if classes is None:
                classes = train[target_column].unique()
                # sort the classes after calling unique in numeric case
                classes.sort()
                return classes
            else:
                return classes
        else:
            return None

    def _try_add_data_balance(self):
        """
        Add data balance measures to be computed on categorical features
        if it is a classification task.
        """
        if (self.task_type == ModelTask.CLASSIFICATION and
                len(self.categorical_features) > 0 and
                self._classes is not None):
            self._data_balance_manager.add(
                cols_of_interest=self.categorical_features)

    def _validate_rai_insights_input_parameters(
            self,
            model: Any,
            train: pd.DataFrame,
            test: pd.DataFrame,
            target_column: str,
            task_type: str,
            classes: np.ndarray,
            serializer,
            feature_metadata: FeatureMetadata):
        """Validate the inputs for the RAIInsights constructor.

        :param model: The model to compute RAI insights for.
            A model that implements sklearn-style predict or predict_proba
            or a function that accepts a 2d ndarray.
        :type model: object
        :param train: The training dataset including the label column.
        :type train: pandas.DataFrame
        :param test: The test dataset including the label column.
        :type test: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: The task to run, can be `classification` or
            `regression`.
        :type task_type: str
        :param classes: The class labels in the training dataset
        :type classes: numpy.ndarray
        :param serializer: Picklable custom serializer with save and load
            methods defined for model that is not serializable. The save
            method returns a dictionary state and load method returns the
            model.
        :type serializer: object
        :param feature_metadata: Feature metadata for the train/test
            dataset to identify various kinds of features in the dataset.
        :type feature_metadata: FeatureMetadata
        """

        valid_tasks = [
            ModelTask.CLASSIFICATION.value,
            ModelTask.REGRESSION.value,
            ModelTask.FORECASTING.value
        ]
        if task_type not in valid_tasks:
            message = (f"Unsupported task type '{task_type}'. "
                       f"Should be one of {valid_tasks}")
            raise UserConfigValidationException(message)

        if model is None:
            warnings.warn(
                'INVALID-MODEL-WARNING: No valid model is supplied. '
                'The explanations, error analysis and counterfactuals '
                'may not work')
            if serializer is not None:
                raise UserConfigValidationException(
                    'No valid model is specified but model '
                    'serializer provided.')

        if serializer is not None:
            if not hasattr(serializer, 'save'):
                raise UserConfigValidationException(
                    'The serializer does not implement save()')

            if not hasattr(serializer, 'load'):
                raise UserConfigValidationException(
                    'The serializer does not implement load()')

            try:
                pickle.dumps(serializer)
            except Exception:
                raise UserConfigValidationException(
                    'The serializer should be serializable via pickle')

        if (not isinstance(train, pd.DataFrame) or
                not isinstance(test, pd.DataFrame)):
            raise UserConfigValidationException(
                "Unsupported data type for either train or test. "
                "Expecting pandas DataFrame for train and test."
            )

        if len(train) <= 0 or len(test) <= 0:
            raise UserConfigValidationException(
                'Either of the train/test are empty. '
                'Please provide non-empty dataframes for train '
                'and test sets.'
            )

        if (len(set(train.columns) - set(test.columns)) != 0 or
                len(set(test.columns) - set(train.columns)) != 0):
            raise UserConfigValidationException(
                'The features in train and test data do not match')

        if (target_column not in list(train.columns) or
                target_column not in list(test.columns)):
            raise UserConfigValidationException(
                f'Target name {target_column} not present in train/test data')

        categorical_features = self.categorical_features
        if (categorical_features is not None and
                len(categorical_features) > 0):
            if target_column in categorical_features:
                raise UserConfigValidationException(
                    'Found target name {0} in '
                    'categorical feature list'.format(
                        target_column)
                )

            difference_set = set(categorical_features) - set(
                train.drop(columns=[target_column]).columns)
            if len(difference_set) > 0:
                message = ("Feature names in categorical_features "
                           "do not exist in train data: "
                           f"{list(difference_set)}")
                raise UserConfigValidationException(message)

            for column in categorical_features:
                try:
                    np.unique(train[column])
                except Exception:
                    raise UserConfigValidationException(
                        f"Error finding unique values in column {column}. "
                        "Please check your train data.")

                try:
                    np.unique(test[column])
                except Exception:
                    raise UserConfigValidationException(
                        f"Error finding unique values in column {column}. "
                        "Please check your test data.")

        train_features = train.drop(columns=[target_column]).columns
        numeric_features = train.drop(
            columns=[target_column]).select_dtypes(
                include='number').columns.tolist()
        string_features_set = set(train_features) - set(numeric_features)
        if (task_type == ModelTask.FORECASTING and
                feature_metadata is not None and
                feature_metadata.time_column_name is not None):
            string_features_set.remove(feature_metadata.time_column_name)
        non_categorical_string_columns = \
            string_features_set - set(categorical_features)
        if len(non_categorical_string_columns) > 0:
            raise UserConfigValidationException(
                "The following string features were not "
                "identified as categorical features: "
                f"{non_categorical_string_columns}")

        if classes is not None and task_type == ModelTask.CLASSIFICATION:
            if (len(set(train[target_column].unique()) -
                    set(classes)) != 0 or
                    len(set(classes) -
                        set(train[target_column].unique())) != 0):
                raise UserConfigValidationException(
                    'The train labels and distinct values in '
                    'target (train data) do not match')

            if (len(set(test[target_column].unique()) -
                    set(classes)) != 0 or
                    len(set(classes) -
                        set(test[target_column].unique())) != 0):
                raise UserConfigValidationException(
                    'The train labels and distinct values in '
                    'target (test data) do not match')

        if feature_metadata is not None:
            if not isinstance(feature_metadata, FeatureMetadata):
                raise UserConfigValidationException(
                    "Expecting type FeatureMetadata but got {0}".format(
                        type(feature_metadata)))

            feature_names = list(train.columns)
            feature_metadata.validate(feature_names)
            if task_type == ModelTask.FORECASTING:
                self._ensure_time_column_available(
                    feature_metadata, feature_names, model)

        if model is not None:
            # Pick one row from train and test data
            small_train_data = train[0:1]
            small_test_data = test[0:1]
            has_dropped_features = False
            if len(feature_metadata.dropped_features or []) != 0:
                has_dropped_features = True
                small_train_data = small_train_data.drop(
                    columns=feature_metadata.dropped_features, axis=1)
                small_test_data = small_test_data.drop(
                    columns=feature_metadata.dropped_features, axis=1)

            small_train_data = small_train_data.drop(
                columns=[target_column], axis=1)
            small_test_data = small_test_data.drop(
                columns=[target_column], axis=1)
            # TODO The following error doesn't make sense for forecasting.
            # Make sure to add a test case for this.
            if (len(small_train_data.columns) == 0 or
                    len(small_test_data.columns) == 0):
                if has_dropped_features:
                    raise UserConfigValidationException(
                        'All features have been dropped from the dataset.'
                        ' Please do not drop all the features.'
                    )
                else:
                    raise UserConfigValidationException(
                        'There is no feature in the dataset. Please make '
                        'sure that your dataset contains at least '
                        'one feature.'
                    )

            # Ensure that the model has the required methods and that they
            # do not change the input data.
            self._ensure_model_outputs(input_data=small_train_data)
            self._ensure_model_outputs(input_data=small_test_data)

            if task_type == ModelTask.REGRESSION:
                if hasattr(model, SKLearn.PREDICT_PROBA):
                    raise UserConfigValidationException(
                        'The regression model provided has a predict_proba '
                        'function. Please check the task_type.')

    def _wrap_model_if_needed(self):
        """Wrap the model in a compatible format if needed."""
        if self.task_type == ModelTask.FORECASTING:
            # Wrap model to make forecasting API compatible.
            # Detect if the model is from AzureML as a special case.
            module = inspect.getmodule(self.model)
            module_name = module.__name__.partition('.')[0]
            model_package = sys.modules[module_name].__package__
            if model_package == "azureml":

                def forecast(forecasting_model, X):
                    # AzureML forecasting models return a tuple of
                    # (forecast, data) but we only want to return the actual
                    # forecast.
                    return forecasting_model.forecast(X)[0]

                def forecast_quantiles(forecasting_model, X, quantiles=None):
                    # AzureML forecasting models don't take quantiles as an
                    # argument but instead need to have it set on the model
                    # object.
                    if quantiles is None:
                        quantiles = [0.025, 0.975]
                    if (type(quantiles) == list and len(quantiles) > 0 and
                            all([type(q) == float and q > 0 and
                                 q < 1 for q in quantiles])):
                        forecasting_model.quantiles = quantiles
                        return forecasting_model.forecast_quantiles(X)
                    else:
                        raise ValueError(
                            "quantiles must be a list of floats between "
                            "0 and 1.")
                wrapper = ForecastingWrapper(
                    lambda X: forecast(self.model, X),
                    lambda X, quantiles:
                        forecast_quantiles(self.model, X, quantiles))
                self.model = wrapper

    def _validate_features_same(self, features_before,
                                train_data, function):
        """
        Validate the features are unmodified on the DataFrame.

        :param sfeatures_before: The features saved before
            an operation was performed.
        :type features_before: list[str]
        :param train_data: The DataFrame after the operation.
        :type train_data: pandas.DataFrame
        :param function: The name of the operation performed.
        :type function: str
        """
        exc_msg = (f'Calling model {function} function modifies input dataset'
                   f' features. Please check if {function} function is '
                   'defined correctly.')
        features_after = list(train_data.columns)
        if (len(features_before) != len(features_after) or
                (features_before != features_after).any()):
            raise UserConfigValidationException(exc_msg)

    def _ensure_time_column_available(
            self,
            feature_metadata: FeatureMetadata,
            feature_names: List[str],
            model: Optional[Any]):
        """Ensure that a time column is available from metadata or model.

        Some models have the time column name stored as an attribute
        in which case we can extract it directly without requiring users
        to explicitly specify the time column.

        :param feature_metadata: the feature metadata object
        :type feature_metadata: FeatureMetadata
        :param feature_names: the names of all features of the dataset
        :type feature_names: List[str]
        :param model: the model
        :type model: object
        """
        fm_time_column = feature_metadata.time_column_name
        model_time_column = getattr(model, "time_column_name", None)

        # goal: set time column in feature metadata
        if model_time_column is None:
            if fm_time_column is not None:
                return
            else:
                raise UserConfigValidationException(
                    'There was no time column name in feature metadata. '
                    'A time column is required for forecasting.')
        else:
            if fm_time_column is None:
                if model_time_column in feature_names:
                    feature_metadata.time_column_name = model_time_column
                    self._feature_metadata = feature_metadata
                    return
                else:
                    raise UserConfigValidationException(
                        'The provided model expects a time column named '
                        f'{model_time_column} that is not present in the '
                        'provided dataset.')
            else:
                # both time columns were provided, ensure that they match
                if fm_time_column != model_time_column:
                    raise UserConfigValidationException(
                        f'The provided time column name {fm_time_column} '
                        "does not match the model's expected time column "
                        f'name {model_time_column}.')

    @property
    def causal(self) -> CausalManager:
        """Get the causal manager.
        :return: The causal manager.
        :rtype: CausalManager
        """
        return self._causal_manager

    @property
    def counterfactual(self) -> CounterfactualManager:
        """Get the counterfactual manager.
        :return: The counterfactual manager.
        :rtype: CounterfactualManager
        """
        return self._counterfactual_manager

    @property
    def error_analysis(self) -> ErrorAnalysisManager:
        """Get the error analysis manager.
        :return: The error analysis manager.
        :rtype: ErrorAnalysisManager
        """
        return self._error_analysis_manager

    @property
    def explainer(self) -> ExplainerManager:
        """Get the explainer manager.
        :return: The explainer manager.
        :rtype: ExplainerManager
        """
        return self._explainer_manager

    def get_filtered_test_data(self, filters, composite_filters,
                               include_original_columns_only=False,
                               use_entire_test_data=False):
        """Get the filtered test data based on cohort filters.

        :param filters: The filters to apply.
        :type filters: list[Filter]
        :param composite_filters: The composite filters to apply.
        :type composite_filters: list[CompositeFilter]
        :param include_original_columns_only: Whether to return the original
                                              data columns.
        :type include_original_columns_only: bool
        :param use_entire_test_data: Whether to use entire test set for
                                     filtering the data based on cohort.
        :type use_entire_test_data: bool
        :return: The filtered test data.
        :rtype: pandas.DataFrame
        """
        large = use_entire_test_data and self._large_test is not None
        pred_y = getattr(
            self,
            self._get_model_output_name(purpose=MethodPurpose.PREDICTION,
                                        large=large))
        if large:
            test_data = self._large_test
            true_y = self._large_test[self.target_column]
        else:
            test_data = self.test
            true_y = self.test[self.target_column]

        X_test = test_data.drop(columns=[self.target_column])
        filter_data_with_cohort = FilterDataWithCohortFilters(
            model=self.model,
            dataset=X_test,
            features=X_test.columns,
            categorical_features=self.categorical_features,
            categories=self._categories,
            true_y=true_y,
            pred_y=pred_y,
            model_task=self.task_type,
            classes=self._classes)

        return filter_data_with_cohort.filter_data_from_cohort(
            filters=filters,
            composite_filters=composite_filters,
            include_original_columns_only=include_original_columns_only)

    def get_data(self):
        """Get all data as RAIInsightsData object

        :return: Model Analysis Data
        :rtype: RAIInsightsData
        """
        data = RAIInsightsData()
        data.dataset = self._get_dataset()
        data.modelExplanationData = self.explainer.get_data()
        data.errorAnalysisData = self.error_analysis.get_data()
        data.causalAnalysisData = self.causal.get_data()
        data.counterfactualData = self.counterfactual.get_data()
        return data

    def _get_dataset(self):
        dashboard_dataset = Dataset()
        dashboard_dataset.task_type = self.task_type
        dashboard_dataset.categorical_features = self.categorical_features
        dashboard_dataset.class_names = convert_to_list(
            self._classes)
        dashboard_dataset.is_large_data_scenario = \
            True if self._large_test is not None else False
        dashboard_dataset.use_entire_test_data = False

        if self._feature_metadata is not None:
            dashboard_dataset.feature_metadata = \
                self._feature_metadata.to_dict()
        else:
            dashboard_dataset.feature_metadata = None

        dashboard_dataset.data_balance_measures = \
            self._data_balance_manager.get_data()

        predicted_y = None
        feature_length = None

        dataset: pd.DataFrame = self.test.drop(
            [self.target_column], axis=1)

        if isinstance(dataset, pd.DataFrame) and hasattr(dataset, 'columns'):
            self._dataframeColumns = dataset.columns
        try:
            list_dataset = convert_to_list(dataset)
        except Exception as ex:
            raise ValueError("Unsupported dataset type") from ex
        if dataset is not None and self.model is not None:
            try:
                predict_dataset = dataset
                metadata = self._feature_metadata
                metadata_exists = metadata is not None
                dropped_features_exist = metadata_exists and \
                    metadata.dropped_features is not None
                if (dropped_features_exist and
                        len(metadata.dropped_features) != 0):
                    predict_dataset = predict_dataset.drop(
                        metadata.dropped_features, axis=1)
                    predicted_y = self._get_model_output(
                        predict_dataset, purpose=MethodPurpose.PREDICTION)
            except Exception as ex:
                model_method = self._get_model_method(
                    purpose=MethodPurpose.PREDICTION)
                raise ValueError(
                    f"Model does not support {model_method.__name__} method "
                    "for the given dataset type,") from ex
            try:
                predicted_y = convert_to_list(predicted_y)
            except Exception as ex:
                raise ValueError(
                    "Model prediction output of unsupported type,") from ex
        if predicted_y is not None:
            if (self.task_type == ModelTask.CLASSIFICATION and
                    dashboard_dataset.class_names is not None):
                predicted_y = [dashboard_dataset.class_names.index(
                    y) for y in predicted_y]
            dashboard_dataset.predicted_y = predicted_y

        row_length = 0
        if list_dataset is not None:
            row_length, feature_length = np.shape(list_dataset)
            if row_length > 100000:
                raise ValueError(
                    "Exceeds maximum number of rows"
                    "for visualization (100000)")
            if feature_length > 1000:
                raise ValueError("Exceeds maximum number of features for"
                                 " visualization (1000). Please regenerate the"
                                 " explanation using fewer features or"
                                 " initialize the dashboard without passing a"
                                 " dataset.")
            dashboard_dataset.features = list_dataset

        true_y = self.test[self.target_column]
        if self.task_type == ModelTask.FORECASTING:
            try:
                dashboard_dataset.index = convert_to_list(
                    pd.to_datetime(
                        self.test[self._feature_metadata.time_column_name])
                    .apply(lambda dt: dt.strftime("%Y-%m-%dT%H:%M:%SZ")))
            except Exception as ex:
                raise ValueError(
                    "The time column should be parseable by "
                    "pandas.to_datetime, ideally in ISO format,") from ex

        if true_y is not None and len(true_y) == row_length:
            if (self.task_type == "classification" and
               dashboard_dataset.class_names is not None):
                true_y = [dashboard_dataset.class_names.index(
                    y) for y in true_y]
            dashboard_dataset.true_y = convert_to_list(true_y)

        features = dataset.columns

        if features is not None:
            features = convert_to_list(features)
            if feature_length is not None and len(features) != feature_length:
                raise ValueError("Feature vector length mismatch:"
                                 " feature names length differs"
                                 " from local explanations dimension")
            dashboard_dataset.feature_names = features
        dashboard_dataset.target_column = self.target_column

        model_method = self._get_model_method(
            purpose=MethodPurpose.PROBABILITY)
        if model_method is not None and dataset is not None:
            try:
                predict_dataset = dataset
                metadata = self._feature_metadata
                metadata_exists = metadata is not None
                dropped_features_exist = metadata_exists and \
                    metadata.dropped_features is not None
                if (dropped_features_exist and
                        len(metadata.dropped_features) != 0):
                    predict_dataset = predict_dataset.drop(
                        metadata.dropped_features, axis=1)
                probability_y = model_method(predict_dataset)
            except Exception as ex:
                raise ValueError(
                    f"Model does not support {model_method.__name__} method"
                    " for given dataset type,") from ex
            try:
                probability_y = convert_to_list(probability_y)
            except Exception as ex:
                raise ValueError(
                    f"Model {model_method.__name__} "
                    "output of unsupported type,") from ex
            dashboard_dataset.probability_y = probability_y

        return dashboard_dataset

    def _save_predictions(self, path):
        """Save the predictions to files.

        :param path: The directory path to save the RAIInsights to.
        :type path: str
        """
        prediction_output_path = (
            Path(path) /
            SerializationAttributes.PREDICTIONS_DIRECTORY)
        prediction_output_path.mkdir(parents=True, exist_ok=True)

        if self.model is None:
            return

        for data_name, file_name in _DATA_TO_FILE_MAPPING.items():
            if (data_name in self.__dict__ and
                    self.__dict__[data_name] is not None):
                self._write_to_file(
                    prediction_output_path / file_name,
                    json.dumps(self.__dict__[data_name].tolist()))

    def _save_large_data(self, path):
        """Save the large data.

        :param path: The directory path to save the RAIInsights to.
        :type path: str
        """
        if self._large_test is not None:
            # Save large test data
            large_test_path = (
                Path(path) /
                SerializationAttributes.DATA_DIRECTORY /
                SerializationAttributes.LARGE_TEST_JSON)
            self._write_to_file(
                large_test_path,
                self._large_test.to_json(orient='split'))

    def _save_metadata(self, path):
        """Save the metadata like target column, categorical features,
           task type and the classes (if any).

        :param path: The directory path to save the RAIInsights to.
        :type path: str
        """
        top_dir = Path(path)
        classes = convert_to_list(self._classes)
        feature_metadata_dict = None
        if self._feature_metadata is not None:
            feature_metadata_dict = self._feature_metadata.to_dict()
        meta = {
            Metadata.TARGET_COLUMN: self.target_column,
            Metadata.TASK_TYPE: self.task_type,
            Metadata.CATEGORICAL_FEATURES: self.categorical_features,
            Metadata.CLASSES: classes,
            Metadata.FEATURE_COLUMNS: self._feature_columns,
            Metadata.FEATURE_RANGES: self._feature_ranges,
            Metadata.FEATURE_METADATA: feature_metadata_dict
        }
        with open(top_dir / Metadata.META_JSON, 'w') as file:
            json.dump(meta, file)

    def save(self, path):
        """Save the RAIInsights to the given path.

        :param path: The directory path to save the RAIInsights to.
        :type path: str
        """
        super(RAIInsights, self).save(path)
        self._save_large_data(path)

    def _get_model_method(self, *, purpose: MethodPurpose):
        """Get the model's method for the indicated purpose.

        :param purpose: the purpose to identify suitable model methods
        :type purpose: MethodPurpose
        :return: the model's first method with the corresponding purpose
            if any, otherwise None
        :rtype: Union[None, Any]
        """
        methods = [m for m in MODEL_METHODS[self.task_type]
                   if m.purpose == purpose]
        if len(methods) == 0:
            return None
        return getattr(self.model, methods[0].name)

    def _get_model_output(self, *, input_data: Union[None, np.array],
                          purpose: MethodPurpose):
        """Get the output from a model method.

        The model method is chosen based on the specified purpose

        :param input_data: the data to pass to the model
        :type input_data: Union[pd.DataFrame, np.array]
        :param purpose: the purpose to identify suitable model methods
        :type purpose: MethodPurpose
        :return: the model output if a suitable method exists, otherwise None
        :rtype: Union[None, np.array]
        """
        model_method = self._get_model_method(purpose)
        if model_method:
            return model_method(input_data)
        return None

    def _ensure_model_outputs(self, *, input_data):
        """Ensure that the model outputs are as expected.

        Raises an UserConfigValidationException if the model does not have the
        expected required methods, fails while calling any of its methods, or
        changes the input features.

        :param input_data: the data to pass to the model
        :type input_data: Union[pd.DataFrame, np.array]
        """
        input_features = input_data.columns
        for method in MODEL_METHODS[self.task_type]:
            if not hasattr(self.model, method.name) and not method.optional:
                raise UserConfigValidationException(
                    _MODEL_METHOD_EXCEPTION_MESSAGE.format(method.name))
            try:
                model_method = getattr(self.model, method.name)
                model_method(input_data)
            except Exception:
                raise UserConfigValidationException(
                    _MODEL_METHOD_EXCEPTION_MESSAGE.format(method.name))
            self._validate_features_same(input_features, input_data,
                                         method.name)

    def _get_model_output_name(self, *, purpose, large=False):
        """Get the name of the attribute representing the model's output.

        :param purpose: the purpose to identify suitable model methods
        :type purpose: MethodPurpose
        :param large: whether or not the output is based on a large (full)
            dataset
        :type large: boolean
        :return: the attribute's name
        :rtype: str
        """
        model_method = self._get_model_method(purpose=purpose)
        return f"_{'large_' if large else ''}{model_method.__name__}_output"

    def _set_model_output(self, *, model_method, input_data, large=False):
        """Store the model output on a suitable field.

        :param model_method: the method to use to produce the model output
        :type model_method: ModelMethod
        :param input_data: the data to pass to the model
        :type input_data: Union[pd.DataFrame, np.array]
        :param large: whether or not the output is based on a large (full)
            dataset
        :type large: boolean
        """
        field_name = f"_{'large_' if large else ''}{model_method.name}_output"
        try:
            method = getattr(self.model, model_method.name)
        except AttributeError as err:
            if model_method.optional:
                setattr(self, field_name, None)
                return
            else:
                raise ValueError(
                    f"The model is expected to have a {model_method.name} "
                    "method,") from err
        setattr(self, field_name, method(input_data))

    def _set_model_outputs(self, *, input_data, large=False):
        """Store all model outputs on suitable fields.

        :param input_data: the data to pass to the model
        :type input_data: Union[pd.DataFrame, np.array]
        :param large: whether or not the output is based on a large (full)
            dataset
        :type large: boolean
        """
        for model_method in MODEL_METHODS[self.task_type]:
            self._set_model_output(
                model_method=model_method,
                input_data=input_data,
                large=large)

    @staticmethod
    def _get_feature_ranges(test, categorical_features, feature_columns,
                            time_column_name):
        """Get feature ranges like min, max and unique values
        for all columns"""
        result = []
        for col in feature_columns:
            res_object = {}
            res_object[_COLUMN_NAME] = col
            if (col in categorical_features):
                unique_value = test[col].unique()
                res_object[_RANGE_TYPE] = "categorical"
                res_object[_UNIQUE_VALUES] = unique_value.tolist()
            elif (col == time_column_name):
                res_object[_RANGE_TYPE] = "datetime"
                res_object[_MIN_VALUE] = test[col].min()
                res_object[_MAX_VALUE] = test[col].max()
            else:
                min_value = float(test[col].min())
                max_value = float(test[col].max())
                res_object[_RANGE_TYPE] = "integer"
                res_object[_MIN_VALUE] = min_value
                res_object[_MAX_VALUE] = max_value
            result.append(res_object)
        return result

    @staticmethod
    def _load_metadata(inst, path):
        """Load the metadata.

        :param inst: RAIInsights object instance.
        :type inst: RAIInsights
        :param path: The directory path to metadata location.
        :type path: str
        """
        top_dir = Path(path)
        with open(top_dir / Metadata.META_JSON, 'r') as meta_file:
            meta = meta_file.read()
        meta = json.loads(meta)
        inst.__dict__[Metadata.TARGET_COLUMN] = meta[Metadata.TARGET_COLUMN]
        inst.__dict__[Metadata.TASK_TYPE] = meta[Metadata.TASK_TYPE]
        inst.__dict__[Metadata.CATEGORICAL_FEATURES] = \
            meta[Metadata.CATEGORICAL_FEATURES]
        classes = None
        if _TRAIN_LABELS in meta:
            classes = meta[_TRAIN_LABELS]
        else:
            classes = meta[Metadata.CLASSES]

        inst.__dict__['_' + Metadata.CLASSES] = RAIInsights._get_classes(
            task_type=meta[Metadata.TASK_TYPE],
            train=inst.__dict__[Metadata.TRAIN],
            target_column=meta[Metadata.TARGET_COLUMN],
            classes=classes
        )

        inst.__dict__['_' + Metadata.FEATURE_COLUMNS] = \
            meta[Metadata.FEATURE_COLUMNS]
        inst.__dict__['_' + Metadata.FEATURE_RANGES] = \
            meta[Metadata.FEATURE_RANGES]
        if (Metadata.FEATURE_METADATA not in meta or
                meta[Metadata.FEATURE_METADATA] is None):
            inst.__dict__['_' + Metadata.FEATURE_METADATA] = \
                FeatureMetadata()
        else:
            inst.__dict__['_' + Metadata.FEATURE_METADATA] = FeatureMetadata(
                identity_feature_name=meta[Metadata.FEATURE_METADATA][
                    'identity_feature_name'],
                time_column_name=meta[Metadata.FEATURE_METADATA][
                    'time_column_name'],
                categorical_features=meta[Metadata.FEATURE_METADATA][
                    'categorical_features'],
                dropped_features=meta[Metadata.FEATURE_METADATA][
                    'dropped_features'],)

        all_features_names = inst.__dict__['_' + Metadata.FEATURE_COLUMNS]
        categorical_features = inst.__dict__[Metadata.CATEGORICAL_FEATURES]
        dataset = inst.__dict__[Metadata.TEST].drop(
            columns=[inst.__dict__[Metadata.TARGET_COLUMN]])
        inst.__dict__['_' + Metadata.CATEGORIES], \
            inst.__dict__['_' + Metadata.CATEGORICAL_INDEXES], \
            inst.__dict__['_' + Metadata.CATEGORY_DICTIONARY], \
            inst.__dict__['_' + Metadata.STRING_IND_DATA] = \
            process_categoricals(
                all_feature_names=all_features_names,
                categorical_features=categorical_features,
                dataset=dataset)

    @staticmethod
    def _load_predictions(inst, path):
        """Load the predictions.

        :param inst: RAIInsights object instance.
        :type inst: RAIInsights
        :param path: The directory path to data location.
        :type path: str
        """
        if inst.__dict__[_MODEL] is None:
            for data_name in list(_DATA_TO_FILE_MAPPING.keys()):
                inst.__dict__[data_name] = None
            return

        prediction_output_path = (
            Path(path) /
            SerializationAttributes.PREDICTIONS_DIRECTORY)

        for data_name, file_name in _DATA_TO_FILE_MAPPING.items():
            file_path = prediction_output_path / file_name
            if file_path.exists():
                with open(file_path, 'r') as file:
                    inst.__dict__[data_name] = np.array(json.load(file))
            else:
                inst.__dict__[data_name] = None

    @staticmethod
    def _load_large_data(inst, path):
        """Load the large test data.

        :param inst: RAIInsights object instance.
        :type inst: RAIInsights
        :param path: The directory path to data location.
        :type path: str
        """
        large_test_path = (
            Path(path) /
            SerializationAttributes.DATA_DIRECTORY /
            SerializationAttributes.LARGE_TEST_JSON)
        if large_test_path.exists():
            data_directory = (
                Path(path) /
                SerializationAttributes.DATA_DIRECTORY)
            with open(
                data_directory / (
                    Metadata.TEST + 'dtypes' + FileFormats.JSON),
                    'r') as file:
                types = json.load(file)
            with open(large_test_path, 'r') as file:
                inst.__dict__["_large_test"] = \
                    pd.read_json(file, dtype=types, orient='split')
        else:
            inst.__dict__["_large_test"] = None

    @staticmethod
    def load(path):
        """Load the RAIInsights from the given path.

        :param path: The directory path to load the RAIInsights from.
        :type path: str
        :return: The RAIInsights object after loading.
        :rtype: RAIInsights
        """
        # create the RAIInsights without any properties using the __new__
        # function, similar to pickle
        inst = RAIInsights.__new__(RAIInsights)

        manager_map = {
            ManagerNames.CAUSAL: CausalManager,
            ManagerNames.COUNTERFACTUAL: CounterfactualManager,
            ManagerNames.DATA_BALANCE: DataBalanceManager,
            ManagerNames.ERROR_ANALYSIS: ErrorAnalysisManager,
            ManagerNames.EXPLAINER: ExplainerManager,
        }

        # load current state
        RAIBaseInsights._load(path, inst, manager_map,
                              RAIInsights._load_metadata)
        RAIInsights._load_predictions(inst, path)
        RAIInsights._load_large_data(inst, path)

        return inst
