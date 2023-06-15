# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the RAITextInsights class."""

import json
import logging
import pickle
import warnings
from enum import Enum
from pathlib import Path
from typing import Any, List, Optional, Union

import numpy as np
import pandas as pd
from ml_wrappers import wrap_model

from erroranalysis._internal.cohort_filter import FilterDataWithCohortFilters
from raiutils.data_processing import convert_to_list, serialize_json_safe
from raiutils.models import SKLearn, is_classifier
from responsibleai._interfaces import Dataset, RAIInsightsData
from responsibleai._internal.constants import (ManagerNames, Metadata,
                                               SerializationAttributes)
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.feature_metadata import FeatureMetadata
from responsibleai.rai_insights.rai_base_insights import RAIBaseInsights
from responsibleai_text.common.constants import ModelTask
from responsibleai_text.managers.error_analysis_manager import \
    ErrorAnalysisManager
from responsibleai_text.managers.explainer_manager import ExplainerManager
from responsibleai_text.utils.feature_extractors import (extract_features,
                                                         get_text_columns)

module_logger = logging.getLogger(__name__)
module_logger.setLevel(logging.INFO)

try:
    import evaluate
except ImportError:
    module_logger.debug(
        'Could not import evaluate, required if using a QA model')

_PREDICTIONS = 'predictions'
_PREDICT_OUTPUT = 'predict_output'
_TEST = 'test'
_TARGET_COLUMN = 'target_column'
_TASK_TYPE = 'task_type'
_CLASSES = 'classes'
_META_JSON = Metadata.META_JSON
_JSON_EXTENSION = '.json'
_PREDICT = 'predict'
_PREDICT_PROBA = 'predict_proba'
_EXT_TEST = '_ext_test'
_EXT_FEATURES = '_ext_features'
_FEATURE_METADATA = Metadata.FEATURE_METADATA
_IDENTITY_FEATURE_NAME = 'identity_feature_name'
_DATETIME_FEATURES = 'datetime_features'
_TIME_SERIES_ID_FEATURES = 'time_series_id_features'
_CATEGORICAL_FEATURES = 'categorical_features'
_DROPPED_FEATURES = 'dropped_features'
_QUESTION_TYPE = 'question_type'
_TEXT_COLUMN = '_text_column'


def _feature_metadata_from_dict(feature_meta_dict):
    """Create a FeatureMetadata from a dictionary.

    :param feature_meta_dict: The dictionary to create the FeatureMetadata
        from.
    :type feature_meta_dict: dict
    :return: The FeatureMetadata created from the dictionary.
    :rtype: FeatureMetadata
    """
    return FeatureMetadata(
        identity_feature_name=feature_meta_dict[_IDENTITY_FEATURE_NAME],
        datetime_features=feature_meta_dict[_DATETIME_FEATURES],
        time_series_id_features=feature_meta_dict[_TIME_SERIES_ID_FEATURES],
        categorical_features=feature_meta_dict[_CATEGORICAL_FEATURES],
        dropped_features=feature_meta_dict[_DROPPED_FEATURES])


def _add_extra_metadata_features(task_type, feature_metadata):
    """Add extra metadata features for the given task type.

    For question answering task, adds the question type feature.

    :param task_type: The task type.
    :type task_type: str
    :param feature_metadata: The feature metadata.
    :type feature_metadata: FeatureMetadata
    :return: The feature metadata with extra metadata features added.
    :rtype: FeatureMetadata
    """
    is_qa = task_type == ModelTask.QUESTION_ANSWERING
    categorical_features = feature_metadata.categorical_features
    is_cat_empty = categorical_features is None
    if is_qa and (is_cat_empty or _QUESTION_TYPE not in categorical_features):
        feature_metadata = _feature_metadata_from_dict(
            feature_metadata.to_dict().copy())
        if is_cat_empty:
            feature_metadata.categorical_features = []
        feature_metadata.categorical_features.append(_QUESTION_TYPE)
    return feature_metadata


class RAITextInsights(RAIBaseInsights):
    """Defines the top-level RAITextInsights API.

    Use RAITextInsights to assess text machine learning models in a
    single API.
    """

    def __init__(self, model: Any, test: pd.DataFrame,
                 target_column: str, task_type: str,
                 classes: Optional[np.ndarray] = None,
                 serializer: Optional[Any] = None,
                 maximum_rows_for_test: int = 5000,
                 feature_metadata: Optional[FeatureMetadata] = None,
                 text_column: Optional[Union[str, List]] = None):
        """Creates an RAITextInsights object.

        :param model: The model to compute RAI insights for.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
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
        :param feature_metadata: Feature metadata for the dataset
            to identify different kinds of features.
        :type feature_metadata: Optional[FeatureMetadata]
        :param text_column: The name of the optional text column(s).
            If not provided, and there is additional feature metadata, then
            an exception will be raised.
        :type text_column: str or list[str]
        """
        # drop index as this can cause issues later like when copying
        # target column below from test dataset to _ext_test_df
        test = test.reset_index(drop=True)
        if feature_metadata is None:
            # initialize to avoid having to keep checking if it is None
            feature_metadata = FeatureMetadata()
        feature_metadata = _add_extra_metadata_features(
            task_type, feature_metadata)
        self._text_column = text_column
        self._feature_metadata = feature_metadata
        self._wrapped_model = wrap_model(model, test, task_type)
        self._validate_rai_insights_input_parameters(
            model=self._wrapped_model, test=test,
            target_column=target_column, task_type=task_type,
            classes=classes,
            serializer=serializer,
            maximum_rows_for_test=maximum_rows_for_test,
            text_column=self._text_column)
        self._classes = RAITextInsights._get_classes(
            task_type=task_type,
            test=test,
            target_column=target_column,
            classes=classes
        )
        ext_test, ext_features = extract_features(
            test, target_column, task_type,
            self._feature_metadata.dropped_features)
        self._ext_test = ext_test
        self._ext_features = ext_features
        self._ext_test_df = pd.DataFrame(ext_test, columns=ext_features)
        self._ext_test_df[target_column] = test[target_column]
        self.predict_output = None

        super(RAITextInsights, self).__init__(
            model, None, test, target_column, task_type,
            serializer)
        self._initialize_managers()

    def _initialize_managers(self):
        """Initializes the managers.

        Initializes the explainer and error analysis managers.
        """
        self._explainer_manager = ExplainerManager(
            self.model, self.test,
            self.target_column,
            self.task_type,
            self._classes)
        self._error_analysis_manager = ErrorAnalysisManager(
            self._wrapped_model, self.test, self._ext_test_df,
            self.target_column, self._text_column, self.task_type,
            self._classes, self._feature_metadata.categorical_features)
        self._managers = [self._explainer_manager,
                          self._error_analysis_manager]

    @staticmethod
    def _get_classes(task_type, test, target_column, classes):
        if task_type == ModelTask.TEXT_CLASSIFICATION:
            if classes is None:
                classes = test[target_column].unique()
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

    def _validate_model(self, model: Any, test: pd.DataFrame,
                        target_column: Union[str, List], task_type: str,
                        text_column: Optional[Union[str, List]]):
        """Validate the model.

        :param model: The model to validate.
        :type model: object
        :param test: The test dataset including the label column.
        :type test: pandas.DataFrame
        :param target_column: The name of the label column or list of columns.
            This is a list of columns for multilabel models.
        :type target_column: str or list[str]
        :param task_type: The task to run, can be `classification` or
            `regression`.
        :type task_type: str
        :param text_column: The name of the optional text column(s).
            If not provided, and there is additional feature metadata, then
            an exception will be raised.
        :type text_column: str or list[str]
        """
        if not isinstance(target_column, list):
            target_column = [target_column]
        # Pick one row from test data
        small_test_data = test.iloc[0:1].drop(
            target_column, axis=1)
        small_test_data = get_text_columns(small_test_data, text_column)
        small_test_data = small_test_data.iloc[0]
        if task_type != ModelTask.QUESTION_ANSWERING:
            small_test_data = small_test_data.tolist()
        # Call the model
        try:
            model.predict(small_test_data)
        except Exception:
            raise UserConfigValidationException(
                'The model passed cannot be used for'
                ' getting predictions via predict()'
            )

    def _validate_rai_insights_input_parameters(
            self, model: Any, test: pd.DataFrame,
            target_column: Union[str, List], task_type: str,
            classes: np.ndarray,
            serializer,
            maximum_rows_for_test: int,
            text_column: Optional[Union[str, List]]):
        """Validate the inputs for the RAITextInsights constructor.

        :param model: The model to compute RAI insights for.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
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

        test_is_pd = isinstance(test, pd.DataFrame)
        if not test_is_pd:
            raise UserConfigValidationException(
                "Unsupported data type for test dataset. "
                "Expecting pandas DataFrame."
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

        if task_type == ModelTask.MULTILABEL_TEXT_CLASSIFICATION.value:
            if not isinstance(target_column, list):
                raise UserConfigValidationException(
                    'The target_column should be a list for multilabel '
                    'classification')
            # check all target columns are present in test
            target_columns_set = set(target_column)
            if not target_columns_set.issubset(set(test.columns)):
                raise UserConfigValidationException(
                    'The list of target_column(s) should be in test data')
        else:
            if target_column not in list(test.columns):
                raise UserConfigValidationException(
                    'Target name {0} not present in test data'.format(
                        target_column)
                )

        if text_column:
            if task_type == ModelTask.QUESTION_ANSWERING.value:
                if not isinstance(text_column, list):
                    raise UserConfigValidationException(
                        'The text_column should be a list for question ' +
                        'answering')
                text_columns_set = set(text_column)
                if not text_columns_set.issubset(set(test.columns)):
                    raise UserConfigValidationException(
                        'The list of text_column(s) should be in test data')
            else:
                if text_column not in test.columns:
                    raise UserConfigValidationException(
                        'The text_column should be in test data')

        if classes is not None and task_type == ModelTask.TEXT_CLASSIFICATION:
            if len(set(test[target_column].unique()) -
                    set(classes)) != 0:
                raise UserConfigValidationException(
                    'The test labels are not a subset of the '
                    'distinct values in target (test data)')

        if model is not None:
            self._validate_model(model, test, target_column,
                                 task_type, text_column)

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
        """Save the copy of raw data and their related metadata.

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

    def _get_test_text_data(self, is_classification_task):
        """Get the test data without the target and metadata columns.

        :param is_classification_task: Whether the task is a
            classification task.
        :type is_classification_task: bool
        :return: The test data without the target and metadata columns.
        :rtype: pandas.DataFrame or list[str]
        """
        if is_classification_task:
            target_column = self.target_column
            if not isinstance(target_column, list):
                target_column = [target_column]
            dataset = self.test.drop(target_column, axis=1)
        elif self.task_type == ModelTask.QUESTION_ANSWERING:
            dataset = self.test.drop([self.target_column], axis=1)
        else:
            raise ValueError("Unknown task type: {}".format(self.task_type))
        dataset = get_text_columns(dataset, self._text_column)
        if is_classification_task:
            dataset = dataset.iloc[:, 0].tolist()
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
        if isinstance(tasktype, Enum):
            tasktype = tasktype.value
        dashboard_dataset.task_type = tasktype
        categorical_features = self._feature_metadata.categorical_features
        if categorical_features is None:
            categorical_features = []
        dashboard_dataset.categorical_features = categorical_features
        dashboard_dataset.class_names = convert_to_list(
            self._classes)
        is_classification_task = self._is_classification_task
        dataset = self._get_test_text_data(is_classification_task)

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
        test_without_target_column = self._get_test_text_data(
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
        feature_metadata_dict = self._feature_metadata.to_dict()
        meta = {
            _TARGET_COLUMN: self.target_column,
            _TASK_TYPE: self.task_type,
            _CLASSES: classes,
            _FEATURE_METADATA: feature_metadata_dict,
            _TEXT_COLUMN: self._text_column
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
        text_column = None
        if _TEXT_COLUMN in meta:
            text_column = meta[_TEXT_COLUMN]
        inst.__dict__[_TEXT_COLUMN] = text_column
        classes = meta[_CLASSES]

        inst.__dict__['_' + _CLASSES] = RAITextInsights._get_classes(
            task_type=meta[_TASK_TYPE],
            test=inst.__dict__[_TEST],
            target_column=meta[_TARGET_COLUMN],
            classes=classes
        )

        if (Metadata.FEATURE_METADATA not in meta or
                meta[Metadata.FEATURE_METADATA] is None):
            inst.__dict__['_' + Metadata.FEATURE_METADATA] = FeatureMetadata()
        else:
            feature_metadata_dict = meta[Metadata.FEATURE_METADATA]
            feature_metadata = _feature_metadata_from_dict(
                feature_metadata_dict)
            inst.__dict__['_' + Metadata.FEATURE_METADATA] = feature_metadata

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

        manager_map = {
            ManagerNames.EXPLAINER: ExplainerManager,
            ManagerNames.ERROR_ANALYSIS: ErrorAnalysisManager,
        }

        # load current state
        RAIBaseInsights._load(path, inst, manager_map,
                              RAITextInsights._load_metadata)
        inst._wrapped_model = wrap_model(inst.model, inst.test, inst.task_type)
        return inst

    def normalize_text(self, s):
        """Normalize the text.

        Removing articles and punctuation, and standardizing whitespace
        are all typical text processing steps.

        :param s: The text to normalize.
        :type s: str
        :return: The normalized text.
        :rtype: str
        """
        import re
        import string

        def remove_articles(text):
            regex = re.compile(r"\b(a|an|the)\b", re.UNICODE)
            return re.sub(regex, " ", text)

        def white_space_fix(text):
            return " ".join(text.split())

        def remove_punc(text):
            exclude = set(string.punctuation)
            return "".join(ch for ch in text if ch not in exclude)

        def lower(text):
            return text.lower()

        return white_space_fix(remove_articles(remove_punc(lower(s))))

    def compute_f1(self, prediction, truth):
        pred_tokens = self.normalize_text(prediction).split()
        truth_tokens = self.normalize_text(truth).split()

        # if either the prediction or the truth is no-answer
        # then f1 = 1 if they agree, 0 otherwise
        if len(pred_tokens) == 0 or len(truth_tokens) == 0:
            return int(pred_tokens == truth_tokens)

        common_tokens = set(pred_tokens) & set(truth_tokens)

        # if there are no common tokens then f1 = 0
        if len(common_tokens) == 0:
            return 0

        prec = len(common_tokens) / len(pred_tokens)
        rec = len(common_tokens) / len(truth_tokens)

        return 2 * (prec * rec) / (prec + rec)

    def compute_question_answering_metrics(self, selection_indexes):
        dashboard_dataset = self.get_data().dataset
        true_y = dashboard_dataset.true_y
        predicted_y = dashboard_dataset.predicted_y
        all_cohort_metrics = []
        for cohort_indices in selection_indexes:
            true_y_cohort = [true_y[cohort_index] for cohort_index
                             in cohort_indices]
            predicted_y_cohort = [predicted_y[cohort_index] for cohort_index
                                  in cohort_indices]
            f1_score = []
            for cohort_index in cohort_indices:
                f1_score.append(self.compute_f1(predicted_y[cohort_index],
                                                true_y[cohort_index]))
            try:
                exact_match = evaluate.load('exact_match')
                exact_match_results = exact_match.compute(
                    predictions=predicted_y_cohort, references=true_y_cohort)
                rouge = evaluate.load('rouge')
                rouge_results = rouge.compute(
                    predictions=predicted_y_cohort, references=true_y_cohort)
                bleu = evaluate.load('bleu')
                bleu_results = bleu.compute(
                    predictions=predicted_y_cohort, references=true_y_cohort)
                meteor = evaluate.load('meteor')
                meteor_results = meteor.compute(
                    predictions=predicted_y_cohort, references=true_y_cohort)
                bert_score = evaluate.load('bertscore')
                bert_score_results = bert_score.compute(
                    predictions=predicted_y_cohort, references=true_y_cohort,
                    model_type="distilbert-base-uncased")
                bert_f1_score = np.mean(bert_score_results['f1'])
                all_cohort_metrics.append(
                    [exact_match_results['exact_match'], np.mean(f1_score),
                     meteor_results['meteor'], bleu_results['bleu'],
                     bert_f1_score, rouge_results['rougeL']])
            except ValueError:
                all_cohort_metrics.append([0, 0, 0, 0, 0, 0])
        return all_cohort_metrics
