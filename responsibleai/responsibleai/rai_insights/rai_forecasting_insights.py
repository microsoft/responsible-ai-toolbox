# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the RAIForecastingInsights class."""

import json
import pickle
import warnings
from pathlib import Path
from typing import Any, List, Optional

import numpy as np
import pandas as pd

from erroranalysis._internal.cohort_filter import FilterDataWithCohortFilters
from erroranalysis._internal.process_categoricals import process_categoricals
from raiutils.data_processing import convert_to_list
from raiutils.models import SKLearn, is_classifier
from responsibleai._interfaces import Dataset, RAIForecastingInsightsData
from responsibleai._internal.constants import ManagerNames, Metadata
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.feature_metadata import FeatureMetadata
from responsibleai.managers.data_balance_manager import DataBalanceManager
from responsibleai.rai_insights.rai_base_insights import RAIBaseInsights

_PREDICTIONS = 'predictions'
_TRAIN = 'train'
_TEST = 'test'
_TARGET_COLUMN = 'target_column'
_TASK_TYPE = 'task_type'
_CLASSES = 'classes'
_FEATURE_COLUMNS = 'feature_columns'
_FEATURE_METADATA = 'feature_metadata'
_FEATURE_RANGES = 'feature_ranges'
_CATEGORICAL_FEATURES = 'categorical_features'
_CATEGORIES = 'categories'
_CATEGORY_DICTIONARY = 'category_dictionary'
_CATEGORICAL_INDEXES = 'categorical_indexes'
_STRING_IND_DATA = 'string_ind_data'
_META_JSON = Metadata.META_JSON
_TRAIN_LABELS = 'train_labels'
_JSON_EXTENSION = '.json'
_PREDICT = 'predict'
_PREDICT_PROBA = 'predict_proba'
_PREDICT_OUTPUT = 'predict_output'
_PREDICT_PROBA_OUTPUT = 'predict_proba_output'
_COLUMN_NAME = 'column_name'
_RANGE_TYPE = 'range_type'
_UNIQUE_VALUES = 'unique_values'
_MIN_VALUE = 'min_value'
_MAX_VALUE = 'max_value'
_MODEL = "model"


class RAIForecastingInsights(RAIBaseInsights):
    """Defines the top-level Model Analysis API.
    Use RAIForecastingInsights to analyze errors, explain the most important
    features, compute counterfactuals and run causal analysis in a
    single API.
    """

    # take in also grain columns
    def __init__(self, model: Optional[Any], train: pd.DataFrame,
                 test: pd.DataFrame, target_column: str,
                 serializer: Optional[Any] = None,
                 maximum_rows_for_test: int = 5000,
                 feature_metadata: Optional[FeatureMetadata] = None):
        """Creates an RAIForecastingInsights object.
        :param model: The model to compute RAI insights for.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param train: The training dataset including the label column.
        :type train: pandas.DataFrame
        :param test: The test dataset including the label column.
        :type test: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
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
        self._is_true_y_present = self._check_true_y_present(target_column, test)
        self._feature_metadata = feature_metadata or FeatureMetadata()
        self.task_type = "forecasting"
        self._validate_rai_insights_input_parameters(
            model=model, train=train, test=test,
            target_column=target_column,
            serializer=serializer,
            maximum_rows_for_test=maximum_rows_for_test,
            feature_metadata=feature_metadata)
        self._classes = None
        self._test_without_true_y = test if not self._is_true_y_present \
            else test.drop(columns=[target_column])

        self._feature_columns = self._test_without_true_y.columns.tolist()

        self._feature_ranges = RAIForecastingInsights._get_feature_ranges(
            test=test, categorical_features=self._feature_metadata.categorical_features or [],
            feature_columns=self._feature_columns)
            

        self._categories, self._categorical_indexes, \
            self._category_dictionary, self._string_ind_data = \
            process_categoricals(
                all_feature_names=self._feature_columns,
                categorical_features=self._feature_metadata.categorical_features or [],
                dataset=self._test_without_true_y)

        self.datetime_index = test.index

        super(RAIForecastingInsights, self).__init__(
            model, train, test, target_column, self.task_type,
            serializer)

        if model is not None:
            # Cache predictions of the model
            self.predict_output = model.predict(
                self._test_without_true_y)
            if hasattr(model, SKLearn.PREDICT_PROBA):
                self.predict_proba_output = model.predict_proba(
                    self._test_without_true_y)
            else:
                self.predict_proba_output = None
        else:
            self.predict_output = None
            self.predict_proba_output = None

    def _check_true_y_present(self, target_column, test):
        return target_column in list(test.columns)

    def _initialize_managers(self):
        """Initializes the managers.

        Initialized the causal, counterfactual, error analysis
        and explainer managers.
        """

        # self._causal_manager = CausalManager(
        #     self.train, self.test, self.target_column,
        #     self.task_type, self.categorical_features)

        # self._counterfactual_manager = CounterfactualManager(
        #     model=self.model, train=self.train, test=self.test,
        #     target_column=self.target_column, task_type=self.task_type,
        #     categorical_features=self.categorical_features)

        self._data_balance_manager = DataBalanceManager(
            train=self.train, test=self.test, target_column=self.target_column,
            classes=self._classes, task_type=self.task_type)

        # self._error_analysis_manager = ErrorAnalysisManager(
        #     self.model, self.test, self.target_column,
        #     self._classes,
        #     self.categorical_features)

        # self._explainer_manager = ExplainerManager(
        #     self.model, self.train, self.test,
        #     self.target_column,
        #     self._classes,
        #     categorical_features=self.categorical_features)

        self._managers = [
            # self._causal_manager,
                        #   self._counterfactual_manager,
                          self._data_balance_manager,
                        #   self._error_analysis_manager,
                        #   self._explainer_manager
                          ]

    def _validate_rai_insights_input_parameters(
            self, model: Any, train: pd.DataFrame, test: pd.DataFrame,
            target_column: str,
            serializer,
            maximum_rows_for_test: int,
            feature_metadata: Optional[FeatureMetadata] = None):
        """Validate the inputs for the RAIForecastingInsights constructor.

        :param model: The model to compute RAI insights for.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
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
        :param maximum_rows_for_test: Limit on size of test data
            (for performance reasons)
        :type maximum_rows_for_test: int
        :param feature_metadata: Feature metadata for the train/test
                                 dataset to identify different kinds
                                 of features in the dataset.
        :type feature_metadata: FeatureMetadata
        """

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

        if isinstance(train, pd.DataFrame) and isinstance(test, pd.DataFrame):
            if len(train) <= 0 or len(test) <= 0:
                raise UserConfigValidationException(
                    'Either of the train/test are empty. '
                    'Please provide non-empty dataframes for train '
                    'and test sets.'
                )
            if test.shape[0] > maximum_rows_for_test:
                msg_fmt = 'The test data has {0} rows, ' +\
                    'but limit is set to {1} rows. ' +\
                    'Please resample the test data or ' +\
                    'adjust maximum_rows_for_test'
                raise UserConfigValidationException(
                    msg_fmt.format(
                        test.shape[0], maximum_rows_for_test)
                )

            if (len(set(train.columns) - set(test.columns)) != 0 or \
                    len(set(test.columns) - set(train.columns)) != 0) and \
                        self._is_true_y_present:
                raise UserConfigValidationException(
                    'The features in train and test data do not match')

            if target_column not in list(train.columns):
                raise UserConfigValidationException(
                    'Target name {0} not present in train data'.format(
                        target_column)
                )

            categorical_features = feature_metadata.categorical_features
            if categorical_features is not None and \
                    len(categorical_features) > 0:
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
                            "Error finding unique values in column {0}. "
                            "Please check your train data.".format(column)
                        )

                    try:
                        np.unique(test[column])
                    except Exception:
                        raise UserConfigValidationException(
                            "Error finding unique values in column {0}. "
                            "Please check your test data.".format(column)
                        )

            train_features = train.drop(columns=[target_column]).columns
            numeric_features = train.drop(
                columns=[target_column]).select_dtypes(
                    include='number').columns.tolist()
            string_features_set = set(train_features) - set(numeric_features)
            if len(string_features_set - set(categorical_features)) > 0:
                raise UserConfigValidationException(
                    "The following string features were not "
                    "identified as categorical features: {0}".format(
                        string_features_set - set(categorical_features))
                )

            if model is not None:
                # Pick one row from train and test data
                small_train_data = train.iloc[0:1].drop(
                    columns=[target_column])

                if self._is_true_y_present:
                    small_test_data = test.iloc[0:1].drop(
                        columns=[target_column])
                else:
                    small_test_data = test.iloc[0:1]

                small_train_features_before = list(small_train_data.columns)

                # Run predict() of the model
                try:
                    model.predict(small_train_data)
                    model.predict(small_test_data)
                except Exception:
                    raise UserConfigValidationException(
                        'The model passed cannot be used for'
                        ' getting predictions via predict()'
                    )
                self._validate_features_same(small_train_features_before,
                                             small_train_data,
                                             SKLearn.PREDICT)

                if hasattr(model, SKLearn.PREDICT_PROBA):
                    raise UserConfigValidationException(
                        'The regression model'
                        'provided has a predict_proba function. '
                        'Please check the task_type.')
        else:
            raise UserConfigValidationException(
                "Unsupported data type for either train or test. "
                "Expecting pandas DataFrame for train and test."
            )

        if feature_metadata is not None:
            if not isinstance(feature_metadata, FeatureMetadata):
                raise UserConfigValidationException(
                    "Expecting type FeatureMetadata but got {0}".format(
                        type(feature_metadata)))

            feature_metadata.validate_feature_metadata_with_user_features(
                list(train.columns))
            feature_metadata.validate_feature_metadata_with_time_series_id_column_names(
                test,
                train
            )

    def _validate_features_same(self, small_train_features_before,
                                small_train_data, function):
        """
        Validate the features are unmodified on the DataFrame.

        :param small_train_features_before: The features saved before
            an operation was performed.
        :type small_train_features_before: list[str]
        :param small_train_data: The DataFrame after the operation.
        :type small_train_data: pandas.DataFrame
        :param function: The name of the operation performed.
        :type function: str
        """
        small_train_features_after = list(small_train_data.columns)
        if small_train_features_before != small_train_features_after:
            raise UserConfigValidationException(
                ('Calling model {} function modifies '
                 'input dataset features. Please check if '
                 'predict function is defined correctly.').format(function)
            )

    # @property
    # def causal(self) -> CausalManager:
    #     """Get the causal manager.
    #     :return: The causal manager.
    #     :rtype: CausalManager
    #     """
    #     return self._causal_manager

    # @property
    # def counterfactual(self) -> CounterfactualManager:
    #     """Get the counterfactual manager.
    #     :return: The counterfactual manager.
    #     :rtype: CounterfactualManager
    #     """
    #     return self._counterfactual_manager

    # @property
    # def error_analysis(self) -> ErrorAnalysisManager:
    #     """Get the error analysis manager.
    #     :return: The error analysis manager.
    #     :rtype: ErrorAnalysisManager
    #     """
    #     return self._error_analysis_manager

    # @property
    # def explainer(self) -> ExplainerManager:
    #     """Get the explainer manager.
    #     :return: The explainer manager.
    #     :rtype: ExplainerManager
    #     """
    #     return self._explainer_manager

    def get_filtered_test_data(self, filters, composite_filters,
                               include_original_columns_only=False):
        """Get the filtered test data based on cohort filters.

        :param filters: The filters to apply.
        :type filters: list[Filter]
        :param composite_filters: The composite filters to apply.
        :type composite_filters: list[CompositeFilter]
        :param include_original_columns_only: Whether to return the original
                                              data columns.
        :type include_original_columns_only: bool
        :return: The filtered test data.
        :rtype: pandas.DataFrame
        """

        true_y = self.predict_output if not self._is_true_y_present else self.test[self.target_column]
        filter_data_with_cohort = FilterDataWithCohortFilters(
            model=self.model,
            dataset=self._test_without_true_y,
            features=self._test_without_true_y.columns,
            categorical_features=self._feature_metadata.categorical_features,
            categories=self._categories,
            true_y=true_y,
            pred_y=self.predict_output,
            model_task=self.task_type,
            classes=self._classes)

        return filter_data_with_cohort.filter_data_from_cohort(
            filters=filters,
            composite_filters=composite_filters,
            include_original_columns_only=include_original_columns_only)

    def get_data(self):
        """Get all data as RAIForecastingInsightsData object

        :return: Model Analysis Data
        :rtype: RAIForecastingInsightsData
        """
        data = RAIForecastingInsightsData()
        data.dataset = self._get_dataset()
        return data

    def _get_dataset(self):
        dashboard_dataset = Dataset()
        dashboard_dataset.task_type = self.task_type
        dashboard_dataset.categorical_features = self._feature_metadata.categorical_features or []
        dashboard_dataset.is_forecasting_true_y = self._is_true_y_present
        dashboard_dataset.class_names = convert_to_list(
            self._classes)

        if self._feature_metadata is not None:
            dashboard_dataset.feature_metadata = \
                self._feature_metadata.to_dict()
        else:
            dashboard_dataset.feature_metadata = None

        dashboard_dataset.data_balance_measures = \
            self._data_balance_manager.get_data()

        predicted_y = None
        feature_length = None

        dataset: pd.DataFrame = self._test_without_true_y

        if isinstance(dataset, pd.DataFrame) and hasattr(dataset, 'columns'):
            self._dataframeColumns = dataset.columns
        try:
            list_dataset = convert_to_list(dataset)
        except Exception as ex:
            raise ValueError(
                "Unsupported dataset type") from ex
        if dataset is not None and self.model is not None:
            try:
                predicted_y = self.model.predict(dataset)
            except Exception as ex:
                msg = "Model does not support predict method for given"
                "dataset type"
                raise ValueError(msg) from ex
            try:
                predicted_y = convert_to_list(predicted_y)
            except Exception as ex:
                raise ValueError(
                    "Model prediction output of unsupported type,") from ex

        if predicted_y is not None:
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

        # NOTICE THAT IT MUST BE %Y-%m-%d HERE, change this to be easier for the user
        dashboard_dataset.index = convert_to_list(self.test.index.strftime("%Y-%m-%d"))

        true_y = predicted_y if not self._is_true_y_present else self.test[self.target_column]

        if true_y is not None and len(true_y) == row_length:
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

        if is_classifier(self.model) and dataset is not None:
            try:
                probability_y = self.model.predict_proba(dataset)
            except Exception as ex:
                raise ValueError("Model does not support predict_proba method"
                                 " for given dataset type,") from ex
            try:
                probability_y = convert_to_list(probability_y)
            except Exception as ex:
                raise ValueError(
                    "Model predict_proba output of unsupported type,") from ex
            dashboard_dataset.probability_y = probability_y

        return dashboard_dataset

    def _save_predictions(self, path):
        """Save the predict() and predict_proba() output.

        :param path: The directory path to save the RAIForecastingInsights to.
        :type path: str
        """
        prediction_output_path = Path(path) / _PREDICTIONS
        prediction_output_path.mkdir(parents=True, exist_ok=True)

        if self.model is None:
            return

        self._write_to_file(
            prediction_output_path / (_PREDICT + _JSON_EXTENSION),
            json.dumps(self.predict_output.tolist()))

        if self.predict_proba_output is not None:
            self._write_to_file(
                prediction_output_path / (_PREDICT_PROBA + _JSON_EXTENSION),
                json.dumps(self.predict_proba_output.tolist()))

    def _save_metadata(self, path):
        """Save the metadata like target column, categorical features,
           task type and the classes (if any).

        :param path: The directory path to save the RAIForecastingInsights to.
        :type path: str
        """
        top_dir = Path(path)
        classes = convert_to_list(self._classes)
        feature_metadata_dict = None
        if self._feature_metadata is not None:
            feature_metadata_dict = self._feature_metadata.to_dict()
        meta = {
            _TARGET_COLUMN: self.target_column,
            _TASK_TYPE: self.task_type,
            _CLASSES: classes,
            _FEATURE_COLUMNS: self._feature_columns,
            _FEATURE_RANGES: self._feature_ranges,
            _FEATURE_METADATA: feature_metadata_dict
        }
        with open(top_dir / _META_JSON, 'w') as file:
            json.dump(meta, file)

    @staticmethod
    def _get_feature_ranges(test, categorical_features, feature_columns):
        """Get feature ranges like min, max and unique values
        for all columns"""
        result = []
        for col in feature_columns:
            res_object = {}
            if (col in categorical_features):
                unique_value = test[col].unique()
                res_object[_COLUMN_NAME] = col
                res_object[_RANGE_TYPE] = "categorical"
                res_object[_UNIQUE_VALUES] = unique_value.tolist()
            else:
                min_value = float(test[col].min())
                max_value = float(test[col].max())
                res_object[_COLUMN_NAME] = col
                res_object[_RANGE_TYPE] = "integer"
                res_object[_MIN_VALUE] = min_value
                res_object[_MAX_VALUE] = max_value
            result.append(res_object)
        return result

    @staticmethod
    def _load_metadata(inst, path):
        """Load the metadata.

        :param inst: RAIForecastingInsights object instance.
        :type inst: RAIForecastingInsights
        :param path: The directory path to metadata location.
        :type path: str
        """
        top_dir = Path(path)
        with open(top_dir / _META_JSON, 'r') as meta_file:
            meta = meta_file.read()
        meta = json.loads(meta)
        inst.__dict__[_TARGET_COLUMN] = meta[_TARGET_COLUMN]
        inst.__dict__[_TASK_TYPE] = meta[_TASK_TYPE]
        classes = None
        if _TRAIN_LABELS in meta:
            classes = meta[_TRAIN_LABELS]
        else:
            classes = meta[_CLASSES]

        inst.__dict__['_' + _CLASSES] = None

        inst.__dict__['_' + _FEATURE_COLUMNS] = meta[_FEATURE_COLUMNS]
        inst.__dict__['_' + _FEATURE_RANGES] = meta[_FEATURE_RANGES]
        if meta[_FEATURE_METADATA] is None:
            inst.__dict__['_' + _FEATURE_METADATA] = None
        else:
            inst.__dict__['_' + _FEATURE_METADATA] = FeatureMetadata(
                identity_feature_name=meta[_FEATURE_METADATA][
                    'identity_feature_name'],
                datetime_features=meta[_FEATURE_METADATA][
                    'datetime_features'],
                categorical_features=meta[_FEATURE_METADATA][
                    'categorical_features'],
                dropped_features=meta[_FEATURE_METADATA][
                    'dropped_features'],)

        inst.__dict__['_' + _CATEGORIES], \
            inst.__dict__['_' + _CATEGORICAL_INDEXES], \
            inst.__dict__['_' + _CATEGORY_DICTIONARY], \
            inst.__dict__['_' + _STRING_IND_DATA] = \
            process_categoricals(
                all_feature_names=inst.__dict__['_' + _FEATURE_COLUMNS],
                categorical_features=inst.__dict__[_CATEGORICAL_FEATURES],
                dataset=inst.__dict__[_TEST].drop(columns=[
                    inst.__dict__[_TARGET_COLUMN]]))

    @staticmethod
    def _load_predictions(inst, path):
        """Load the predict() and predict_proba() output.

        :param inst: RAIBaseInsights object instance.
        :type inst: RAIBaseInsights
        :param path: The directory path to data location.
        :type path: str
        """
        if inst.__dict__[_MODEL] is None:
            inst.__dict__[_PREDICT_OUTPUT] = None
            inst.__dict__[_PREDICT_PROBA_OUTPUT] = None
            return

        prediction_output_path = Path(path) / _PREDICTIONS

        with open(prediction_output_path / (
                _PREDICT + _JSON_EXTENSION), 'r') as file:
            predict_output = json.load(file)
        inst.__dict__[_PREDICT_OUTPUT] = np.array(predict_output)
        inst.__dict__[_PREDICT_PROBA_OUTPUT] = None

    @staticmethod
    def load(path):
        """Load the RAIForecastingInsights from the given path.

        :param path: The directory path to load the RAIForecastingInsights from.
        :type path: str
        :return: The RAIForecastingInsights object after loading.
        :rtype: RAIForecastingInsights
        """
        # create the RAIForecastingInsights without any properties using the __new__
        # function, similar to pickle
        inst = RAIForecastingInsights.__new__(RAIForecastingInsights)

        manager_map = {
            # ManagerNames.CAUSAL: CausalManager,
            # ManagerNames.COUNTERFACTUAL: CounterfactualManager,
            ManagerNames.DATA_BALANCE: DataBalanceManager,
            # ManagerNames.ERROR_ANALYSIS: ErrorAnalysisManager,
            # ManagerNames.EXPLAINER: ExplainerManager,
        }

        # load current state
        RAIBaseInsights._load(path, inst, manager_map,
                              RAIForecastingInsights._load_metadata)

        RAIForecastingInsights._load_predictions(inst, path)

        return inst
