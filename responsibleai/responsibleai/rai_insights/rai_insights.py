# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the RAIInsights class."""

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
from responsibleai._interfaces import Dataset, RAIInsightsData
from responsibleai._internal.constants import ManagerNames, Metadata
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.feature_metadata import FeatureMetadata
from responsibleai.managers.causal_manager import CausalManager
from responsibleai.managers.counterfactual_manager import CounterfactualManager
from responsibleai.managers.data_balance_manager import DataBalanceManager
from responsibleai.managers.error_analysis_manager import ErrorAnalysisManager
from responsibleai.managers.explainer_manager import ExplainerManager
from responsibleai.rai_insights.constants import ModelTask
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


class RAIInsights(RAIBaseInsights):
    """Defines the top-level Model Analysis API.
    Use RAIInsights to analyze errors, explain the most important
    features, compute counterfactuals and run causal analysis in a
    single API.
    """

    def __init__(self, model: Optional[Any], train: pd.DataFrame,
                 test: pd.DataFrame, target_column: str, task_type: str,
                 categorical_features: Optional[List[str]] = None,
                 classes: Optional[np.ndarray] = None,
                 serializer: Optional[Any] = None,
                 maximum_rows_for_test: int = 5000,
                 feature_metadata: Optional[FeatureMetadata] = None):
        """Creates an RAIInsights object.
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
        categorical_features = categorical_features or []
        if len(test) > maximum_rows_for_test:
            warnings.warn("The size of test set {0} is greater than "
                          "supported limit of {1}. Computing insights"
                          " for first {1} samples of "
                          "test set".format(len(test),
                                            maximum_rows_for_test))
            self._large_test = test.copy()
            test = test.copy()[0:maximum_rows_for_test]

            if model is not None:
                # Cache predictions of the model
                self._large_predict_output = model.predict(
                    self._large_test.drop(columns=[target_column]))
                if hasattr(model, SKLearn.PREDICT_PROBA):
                    self._large_predict_proba_output = model.predict_proba(
                        self._large_test.drop(columns=[target_column]))
                else:
                    self._large_predict_proba_output = None
            else:
                self._large_predict_output = None
                self._large_predict_proba_output = None
        else:
            self._large_test = None
            self._large_predict_output = None
            self._large_predict_proba_output = None

        self._validate_rai_insights_input_parameters(
            model=model, train=train, test=test,
            target_column=target_column, task_type=task_type,
            categorical_features=categorical_features,
            classes=classes,
            serializer=serializer,
            maximum_rows_for_test=maximum_rows_for_test,
            feature_metadata=feature_metadata)
        self._classes = RAIInsights._get_classes(
            task_type=task_type,
            train=train,
            target_column=target_column,
            classes=classes
        )
        self._feature_columns = \
            test.drop(columns=[target_column]).columns.tolist()
        self._feature_ranges = RAIInsights._get_feature_ranges(
            test=test, categorical_features=categorical_features,
            feature_columns=self._feature_columns)
        self._feature_metadata = feature_metadata

        self.categorical_features = categorical_features
        self._categories, self._categorical_indexes, \
            self._category_dictionary, self._string_ind_data = \
            process_categoricals(
                all_feature_names=self._feature_columns,
                categorical_features=self.categorical_features,
                dataset=test.drop(columns=[target_column]))

        super(RAIInsights, self).__init__(
            model, train, test, target_column, task_type,
            serializer)

        self._try_add_data_balance()

        if model is not None:
            # Cache predictions of the model
            self.predict_output = model.predict(
                self.get_test_data(
                    test_data=test).drop(columns=[target_column]))
            if hasattr(model, SKLearn.PREDICT_PROBA):
                self.predict_proba_output = model.predict_proba(
                    self.get_test_data(
                        test_data=test).drop(columns=[target_column]))
            else:
                self.predict_proba_output = None
        else:
            self.predict_output = None
            self.predict_proba_output = None

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

    def _initialize_managers(self):
        """Initializes the managers.

        Initialized the causal, counterfactual, error analysis
        and explainer managers.
        """
        if self._feature_metadata is not None:
            dropped_features = self._feature_metadata.dropped_features
        else:
            dropped_features = None
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
            self.categorical_features,
            dropped_features,
            task_type=self.task_type)

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
        if self.task_type == ModelTask.CLASSIFICATION and \
                len(self.categorical_features) > 0 and \
                self._classes is not None:
            self._data_balance_manager.add(
                cols_of_interest=self.categorical_features)

    def _validate_rai_insights_input_parameters(
            self, model: Any, train: pd.DataFrame, test: pd.DataFrame,
            target_column: str, task_type: str,
            categorical_features: List[str], classes: np.ndarray,
            serializer,
            maximum_rows_for_test: int,
            feature_metadata: Optional[FeatureMetadata] = None):
        """Validate the inputs for the RAIInsights constructor.

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
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
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

        valid_tasks = [
            ModelTask.CLASSIFICATION.value,
            ModelTask.REGRESSION.value
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

        if isinstance(train, pd.DataFrame) and isinstance(test, pd.DataFrame):
            if len(train) <= 0 or len(test) <= 0:
                raise UserConfigValidationException(
                    'Either of the train/test are empty. '
                    'Please provide non-empty dataframes for train '
                    'and test sets.'
                )

            if len(set(train.columns) - set(test.columns)) != 0 or \
                    len(set(test.columns) - set(train.columns)) != 0:
                raise UserConfigValidationException(
                    'The features in train and test data do not match')

            if target_column not in list(train.columns) or \
                    target_column not in list(test.columns):
                raise UserConfigValidationException(
                    'Target name {0} not present in train/test data'.format(
                        target_column)
                )

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

            if classes is not None and task_type == \
                    ModelTask.CLASSIFICATION:
                if len(set(train[target_column].unique()) -
                       set(classes)) != 0 or \
                        len(set(classes) -
                            set(train[target_column].unique())) != 0:
                    raise UserConfigValidationException(
                        'The train labels and distinct values in '
                        'target (train data) do not match')

                if len(set(test[target_column].unique()) -
                       set(classes)) != 0 or \
                        len(set(classes) -
                            set(test[target_column].unique())) != 0:
                    raise UserConfigValidationException(
                        'The train labels and distinct values in '
                        'target (test data) do not match')

            if feature_metadata is not None:
                if not isinstance(feature_metadata, FeatureMetadata):
                    raise UserConfigValidationException(
                        "Expecting type FeatureMetadata but got {0}".format(
                            type(feature_metadata)))

                feature_metadata.validate_feature_metadata_with_user_features(
                    list(train.columns))

            if model is not None:
                # Pick one row from train and test data
                small_train_data = train[0:1]
                small_test_data = test[0:1]
                has_dropped_features = False
                if feature_metadata is not None:
                    if feature_metadata.dropped_features is not None and \
                            len(feature_metadata.dropped_features) != 0:
                        has_dropped_features = True
                        small_train_data = small_train_data.drop(
                            columns=feature_metadata.dropped_features, axis=1)
                        small_test_data = small_test_data.drop(
                            columns=feature_metadata.dropped_features, axis=1)

                small_train_data = small_train_data.drop(
                    columns=[target_column], axis=1)
                small_test_data = small_test_data.drop(
                    columns=[target_column], axis=1)
                if len(small_train_data.columns) == 0 or \
                        len(small_test_data.columns) == 0:
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

                # Run predict_proba() of the model
                if task_type == ModelTask.CLASSIFICATION:
                    try:
                        model.predict_proba(small_train_data)
                        model.predict_proba(small_test_data)
                    except Exception:
                        raise UserConfigValidationException(
                            'The model passed cannot be used for'
                            ' getting predictions via predict_proba()'
                        )
                self._validate_features_same(small_train_features_before,
                                             small_train_data,
                                             SKLearn.PREDICT_PROBA)

                if task_type == ModelTask.REGRESSION:
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
        if not use_entire_test_data:
            test_data = self.test
            pred_y = self.predict_output
            true_y = self.test[self.target_column]
        else:
            if self._large_test is not None:
                test_data = self._large_test
                pred_y = self._large_predict_output
                true_y = self._large_test[self.target_column]
            else:
                test_data = self.test
                pred_y = self.predict_output
                true_y = self.test[self.target_column]

        filter_data_with_cohort = FilterDataWithCohortFilters(
            model=self.model,
            dataset=test_data.drop(columns=[self.target_column]),
            features=test_data.drop(columns=[self.target_column]).columns,
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
            raise ValueError(
                "Unsupported dataset type") from ex
        if dataset is not None and self.model is not None:
            try:
                predict_dataset = dataset
                metadata = self._feature_metadata
                metadata_exists = metadata is not None
                dropped_features_exist = metadata_exists and \
                    metadata.dropped_features is not None
                if dropped_features_exist and \
                        len(metadata.dropped_features) != 0:
                    predict_dataset = predict_dataset.drop(
                        metadata.dropped_features, axis=1)
                predicted_y = self.model.predict(predict_dataset)
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
            if(self.task_type == "classification" and
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

        if true_y is not None and len(true_y) == row_length:
            if(self.task_type == "classification" and
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
        if is_classifier(self.model) and dataset is not None:
            try:
                predict_dataset = dataset
                metadata = self._feature_metadata
                metadata_exists = metadata is not None
                dropped_features_exist = metadata_exists and \
                    metadata.dropped_features is not None
                if dropped_features_exist and \
                        len(metadata.dropped_features) != 0:
                    predict_dataset = predict_dataset.drop(
                        metadata.dropped_features, axis=1)
                probability_y = self.model.predict_proba(predict_dataset)
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

        :param path: The directory path to save the RAIInsights to.
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

        if self._large_test is not None:
            self._write_to_file(
                prediction_output_path / (
                    'large_' + _PREDICT + _JSON_EXTENSION),
                json.dumps(self._large_predict_output.tolist()))

            if self._large_predict_proba_output is not None:
                self._write_to_file(
                    prediction_output_path / (
                        'large_' + _PREDICT_PROBA + _JSON_EXTENSION),
                    json.dumps(self._large_predict_proba_output.tolist()))

            # Save large test data
            self._write_to_file(
                prediction_output_path / ('large_' + _TEST + _JSON_EXTENSION),
                self._large_test.to_json(orient='split'))

    def _save_large_data(self, path):
        """Save the large data.

        :param path: The directory path to save the RAIInsights to.
        :type path: str
        """
        if self._large_test is not None:
            # Save large test data
            large_test_path = Path(path) / 'data' / (
                'large_' + _TEST + _JSON_EXTENSION)
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
            _TARGET_COLUMN: self.target_column,
            _TASK_TYPE: self.task_type,
            _CATEGORICAL_FEATURES: self.categorical_features,
            _CLASSES: classes,
            _FEATURE_COLUMNS: self._feature_columns,
            _FEATURE_RANGES: self._feature_ranges,
            _FEATURE_METADATA: feature_metadata_dict
        }
        with open(top_dir / _META_JSON, 'w') as file:
            json.dump(meta, file)

    def save(self, path):
        """Save the RAIInsights to the given path.

        :param path: The directory path to save the RAIInsights to.
        :type path: str
        """
        super(RAIInsights, self).save(path)
        self._save_large_data(path)

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

        :param inst: RAIInsights object instance.
        :type inst: RAIInsights
        :param path: The directory path to metadata location.
        :type path: str
        """
        top_dir = Path(path)
        with open(top_dir / _META_JSON, 'r') as meta_file:
            meta = meta_file.read()
        meta = json.loads(meta)
        inst.__dict__[_TARGET_COLUMN] = meta[_TARGET_COLUMN]
        inst.__dict__[_TASK_TYPE] = meta[_TASK_TYPE]
        inst.__dict__[_CATEGORICAL_FEATURES] = meta[_CATEGORICAL_FEATURES]
        classes = None
        if _TRAIN_LABELS in meta:
            classes = meta[_TRAIN_LABELS]
        else:
            classes = meta[_CLASSES]

        inst.__dict__['_' + _CLASSES] = RAIInsights._get_classes(
            task_type=meta[_TASK_TYPE],
            train=inst.__dict__[_TRAIN],
            target_column=meta[_TARGET_COLUMN],
            classes=classes
        )

        inst.__dict__['_' + _FEATURE_COLUMNS] = meta[_FEATURE_COLUMNS]
        inst.__dict__['_' + _FEATURE_RANGES] = meta[_FEATURE_RANGES]
        if _FEATURE_METADATA not in meta or meta[_FEATURE_METADATA] is None:
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

        :param inst: RAIInsights object instance.
        :type inst: RAIInsights
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

        if inst.__dict__[_TASK_TYPE] == ModelTask.CLASSIFICATION:
            with open(prediction_output_path / (
                    _PREDICT_PROBA + _JSON_EXTENSION), 'r') as file:
                predict_proba_output = json.load(file)
            inst.__dict__[_PREDICT_PROBA_OUTPUT] = np.array(
                predict_proba_output)
        else:
            inst.__dict__[_PREDICT_PROBA_OUTPUT] = None

        large_test_path = prediction_output_path / (
            'large_' + _TEST + _JSON_EXTENSION)
        if large_test_path.exists():
            data_directory = Path(path) / "data"
            with open(data_directory / (
                    _TEST + 'dtypes' + _JSON_EXTENSION), 'r') as file:
                types = json.load(file)
            with open(large_test_path, 'r') as file:
                inst.__dict__["_large_test"] = \
                    pd.read_json(file, dtype=types, orient='split')
        else:
            inst.__dict__["_large_test"] = None

        large_predict_output_path = prediction_output_path / (
            'large_' + _PREDICT + _JSON_EXTENSION)
        if large_predict_output_path.exists():
            with open(large_predict_output_path, 'r') as file:
                large_predict_output = json.load(file)
            inst.__dict__["_large_predict_output"] = np.array(
                large_predict_output)
        else:
            inst.__dict__["_large_predict_output"] = None

        large_predict_proba_output_path = prediction_output_path / (
            'large_' + _PREDICT_PROBA + _JSON_EXTENSION)
        if large_predict_proba_output_path.exists():
            with open(large_predict_proba_output_path, 'r') as file:
                large_predict_proba_output = json.load(file)
            inst.__dict__["_large_predict_proba_output"] = np.array(
                large_predict_proba_output)
        else:
            inst.__dict__["_large_predict_proba_output"] = None

    @staticmethod
    def _load_large_data(inst, path):
        """Load the large test data.

        :param inst: RAIInsights object instance.
        :type inst: RAIInsights
        :param path: The directory path to data location.
        :type path: str
        """
        large_test_path = Path(path) / 'data' / (
            'large_' + _TEST + _JSON_EXTENSION)
        if large_test_path.exists():
            data_directory = Path(path) / "data"
            with open(data_directory / (
                    _TEST + 'dtypes' + _JSON_EXTENSION), 'r') as file:
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
