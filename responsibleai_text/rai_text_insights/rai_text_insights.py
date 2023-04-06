# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the RAITextInsights class."""

import json
import pickle
import warnings
from enum import Enum
from pathlib import Path
from typing import Any, List, Optional, Union

import numpy as np
import pandas as pd
from erroranalysis._internal.cohort_filter import FilterDataWithCohortFilters
from ml_wrappers import wrap_model
from raiutils.data_processing import convert_to_list, serialize_json_safe
from raiutils.models import ModelTask as RAIModelTask
from raiutils.models import SKLearn, is_classifier
from responsibleai._interfaces import Dataset, RAIInsightsData
from responsibleai._internal.constants import (ManagerNames, Metadata,
                                               SerializationAttributes)
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.rai_insights.rai_base_insights import RAIBaseInsights

from responsibleai_text.common.constants import ModelTask
from responsibleai_text.managers.error_analysis_manager import \
    ErrorAnalysisManager
from responsibleai_text.managers.explainer_manager import ExplainerManager
from responsibleai_text.utils.feature_extractors import extract_features

_PREDICTIONS = 'predictions'
_PREDICT_OUTPUT = 'predict_output'
_TRAIN = 'train'
_TARGET_COLUMN = 'target_column'
_TASK_TYPE = 'task_type'
_CLASSES = 'classes'
_META_JSON = Metadata.META_JSON
_TRAIN_LABELS = 'train_labels'
_JSON_EXTENSION = '.json'
_PREDICT = 'predict'
_PREDICT_PROBA = 'predict_proba'
_EXT_TEST = '_ext_test'
_EXT_FEATURES = '_ext_features'


class RAITextInsights(RAIBaseInsights):
    """Defines the top-level RAITextInsights API.

    Use RAITextInsights to assess text machine learning models in a
    single API.
    """

    def __init__(self, model: Any, train: pd.DataFrame, test: pd.DataFrame,
                 target_column: str, task_type: str,
                 classes: Optional[np.ndarray] = None,
                 serializer: Optional[Any] = None,
                 maximum_rows_for_test: int = 5000):
        """Creates an RAITextInsights object.

        :param model: The model to compute RAI insights for.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param train: The training dataset including the label column.
        :type train: pandas.DataFrame
        :param test: The test dataset including the label column.
        :type test: pandas.DataFrame
        :param target_column: The name of the label column or list of columns.
            This is a list of columns for multilabel models.
        :type target_column: str or list[str]
        :param task_type: The task to run.
        :type task_type: str
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
        """
        # drop index as this can cause issues later like when copying
        # target column below from test dataset to _ext_test_df
        train = train.reset_index(drop=True)
        test = test.reset_index(drop=True)
        self._wrapped_model = wrap_model(model, test, task_type)
        self._validate_rai_insights_input_parameters(
            model=self._wrapped_model, train=train, test=test,
            target_column=target_column, task_type=task_type,
            classes=classes,
            serializer=serializer,
            maximum_rows_for_test=maximum_rows_for_test)
        self._classes = RAITextInsights._get_classes(
            task_type=task_type,
            train=train,
            target_column=target_column,
            classes=classes
        )
        ext_test, ext_features = extract_features(test,
                                                  target_column,
                                                  task_type)
        self._ext_test = ext_test
        self._ext_features = ext_features
        self._ext_test_df = pd.DataFrame(ext_test, columns=ext_features)
        self._ext_test_df[target_column] = test[target_column]
        self.predict_output = None

        super(RAITextInsights, self).__init__(
            model, train, test, target_column, task_type,
            serializer)
        self._initialize_managers()

    def _initialize_managers(self):
        """Initializes the managers.

        Initializes the explainer and error analysis managers.
        """
        self._explainer_manager = ExplainerManager(
            self.model, self.train, self.test,
            self.target_column,
            self.task_type,
            self._classes)
        self._error_analysis_manager = ErrorAnalysisManager(
            self._wrapped_model, self.test, self._ext_test_df,
            self.target_column, self.task_type, self._classes)
        self._managers = [self._explainer_manager,
                          self._error_analysis_manager]

    @staticmethod
    def _get_classes(task_type, train, target_column, classes):
        if task_type == ModelTask.TEXT_CLASSIFICATION:
            if classes is None:
                classes = train[target_column].unique()
                # sort the classes after calling unique in numeric case
                classes.sort()
                return classes
            else:
                return classes
        elif task_type == ModelTask.MULTILABEL_TEXT_CLASSIFICATION:
            if classes is None:
                return target_column
            else:
                return classes
        else:
            return None

    def _validate_serializer(self, serializer):
        """Validate the serializer.

        :param serializer: The serializer to validate.
        :type serializer: object
        """
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

    def _validate_model(self, model: Any, train: pd.DataFrame, test: pd.DataFrame,
                        target_column: Union[str, List], task_type: str):
        """Validate the model.

        :param model: The model to validate.
        :type model: object
        :param train: The training dataset including the label column.
        :type train: pandas.DataFrame
        :param test: The test dataset including the label column.
        :type test: pandas.DataFrame
        :param target_column: The name of the label column or list of columns.
            This is a list of columns for multilabel models.
        :type target_column: str or list[str]
        :param task_type: The task to run, can be `classification` or
            `regression`.
        :type task_type: str
        """
        if not isinstance(target_column, list):
            target_column = [target_column]
        # Pick one row from train and test data
        small_train_data = train.iloc[0:1].drop(
            target_column, axis=1).iloc[0]
        small_test_data = test.iloc[0:1].drop(
            target_column, axis=1).iloc[0]
        if task_type != ModelTask.QUESTION_ANSWERING:
            small_train_data = small_train_data.tolist()
            small_test_data = small_test_data.tolist()
        # Call the model
        try:
            model.predict(small_train_data)
            model.predict(small_test_data)
        except Exception:
            raise UserConfigValidationException(
                'The model passed cannot be used for'
                ' getting predictions via predict()'
            )

    def _validate_rai_insights_input_parameters(
            self, model: Any, train: pd.DataFrame, test: pd.DataFrame,
            target_column: Union[str, List], task_type: str,
            classes: np.ndarray,
            serializer,
            maximum_rows_for_test: int):
        """Validate the inputs for the RAITextInsights constructor.

        :param model: The model to compute RAI insights for.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param train: The training dataset including the label column.
        :type train: pandas.DataFrame
        :param test: The test dataset including the label column.
        :type test: pandas.DataFrame
        :param target_column: The name of the label column or list of columns.
            This is a list of columns for multilabel models.
        :type target_column: str or list[str]
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
        """

        valid_tasks = [
            ModelTask.TEXT_CLASSIFICATION.value,
            ModelTask.MULTILABEL_TEXT_CLASSIFICATION.value,
            ModelTask.SENTIMENT_ANALYSIS.value,
            ModelTask.QUESTION_ANSWERING.value,
            ModelTask.ENTAILMENT.value,
            ModelTask.SUMMARIZATIONS.value
        ]

        if task_type not in valid_tasks:
            message = (f"Unsupported task type '{task_type}'. "
                       f"Should be one of {valid_tasks}")
            raise UserConfigValidationException(message)

        if model is None:
            warnings.warn(
                'INVALID-MODEL-WARNING: No valid model is supplied. '
                'Explanations will not work')

        if serializer is not None:
            self._validate_serializer(serializer)

        train_is_pd = isinstance(train, pd.DataFrame)
        test_is_pd = isinstance(test, pd.DataFrame)
        if not train_is_pd or not test_is_pd:
            raise UserConfigValidationException(
                "Unsupported data type for either train or test. "
                "Expecting pandas DataFrame for train and test."
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

        if len(set(train.columns) - set(test.columns)) != 0 or \
                len(set(test.columns) - set(train.columns)):
            raise UserConfigValidationException(
                'The features in train and test data do not match')

        if task_type == ModelTask.MULTILABEL_TEXT_CLASSIFICATION.value:
            if not isinstance(target_column, list):
                raise UserConfigValidationException(
                    'The target_column should be a list for multilabel '
                    'classification')
            # check all target columns are present in train and test
            target_columns_set = set(target_column)
            if not target_columns_set.issubset(set(train.columns)):
                raise UserConfigValidationException(
                    'The list of target_column(s) should be in train data')
            if not target_columns_set.issubset(set(test.columns)):
                raise UserConfigValidationException(
                    'The list of target_column(s) should be in test data')
        else:
            if target_column not in list(train.columns) or \
                    target_column not in list(test.columns):
                raise UserConfigValidationException(
                    'Target name {0} not present in train/test data'.format(
                        target_column)
                )

        if classes is not None and task_type == \
                ModelTask.TEXT_CLASSIFICATION:
            if len(set(train[target_column].unique()) -
                    set(classes)) != 0 or \
                    len(set(classes) -
                        set(train[target_column].unique())) != 0:
                raise UserConfigValidationException(
                    'The train labels and distinct values in '
                    'target (train data) do not match')

            if len(set(test[target_column].unique()) -
                    set(classes)) != 0:
                raise UserConfigValidationException(
                    'The test labels are not a subset of the '
                    'distinct values in target (test data)')

        if model is not None:
            self._validate_model(model, train, test, target_column,
                                 task_type)

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
        model_analyzer = self._error_analysis_manager._analyzer
        dataset = model_analyzer.dataset
        model = model_analyzer.model
        if self.predict_output is None:
            # Cache predictions of the model
            self.predict_output = model_analyzer.model.predict(dataset)
        pred_y = self.predict_output
        true_y = model_analyzer.true_y
        categorical_features = model_analyzer.categorical_features
        categories = model_analyzer.categories
        classes = model_analyzer.classes
        model_task = model_analyzer.model_task

        filter_data_with_cohort = FilterDataWithCohortFilters(
            model=model,
            dataset=dataset,
            features=dataset.columns,
            categorical_features=categorical_features,
            categories=categories,
            true_y=true_y,
            pred_y=pred_y,
            model_task=model_task,
            classes=classes)

        return filter_data_with_cohort.filter_data_from_cohort(
            filters=filters,
            composite_filters=composite_filters,
            include_original_columns_only=include_original_columns_only)

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

    def get_data(self):
        """Get all data as RAIInsightsData object

        :return: Model Analysis Data
        :rtype: RAIInsightsData
        """
        data = RAIInsightsData()
        data.dataset = self._get_dataset()
        data.modelExplanationData = self.explainer.get_data()
        data.errorAnalysisData = self.error_analysis.get_data()
        return data

    def save(self, path):
        """Save the RAITextInsights to the given path.

        In addition to the usual data, saves the extracted features.

        :param path: The directory path to save the RAIInsights to.
        :type path: str
        """
        super(RAITextInsights, self).save(path)
        # Save extracted features data
        self._save_ext_data(path)

    def _save_ext_data(self, path):
        """Save the copy of raw data (train and test sets) and
           their related metadata.

        :param path: The directory path to save the RAIBaseInsights to.
        :type path: str
        """
        data_directory = Path(path) / SerializationAttributes.DATA_DIRECTORY
        ext_path = data_directory / (_EXT_TEST + _JSON_EXTENSION)
        ext_features_path = data_directory / (_EXT_FEATURES + _JSON_EXTENSION)
        self._save_list_data(ext_path, self._ext_test)
        self._save_list_data(ext_features_path, self._ext_features)

    def _save_list_data(self, data_path, data):
        with open(data_path, 'w') as file:
            json.dump(data, file, default=serialize_json_safe)

    def _get_test_without_target(self, is_classification_task):
        """Get the test data without the target column.

        :param is_classification_task: Whether the task is a
            classification task.
        :type is_classification_task: bool
        :return: The test data without the target column.
        :rtype: pandas.DataFrame
        """
        if is_classification_task:
            target_column = self.target_column
            if not isinstance(target_column, list):
                target_column = [target_column]
            dataset = self.test.drop(
                target_column, axis=1).iloc[:, 0].tolist()
        elif self.task_type == ModelTask.QUESTION_ANSWERING:
            dataset = self.test.drop([self.target_column], axis=1)
        else:
            raise ValueError("Unknown task type: {}".format(self.task_type))
        return dataset

    @property
    def _is_classification_task(self):
        """Whether the task is a classification task.

        :return: Whether the task is a classification task.
        :rtype: bool
        """
        classification_tasks = [ModelTask.TEXT_CLASSIFICATION,
                                ModelTask.MULTILABEL_TEXT_CLASSIFICATION]
        return self.task_type in classification_tasks

    def _get_dataset(self):
        dashboard_dataset = Dataset()
        tasktype = self.task_type
        is_classification_task = self._is_classification_task
        if is_classification_task:
            tasktype = RAIModelTask.CLASSIFICATION
        if isinstance(tasktype, Enum):
            tasktype = tasktype.value
        dashboard_dataset.task_type = tasktype
        dashboard_dataset.categorical_features = []
        dashboard_dataset.class_names = convert_to_list(
            self._classes)
        dataset = self._get_test_without_target(is_classification_task)

        predicted_y = None
        if dataset is not None and self._wrapped_model is not None:
            try:
                predicted_y = self._wrapped_model.predict(dataset)
            except Exception as ex:
                msg = ("Model does not support predict method for given "
                       "dataset type")
                raise ValueError(msg) from ex
            try:
                predicted_y = convert_to_list(predicted_y)
            except Exception as ex:
                raise ValueError(
                    "Model prediction output of unsupported type,") from ex
        if predicted_y is not None:
            if is_classification_task:
                predicted_y = self._convert_labels(
                    predicted_y, dashboard_dataset.class_names)
            dashboard_dataset.predicted_y = predicted_y
        row_length = len(dataset)

        dashboard_dataset.features = self._ext_test

        true_y = self.test[self.target_column]
        if true_y is not None and len(true_y) == row_length:
            true_y = convert_to_list(true_y)
            if is_classification_task:
                true_y = self._convert_labels(
                    true_y, dashboard_dataset.class_names)
            dashboard_dataset.true_y = true_y

        dashboard_dataset.feature_names = self._ext_features
        dashboard_dataset.target_column = self.target_column
        if is_classifier(self._wrapped_model) and dataset is not None:
            try:
                probability_y = self._wrapped_model.predict_proba(dataset)
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

    def _convert_labels(self, labels, class_names, unique_labels=None):
        """Convert labels to indexes if possible.

        :param labels: Labels to convert.
        :type labels: list or numpy.ndarray
        :param class_names: List of class names.
        :type class_names: list
        :param unique_labels: List of unique labels.
        :type unique_labels: list
        :return: Converted labels.
        :rtype: list
        """
        unique_labels = unique_labels or np.unique(labels).tolist()
        if isinstance(labels[0], list):
            return [self._convert_labels(
                li, class_names, unique_labels) for li in labels]
        is_boolean = all(isinstance(y, (bool)) for y in unique_labels)
        if is_boolean:
            labels_arr = np.array(labels)
            labels = labels_arr.astype(float).tolist()
        if class_names is not None:
            num_types = (int, float)
            is_numeric = all(isinstance(y, num_types) for y in unique_labels)
            if not is_numeric:
                labels = [class_names.index(y) for y in labels]
        return labels

    def _save_predictions(self, path):
        """Save the predict() and predict_proba() output.

        :param path: The directory path to save the RAITextInsights to.
        :type path: str
        """
        prediction_output_path = Path(path) / _PREDICTIONS
        prediction_output_path.mkdir(parents=True, exist_ok=True)

        if self.model is None:
            return
        is_classification_task = self._is_classification_task
        test_without_target_column = self._get_test_without_target(
            is_classification_task)
        predict_output = self._wrapped_model.predict(
            test_without_target_column)
        self._write_to_file(
            prediction_output_path / (_PREDICT + _JSON_EXTENSION),
            json.dumps(predict_output.tolist()))

        if hasattr(self.model, SKLearn.PREDICT_PROBA):
            predict_proba_output = self.model.predict_proba(
                test_without_target_column)
            self._write_to_file(
                prediction_output_path / (_PREDICT_PROBA + _JSON_EXTENSION),
                json.dumps(predict_proba_output.tolist()))

    def _save_metadata(self, path):
        """Save the metadata like target column, categorical features,
           task type and the classes (if any).

        :param path: The directory path to save the RAITextInsights to.
        :type path: str
        """
        top_dir = Path(path)
        classes = convert_to_list(self._classes)
        meta = {
            _TARGET_COLUMN: self.target_column,
            _TASK_TYPE: self.task_type,
            _CLASSES: classes
        }
        with open(top_dir / _META_JSON, 'w') as file:
            json.dump(meta, file)

    @staticmethod
    def _load_metadata(inst, path):
        """Load the metadata.

        :param inst: RAITextInsights object instance.
        :type inst: RAITextInsights
        :param path: The directory path to metadata location.
        :type path: str
        """
        top_dir = Path(path)
        with open(top_dir / _META_JSON, 'r') as meta_file:
            meta = meta_file.read()
        meta = json.loads(meta)
        inst.__dict__[_TARGET_COLUMN] = meta[_TARGET_COLUMN]
        inst.__dict__[_TASK_TYPE] = meta[_TASK_TYPE]
        inst.__dict__[_PREDICT_OUTPUT] = None
        classes = None
        if _TRAIN_LABELS in meta:
            classes = meta[_TRAIN_LABELS]
        else:
            classes = meta[_CLASSES]

        inst.__dict__['_' + _CLASSES] = RAITextInsights._get_classes(
            task_type=meta[_TASK_TYPE],
            train=inst.__dict__[_TRAIN],
            target_column=meta[_TARGET_COLUMN],
            classes=classes
        )
        # load the extracted features as part of metadata
        RAITextInsights._load_ext_data(inst, path)

    @staticmethod
    def _load_ext_data(inst, path):
        """Load the extracted features data.

        :param inst: RAITextInsights object instance.
        :type inst: RAITextInsights
        :param path: The directory path to extracted data location.
        :type path: str
        """
        top_dir = Path(path)
        data_path = top_dir / SerializationAttributes.DATA_DIRECTORY
        json_test_path = data_path / (_EXT_TEST + _JSON_EXTENSION)
        with open(json_test_path, 'r') as file:
            inst._ext_test = json.loads(file.read())
        json_features_path = data_path / (_EXT_FEATURES + _JSON_EXTENSION)
        with open(json_features_path, 'r') as file:
            inst._ext_features = json.loads(file.read())
        inst._ext_test_df = pd.DataFrame(
            inst._ext_test, columns=inst._ext_features)
        target_column = inst.target_column
        test = inst.test
        inst._ext_test_df[target_column] = test[target_column]

    @staticmethod
    def load(path):
        """Load the RAITextInsights from the given path.

        :param path: The directory path to load the RAITextInsights from.
        :type path: str
        :return: The RAITextInsights object after loading.
        :rtype: RAITextInsights
        """
        # create the RAITextInsights without any properties using the __new__
        # function, similar to pickle
        inst = RAITextInsights.__new__(RAITextInsights)
        inst.categorical_features = []

        manager_map = {
            ManagerNames.EXPLAINER: ExplainerManager,
            ManagerNames.ERROR_ANALYSIS: ErrorAnalysisManager,
        }

        # load current state
        RAIBaseInsights._load(path, inst, manager_map,
                              RAITextInsights._load_metadata)
        inst._wrapped_model = wrap_model(inst.model, inst.test, inst.task_type)
        return inst
