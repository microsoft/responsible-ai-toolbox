# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the RAIVisionInsights class."""

import base64
import io
import json
import os
import pickle
import shutil
import warnings
from enum import Enum
from pathlib import Path
from typing import Any, Optional

import matplotlib.pyplot as pl
import numpy as np
import pandas as pd
import torch
from ml_wrappers import wrap_model
from ml_wrappers.common.constants import Device
from torchmetrics.detection.mean_ap import MeanAveragePrecision

from erroranalysis._internal.cohort_filter import FilterDataWithCohortFilters
from raiutils.data_processing import convert_to_list
from raiutils.models.model_utils import SKLearn
from responsibleai._interfaces import Dataset, RAIInsightsData
from responsibleai._internal.constants import (ManagerNames, Metadata,
                                               SerializationAttributes)
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.feature_metadata import FeatureMetadata
from responsibleai.rai_insights.rai_base_insights import RAIBaseInsights
from responsibleai.serialization_utilities import serialize_json_safe
from responsibleai_vision.common.constants import (CommonTags,
                                                   ExplainabilityDefaults,
                                                   ImageColumns,
                                                   MLFlowSchemaLiterals,
                                                   ModelTask)
from responsibleai_vision.managers.error_analysis_manager import \
    ErrorAnalysisManager
from responsibleai_vision.managers.explainer_manager import ExplainerManager
from responsibleai_vision.utils.feature_extractors import extract_features
from responsibleai_vision.utils.image_reader import (
    get_base64_string_from_path, get_image_from_path, is_automl_image_model)
from responsibleai_vision.utils.image_utils import (
    convert_images, get_images, transform_object_detection_labels)

IMAGE = ImageColumns.IMAGE.value
IMAGE_URL = ImageColumns.IMAGE_URL.value
DEFAULT_MAX_EVALS = ExplainabilityDefaults.DEFAULT_MAX_EVALS
DEFAULT_NUM_MASKS = ExplainabilityDefaults.DEFAULT_NUM_MASKS
DEFAULT_MASK_RES = ExplainabilityDefaults.DEFAULT_MASK_RES
_IMAGE_MODE = 'image_mode'
_IMAGE_DOWNLOADER = 'image_downloader'
_IMAGE_WIDTH = 'image_width'
_MAX_EVALS = 'max_evals'
_NUM_MASKS = 'num_masks'
_MASK_RES = 'mask_res'
_DEVICE = 'device'
_PREDICTIONS = 'predictions'
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
_MODEL = Metadata.MODEL
_MODEL_PKL = _MODEL + '.pkl'
_SERIALIZER = 'serializer'
_TRANSFORMATIONS = 'transformations'
_MLTABLE_DIR = 'mltables'
_MLTABLE_METADATA_FILENAME = 'metadata.json'
_TEST_MLTABLE_PATH = 'test_mltable_path'
_FEATURE_METADATA = Metadata.FEATURE_METADATA
_IDENTITY_FEATURE_NAME = 'identity_feature_name'
_DATETIME_FEATURES = 'datetime_features'
_TIME_SERIES_ID_FEATURES = 'time_series_id_features'
_CATEGORICAL_FEATURES = 'categorical_features'
_DROPPED_FEATURES = 'dropped_features'


def reshape_image(image):
    """Reshape image to have one extra dimension for rows.

    :param image: Image to reshape.
    :type image: numpy.ndarray
    :return: Reshaped image.
    :rtype: numpy.ndarray
    """
    image_shape_len = len(image.shape)
    if image_shape_len != 2 and image_shape_len != 3:
        raise ValueError('Image must have 2 or 3 dimensions')
    return np.expand_dims(image, axis=0)


class RAIVisionInsights(RAIBaseInsights):
    """Defines the top-level RAIVisionInsights API.

    Use RAIVisionInsights to assess vision machine learning models in a
    single API.
    """

    def __init__(self, model: Any,
                 test: pd.DataFrame,
                 target_column: str, task_type: str,
                 classes: Optional[np.ndarray] = None,
                 serializer: Optional[Any] = None,
                 maximum_rows_for_test: int = 5000,
                 image_mode: str = "RGB",
                 test_data_path: Optional[str] = None,
                 transformations: Optional[Any] = None,
                 image_downloader: Optional[Any] = None,
                 feature_metadata: Optional[FeatureMetadata] = None,
                 image_width: Optional[float] = None,
                 max_evals: Optional[int] = DEFAULT_MAX_EVALS,
                 num_masks: Optional[int] = DEFAULT_NUM_MASKS,
                 mask_res: Optional[int] = DEFAULT_MASK_RES,
                 device: Optional[str] = Device.AUTO.value):
        """Creates an RAIVisionInsights object.

        :param model: The model to compute RAI insights for.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param test: The test dataframe including the label column.
        :type test: pd.DataFrame
        :param target_column: The name of the label column or list of columns.
            This is a list of columns for multilabel models.
        :type target_column:  str or list[str]
        :param task_type: The task to run.
        :type task_type: str
        :param classes: The class labels in the dataset.
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
        :param image_mode: The mode to open the image in.
            See pillow documentation for all modes:
            https://pillow.readthedocs.io/en/stable/handbook/concepts.html
        :type image_mode: str
        :param test_data_path: The path to the test data.
        :type test_data_path: str
        :param transformations: The transformations to apply to the image.
            This must be a callable or a string column name with
            transformed images.
        :type transformations: object
        :param image_downloader: The image downloader to use to download
            images from a URL.
        :type image_downloader: object
        :param feature_metadata: Feature metadata for the dataset
            to identify different kinds of features.
        :type feature_metadata: Optional[FeatureMetadata]
        :param image_width: The width to resize the image to.
            The size is in inches. Note larger resolutions in
            dashboard can cause slowness and memory errors.
            If not specified does not resize images.
        :type image_width: float
        :param max_evals: The maximum number of evaluations to run.
            Used by shap hierarchical image explainer.
            If not specified defaults to 100.
        :type max_evals: int
        :param num_masks: The number of masks to use for the
            DRISE image explainer for object detection.
            If not specified defaults to 50.
        :type num_masks: int
        :param mask_res: The resolution of the masks to use for the
            DRISE image explainer for object detection.
            If not specified defaults to 4.
        :type mask_res: int
        :param device: The device to run the model on.
            If not specified defaults to Device.AUTO.
        :type device: str
        """
        # drop index as this can cause issues later like when copying
        # target column below from test dataset to _ext_test_df
        test = test.reset_index(drop=True)
        if feature_metadata is None:
            # initialize to avoid having to keep checking if it is None
            feature_metadata = FeatureMetadata()
        self._feature_metadata = feature_metadata
        self.image_mode = image_mode
        self.image_width = image_width
        if max_evals is None:
            max_evals = DEFAULT_MAX_EVALS
        elif max_evals < 1:
            raise ValueError('max_evals must be greater than 0')
        if num_masks is None:
            num_masks = DEFAULT_NUM_MASKS
        elif num_masks < 1:
            raise ValueError('num_masks must be greater than 0')
        if mask_res is None:
            mask_res = DEFAULT_MASK_RES
        elif mask_res < 1:
            raise ValueError('mask_res must be greater than 0')
        if device is None:
            device = Device.AUTO.value
        self.max_evals = max_evals
        self.num_masks = num_masks
        self.mask_res = mask_res
        self.device = device
        self.test_mltable_path = test_data_path
        self._transformations = transformations
        self._image_downloader = image_downloader
        sample = test.iloc[0:2]
        sample = get_images(sample, self.image_mode, self._transformations)
        self._wrapped_model = wrap_model(
            model, sample, task_type, classes=classes, device=device)

        # adding this field to use in _get_single_image and _save_predictions
        self._task_type = task_type

        self.automl_image_model = is_automl_image_model(self._wrapped_model)

        self._validate_rai_insights_input_parameters(
            model=self._wrapped_model, test=test,
            target_column=target_column, task_type=task_type,
            classes=classes,
            serializer=serializer,
            maximum_rows_for_test=maximum_rows_for_test)
        self._classes = RAIVisionInsights._get_classes(
            task_type=task_type,
            test=test,
            target_column=target_column,
            classes=classes
        )
        self.predict_output = None
        if task_type == ModelTask.OBJECT_DETECTION:
            test = transform_object_detection_labels(
                test, target_column, self._classes)
        super(RAIVisionInsights, self).__init__(
            model, None, test, target_column, task_type,
            serializer)

        ext_test, ext_features = extract_features(
            self.test, self.target_column, self.task_type,
            self.image_mode,
            self._feature_metadata.dropped_features)
        self._ext_test = ext_test
        self._ext_features = ext_features

        self._ext_test_df = pd.DataFrame(ext_test, columns=ext_features)
        self._ext_test_df[target_column] = test[target_column]
        self._initialize_managers()

    def _initialize_managers(self):
        """Initializes the managers.

        Initializes the explainer manager.
        """
        self._explainer_manager = ExplainerManager(
            self._wrapped_model, self.test,
            self.target_column,
            self.task_type,
            self._classes,
            self.image_mode,
            self.max_evals,
            self.num_masks,
            self.mask_res)
        self._error_analysis_manager = ErrorAnalysisManager(
            self._wrapped_model, self.test, self._ext_test_df,
            self.target_column,
            self.task_type,
            self.image_mode,
            self._transformations,
            self._classes,
            self._feature_metadata.categorical_features)
        self._managers = [self._explainer_manager,
                          self._error_analysis_manager]

    def compute(self, **kwargs):
        """Calls compute on each of the managers."""
        for manager in self._managers:
            manager.compute(**kwargs)

    @staticmethod
    def _get_classes(task_type, test, target_column, classes):
        if task_type == ModelTask.IMAGE_CLASSIFICATION:
            if classes is None:
                classes = test[target_column].unique()
                # sort the classes after calling unique in numeric case
                classes.sort()
                return classes
            else:
                return classes
        elif task_type == ModelTask.MULTILABEL_IMAGE_CLASSIFICATION:
            if classes is None:
                return target_column
            else:
                return classes
        elif task_type == ModelTask.OBJECT_DETECTION:
            return classes
        else:
            return classes

    def _validate_rai_insights_input_parameters(
            self, model: Any, test: pd.DataFrame,
            target_column: str, task_type: str,
            classes: np.ndarray,
            serializer,
            maximum_rows_for_test: int):
        """Validate the inputs for the RAIVisionInsights constructor.

        :param model: The model to compute RAI insights for.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param test: The test dataset including the label column.
        :type test: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: The task to run, can be `classification` or
            `regression`.
        :type task_type: str
        :param classes: The class labels in the dataset.
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
            ModelTask.IMAGE_CLASSIFICATION.value,
            ModelTask.MULTILABEL_IMAGE_CLASSIFICATION.value,
            ModelTask.OBJECT_DETECTION.value
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

        if task_type == ModelTask.MULTILABEL_IMAGE_CLASSIFICATION.value:
            if not isinstance(target_column, list):
                raise UserConfigValidationException(
                    'The target_column should be a list for multilabel '
                    'classification')
            # check all target columns are present in test dataset
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

        if model is not None:
            # Pick one row from test data
            test_img = self._get_single_image(test, target_column)
            # Call the model
            try:
                model.predict(test_img)
            except Exception:
                raise UserConfigValidationException(
                    'The model passed cannot be used for'
                    ' getting predictions via predict()'
                )

    def _get_single_image(self, dataset, target_column):
        """Get a single image from the test data.

        Used for calling predict on the dataset.

        :param dataset: The dataset to get the image from.
        :type dataset: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :return: A single image from the test data
        :rtype: numpy.ndarray
        """
        # Pick one row from dataset
        if not isinstance(target_column, list):
            target_column = [target_column]
        img = dataset.drop(
            target_column, axis=1).iloc[0][0]
        if isinstance(img, str):
            if self.automl_image_model:
                if self._task_type == ModelTask.OBJECT_DETECTION:
                    img_data, img_size = get_base64_string_from_path(
                        img, return_image_size=True)
                    img = pd.DataFrame(
                        data=[[img_data, img_size]],
                        columns=[
                            MLFlowSchemaLiterals.INPUT_COLUMN_IMAGE,
                            MLFlowSchemaLiterals.INPUT_IMAGE_SIZE],
                    )
                else:
                    img = pd.DataFrame(
                        data=[get_base64_string_from_path(img)],
                        columns=[MLFlowSchemaLiterals.INPUT_COLUMN_IMAGE],
                    )
                return img
            else:
                img = get_image_from_path(img, self.image_mode)
        # apply a transformation if the image is an RGBA image
        if img[0][0].size == 4:
            row, col, ch = img.shape
            if ch == 4:
                rgb = np.zeros((row, col, 3), dtype='float32')
                r, g, b = img[:, :, 0], img[:, :, 1], img[:, :, 2]
                a = np.asarray(img[:, :, 3], dtype='float32') / 255.0

                rgb[:, :, 0] = r * a + (1.0 - a) * 255.0
                rgb[:, :, 1] = g * a + (1.0 - a) * 255.0
                rgb[:, :, 2] = b * a + (1.0 - a) * 255.0
                img = rgb
        return reshape_image(img)

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
        dataset = self._get_dataset()
        data.dataset = dataset
        data.errorAnalysisData = self.error_analysis.get_data()
        return data

    def _get_dataset(self):
        dashboard_dataset = Dataset()
        tasktype = self.task_type
        classification_tasks = [ModelTask.IMAGE_CLASSIFICATION,
                                ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
                                ModelTask.OBJECT_DETECTION]
        is_classification_task = self.task_type in classification_tasks
        if isinstance(self.task_type, Enum):
            tasktype = self.task_type.value
        dashboard_dataset.task_type = tasktype
        categorical_features = self._feature_metadata.categorical_features
        if categorical_features is None:
            categorical_features = []
        dashboard_dataset.categorical_features = categorical_features
        dashboard_dataset.class_names = convert_to_list(
            self._classes)

        if is_classification_task:
            if self.automl_image_model:
                dataset = np.array(self.test.drop(
                    [self.target_column], axis=1).iloc[:, 0].tolist())

                if tasktype == ModelTask.OBJECT_DETECTION.value:
                    dataset = pd.DataFrame(
                        data=[[x for x in get_base64_string_from_path(
                            img_path, return_image_size=True)] for
                            img_path in dataset],
                        columns=[
                            MLFlowSchemaLiterals.INPUT_COLUMN_IMAGE,
                            MLFlowSchemaLiterals.INPUT_IMAGE_SIZE],
                    )
                else:
                    dataset = pd.DataFrame(
                        data=[
                            get_base64_string_from_path(img_path)
                            for img_path in dataset
                        ],
                        columns=[MLFlowSchemaLiterals.INPUT_COLUMN_IMAGE],
                    )
            else:
                dataset = get_images(self.test, self.image_mode,
                                     self._transformations)
        else:
            raise ValueError('Unknown task type: {}'.format(self.task_type))
        predicted_y = None
        if dataset is not None and self._wrapped_model is not None:
            try:
                predicted_y = self._wrapped_model.predict(dataset)
            except Exception as ex:
                msg = ('Model does not support predict method for given '
                       'dataset type')
                raise ValueError(msg) from ex
            try:
                predicted_y = convert_to_list(predicted_y)
            except Exception as ex:
                raise ValueError(
                    'Model prediction output of unsupported type,') from ex
        if predicted_y is not None:
            if is_classification_task:
                predicted_y = self._convert_labels(
                    predicted_y, dashboard_dataset.class_names)
            dashboard_dataset.predicted_y = predicted_y
            if tasktype == ModelTask.OBJECT_DETECTION:
                dashboard_dataset.object_detection_predicted_y = predicted_y
        row_length = len(dataset)

        dashboard_dataset.features = self._ext_test

        true_y = self.test[self.target_column]
        if true_y is not None and len(true_y) == row_length:
            true_y = convert_to_list(true_y)
            if is_classification_task:
                true_y = self._convert_labels(
                    true_y, dashboard_dataset.class_names)
            dashboard_dataset.true_y = true_y
            if tasktype == ModelTask.OBJECT_DETECTION:
                dashboard_dataset.object_detection_true_y = true_y

        dashboard_dataset.feature_names = self._ext_features
        dashboard_dataset.target_column = self.target_column

        column_names = list(self.test.columns)
        if IMAGE in column_names:
            images = self.test[:].image
        elif IMAGE_URL in column_names:
            images = self.test[:].image_url
        else:
            raise ValueError('No image column found in test data')
        encoded_images = []
        image_dimensions = []

        for _, image in enumerate(images):
            if isinstance(image, str):
                image = get_image_from_path(image, self.image_mode)
            s = io.BytesIO()
            # IMshow only accepts floats in range [0, 1]
            try:
                image /= 255
            except Exception:
                # In-place divide can fail for certain types
                image = image / 255
            axes = pl.gca()
            axes.get_xaxis().set_visible(False)
            axes.get_yaxis().set_visible(False)

            pl.imshow(image)
            # resize image as optimization
            size = pl.gcf().get_size_inches()
            curr_width = size[0]
            curr_height = size[1]
            image_dimensions.append([image.shape[1], image.shape[0]])
            new_width = self.image_width
            if new_width is not None:
                factor = new_width / curr_width
                pl.gcf().set_size_inches((new_width, curr_height * factor))
            pl.savefig(s, format='jpg', bbox_inches='tight', pad_inches=0.)
            pl.clf()
            s.seek(0)
            b64_encoded = base64.b64encode(s.read())
            b64 = b64_encoded.decode(CommonTags.IMAGE_DECODE_UTF_FORMAT)
            encoded_images.append(b64)

        # passing to frontend to draw bounding boxes with the correct scale
        dashboard_dataset.imageDimensions = image_dimensions

        if len(encoded_images) > 0:
            dashboard_dataset.images = encoded_images

        if tasktype == ModelTask.OBJECT_DETECTION:
            d = dashboard_dataset
            dashboard_dataset.object_detection_predicted_y = d.predicted_y
            dashboard_dataset.object_detection_true_y = d.true_y
            dashboard_dataset.predicted_y = self._format_od_labels(
                dashboard_dataset.predicted_y,
                class_names=dashboard_dataset.class_names
            )

            dashboard_dataset.true_y = self._format_od_labels(
                dashboard_dataset.true_y,
                class_names=dashboard_dataset.class_names
            )

        return dashboard_dataset

    def _format_od_labels(self, y, class_names):
        """Formats the Object Detection label representation to
        multi-label image classification to follow the UI format
        provided in fridgeMultilabel.ts.

        :param y: Target array
        :type y: list
        :param class_names: The class labels in the dataset.
        :type class_names: list
        :return: Formatted list of targets
        :rtype: list
        """
        formatted_labels = []

        for image in y:
            object_labels_lst = [0] * len(class_names)
            for detection in image:
                # tracking number of same objects in the image
                object_labels_lst[int(detection[0] - 1)] += 1
            formatted_labels.append(object_labels_lst)

        return formatted_labels

    def _convert_images(self, dataset):
        """Converts the images to the format required by the model.

        If the images are base64 encoded, they are decoded and converted to
        numpy arrays. If the images are already numpy arrays, they are
        returned as is.

        :param dataset: The dataset to convert.
        :type dataset: numpy.ndarray
        :return: The converted dataset.
        :rtype: numpy.ndarray
        """
        return convert_images(dataset, self.image_mode)

    def _convert_images_base64_df(self, dataset: pd.DataFrame) -> pd.DataFrame:
        """Converts the images to the format required by the model.

        If the images are base64 encoded, they are decoded and converted to
        numpy arrays. If the images are already numpy arrays, they are
        returned as is.

        :param dataset: The dataset to convert.
        :type dataset: pandas.DataFrame
        :return: The base64 converted dataset.
        :rtype: pandas.DataFrame
        """
        if len(dataset) > 0 and isinstance(dataset[0], str):
            dataset.loc[:, ImageColumns.IMAGE.value] = dataset.loc[
                :, ImageColumns.IMAGE.value
            ].map(lambda x: get_base64_string_from_path(x))
        return dataset

    def save(self, path):
        """Save the RAIVisionInsights to the given path.

        In addition to the usual data, saves the extracted features.

        :param path: The directory path to save the RAIInsights to.
        :type path: str
        """
        super(RAIVisionInsights, self).save(path)
        # Save extracted features data
        self._save_ext_data(path)
        self._save_transformations(path)
        self._save_image_downloader(path)

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

        if self._image_downloader:
            mltable_directory = data_directory / _MLTABLE_DIR
            os.makedirs(mltable_directory, exist_ok=True)
            mltable_data_dict = {}
            if self.test_mltable_path:
                mltable_dir = self.test_mltable_path.split('/')[-1]
                mltable_data_dict[_TEST_MLTABLE_PATH] = mltable_dir
                test_dir = mltable_directory / mltable_dir
                shutil.copytree(
                    Path(self.test_mltable_path), test_dir
                )
            if mltable_data_dict:
                dict_path = mltable_directory / _MLTABLE_METADATA_FILENAME
                with open(dict_path, 'w') as file:
                    json.dump(
                        mltable_data_dict, file, default=serialize_json_safe)

    def _save_transformations(self, path):
        """Save the transformations to the given path using pickle.

        :param path: The directory path to save the transformations to.
        :type path: str
        """
        if self._transformations is not None:
            transformations_path = Path(path) / _TRANSFORMATIONS
            with open(transformations_path, 'wb') as f:
                pickle.dump(self._transformations, f)

    def _save_image_downloader(self, path):
        """Save the image downloader to the given path using pickle.

        :param path: The directory path to save the image downloader to.
        :type path: str
        """
        if self._image_downloader is not None:
            image_downloader_path = Path(path) / _IMAGE_DOWNLOADER
            with open(image_downloader_path, 'wb') as f:
                pickle.dump(self._image_downloader, f)

    def _save_list_data(self, data_path, data):
        """Save the list data to the given path.

        :param data_path: The path to save the data to.
        :type data_path: str
        :param data: The data to save.
        :type data: list
        """
        with open(data_path, 'w') as file:
            json.dump(data, file, default=serialize_json_safe)

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
        if self.task_type == ModelTask.OBJECT_DETECTION:
            return labels

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

        :param path: The directory path to save the RAIVisionInsights to.
        :type path: str
        """
        prediction_output_path = Path(path) / _PREDICTIONS
        prediction_output_path.mkdir(parents=True, exist_ok=True)

        if self.model is None:
            return

        if self.automl_image_model:
            test = np.array(
                self.test.drop([self.target_column], axis=1)
                .iloc[:, 0]
                .tolist()
            )
            if self._task_type == ModelTask.OBJECT_DETECTION.value:
                test = pd.DataFrame(
                    data=[[x for x in get_base64_string_from_path(
                        img_path, return_image_size=True)] for
                        img_path in test],
                    columns=[
                        MLFlowSchemaLiterals.INPUT_COLUMN_IMAGE,
                        MLFlowSchemaLiterals.INPUT_IMAGE_SIZE],
                )
            else:
                test = pd.DataFrame(
                    data=[
                        get_base64_string_from_path(img_path) for img_path in
                        test
                    ],
                    columns=[MLFlowSchemaLiterals.INPUT_COLUMN_IMAGE],
                )
        else:
            test = get_images(
                self.test, self.image_mode, self._transformations
            )

        predict_output = self._wrapped_model.predict(test)
        if type(predict_output) != list:
            predict_output = predict_output.tolist()

        self._write_to_file(
            prediction_output_path / (_PREDICT + _JSON_EXTENSION),
            json.dumps(predict_output))

        if hasattr(self.model, SKLearn.PREDICT_PROBA):
            predict_proba_output = self.model.predict_proba(test)
            if type(predict_proba_output) != list:
                predict_proba_output = predict_proba_output.tolist()

            self._write_to_file(
                prediction_output_path / (_PREDICT_PROBA + _JSON_EXTENSION),
                json.dumps(predict_proba_output))

    def _save_metadata(self, path):
        """Save the metadata like target column, categorical features,
           task type and the classes (if any).

        :param path: The directory path to save the RAIVisionInsights to.
        :type path: str
        """
        top_dir = Path(path)
        classes = convert_to_list(self._classes)
        feature_metadata_dict = self._feature_metadata.to_dict()
        meta = {
            _TARGET_COLUMN: self.target_column,
            _TASK_TYPE: self.task_type,
            _CLASSES: classes,
            _IMAGE_MODE: self.image_mode,
            _FEATURE_METADATA: feature_metadata_dict,
            _IMAGE_WIDTH: self.image_width,
            _MAX_EVALS: self.max_evals,
            _NUM_MASKS: self.num_masks,
            _MASK_RES: self.mask_res,
            _DEVICE: self.device
        }
        with open(top_dir / _META_JSON, 'w') as file:
            json.dump(meta, file)

    @staticmethod
    def _load_metadata(inst, path):
        """Load the metadata.

        :param inst: RAIVisionInsights object instance.
        :type inst: RAIVisionInsights
        :param path: The directory path to metadata location.
        :type path: str
        """
        top_dir = Path(path)
        with open(top_dir / _META_JSON, 'r') as meta_file:
            meta = meta_file.read()
        meta = json.loads(meta)
        inst.__dict__[_TARGET_COLUMN] = meta[_TARGET_COLUMN]
        inst.__dict__[_TASK_TYPE] = meta[_TASK_TYPE]
        inst.__dict__[_IMAGE_MODE] = meta[_IMAGE_MODE]
        if _IMAGE_WIDTH in meta:
            inst.__dict__[_IMAGE_WIDTH] = meta[_IMAGE_WIDTH]
        else:
            inst.__dict__[_IMAGE_WIDTH] = None
        params = [_MAX_EVALS, _NUM_MASKS, _MASK_RES, _DEVICE]
        defaults = [DEFAULT_MAX_EVALS, DEFAULT_NUM_MASKS,
                    DEFAULT_MASK_RES, Device.AUTO.value]
        for param, default in zip(params, defaults):
            if param in meta:
                inst.__dict__[param] = meta[param]
            else:
                inst.__dict__[param] = default
        classes = meta[_CLASSES]

        inst.__dict__['_' + _CLASSES] = RAIVisionInsights._get_classes(
            task_type=meta[_TASK_TYPE],
            test=inst.__dict__[_TEST],
            target_column=meta[_TARGET_COLUMN],
            classes=classes
        )

        if (Metadata.FEATURE_METADATA not in meta or
                meta[Metadata.FEATURE_METADATA] is None):
            inst.__dict__['_' + Metadata.FEATURE_METADATA] = FeatureMetadata()
        else:
            inst.__dict__['_' + Metadata.FEATURE_METADATA] = FeatureMetadata(
                identity_feature_name=meta[Metadata.FEATURE_METADATA][
                    _IDENTITY_FEATURE_NAME],
                datetime_features=meta[Metadata.FEATURE_METADATA][
                    _DATETIME_FEATURES],
                time_series_id_features=meta[Metadata.FEATURE_METADATA][
                    _TIME_SERIES_ID_FEATURES],
                categorical_features=meta[Metadata.FEATURE_METADATA][
                    _CATEGORICAL_FEATURES],
                dropped_features=meta[Metadata.FEATURE_METADATA][
                    _DROPPED_FEATURES])

        # load the image downloader as part of metadata
        RAIVisionInsights._load_image_downloader(inst, path)
        # load the transformations as part of metadata
        RAIVisionInsights._load_transformations(inst, path)
        # load the extracted features as part of metadata
        RAIVisionInsights._load_ext_data(inst, path)

    @staticmethod
    def _load_ext_data(inst, path):
        """Load the extracted features data.

        :param inst: RAIVisionInsights object instance.
        :type inst: RAIVisionInsights
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

        inst.test_mltable_path = None
        mltable_directory = data_path / _MLTABLE_DIR
        if inst._image_downloader and len(os.listdir(mltable_directory)) > 0:
            mltable_dict_path = mltable_directory / _MLTABLE_METADATA_FILENAME
            mltable_dict = {}
            with open(mltable_dict_path, 'r') as file:
                mltable_dict = json.load(file)

            if mltable_dict.get(_TEST_MLTABLE_PATH, ''):
                inst.test_mltable_path = str(mltable_directory / mltable_dict[
                    _TEST_MLTABLE_PATH])
                test_dataset = inst._image_downloader(inst.test_mltable_path)
                inst.test = test_dataset._images_df

    @staticmethod
    def _load_transformations(inst, path):
        """Load the transformations from pickle file.

        :param inst: RAIVisionInsights object instance.
        :type inst: RAIVisionInsights
        :param path: The directory path to transformations location.
        :type path: str
        """
        top_dir = Path(path)
        transformations_file = top_dir / _TRANSFORMATIONS
        if transformations_file.exists():
            with open(transformations_file, 'rb') as file:
                inst._transformations = pickle.load(file)
        else:
            inst._transformations = None

    @staticmethod
    def _load_image_downloader(inst, path):
        """Load the image downloader from pickle file.

        :param inst: RAIVisionInsights object instance.
        :type inst: RAIVisionInsights
        :param path: The directory path to image downloader location.
        :type path: str
        """
        top_dir = Path(path)
        image_downloader_file = top_dir / _IMAGE_DOWNLOADER
        if image_downloader_file.exists():
            with open(image_downloader_file, 'rb') as file:
                inst._image_downloader = pickle.load(file)
        else:
            inst._image_downloader = None

    @staticmethod
    def load(path):
        """Load the RAIVisionInsights from the given path.

        :param path: The directory path to load the RAIVisionInsights from.
        :type path: str
        :return: The RAIVisionInsights object after loading.
        :rtype: RAIVisionInsights
        """
        # create the RAIVisionInsights without any properties using the __new__
        # function, similar to pickle
        inst = RAIVisionInsights.__new__(RAIVisionInsights)

        manager_map = {
            ManagerNames.EXPLAINER: ExplainerManager,
            ManagerNames.ERROR_ANALYSIS: ErrorAnalysisManager,
        }

        # load current state
        RAIBaseInsights._load(
            path, inst, manager_map, RAIVisionInsights._load_metadata)
        inst._wrapped_model = wrap_model(inst.model, inst.test, inst.task_type,
                                         classes=inst._classes,
                                         device=inst.device)
        inst.automl_image_model = is_automl_image_model(inst._wrapped_model)
        inst.predict_output = None
        return inst

    def compute_object_detection_metrics(
            self,
            selection_indexes,
            aggregate_method,
            class_name,
            iou_threshold,
            object_detection_cache):
        dashboard_dataset = self.get_data().dataset
        true_y = dashboard_dataset.object_detection_true_y
        predicted_y = dashboard_dataset.object_detection_predicted_y
        dashboard_dataset = self.get_data().dataset
        true_y = dashboard_dataset.object_detection_true_y
        predicted_y = dashboard_dataset.object_detection_predicted_y

        normalized_iou_threshold = [iou_threshold / 100.0]
        all_cohort_metrics = []
        for cohort_indices in selection_indexes:
            key = ','.join([str(cid) for cid in cohort_indices] +
                           [aggregate_method, class_name, str(iou_threshold)])
            if key in object_detection_cache:
                all_cohort_metrics.append(object_detection_cache[key])
                continue

            metric_OD = MeanAveragePrecision(
                class_metrics=True,
                iou_thresholds=normalized_iou_threshold,
                average=aggregate_method)
            true_y_cohort = [true_y[cohort_index] for cohort_index
                             in cohort_indices]
            predicted_y_cohort = [predicted_y[cohort_index] for cohort_index
                                  in cohort_indices]

            pred_boxes, pred_labels, pred_scores = [], [], []
            for pred_image in predicted_y_cohort:
                for pred_object in pred_image:
                    pred_labels.append(int(pred_object[0]))
                    pred_boxes.append(pred_object[1:5])
                    pred_scores.append(pred_object[-1])

            gt_boxes, gt_labels = [], []
            for gt_image in true_y_cohort:
                for gt_object in gt_image:
                    gt_labels.append(int(gt_object[0]))
                    gt_boxes.append(gt_object[1:5])
            # creating the list of dictionaries for pred and gt
            cohort_pred = [
                dict(
                    boxes=torch.tensor(pred_boxes),
                    scores=torch.tensor(pred_scores),
                    labels=torch.tensor(pred_labels),
                )
            ]
            cohort_gt = [
                dict(
                    boxes=torch.tensor(gt_boxes),
                    labels=torch.tensor(gt_labels),
                )
            ]

            # this is to find the class index given
            # that there might not all classes in the cohort to predict or gt
            classes = self._classes
            classes = list(classes)
            cohort_classes = list(set([classes[i - 1]
                                  for i in pred_labels + gt_labels]))
            cohort_classes.sort(
                key=lambda cname: classes.index(cname))
            # to catch if the class is not in the cohort
            if class_name not in cohort_classes:
                all_cohort_metrics.append([-1, -1, -1])
            else:
                metric_OD.update(cohort_pred,
                                 cohort_gt)
                object_detection_values = metric_OD.compute()
                mAP = round(object_detection_values
                            ['map'].item(), 2)
                APs = [round(value, 2) for value in
                       object_detection_values['map_per_class']
                       .detach().tolist()]
                ARs = [round(value, 2) for value in
                       object_detection_values['mar_100_per_class']
                       .detach().tolist()]

                assert len(APs) == len(ARs) == len(cohort_classes)

                all_submetrics = [[mAP, APs[i], ARs[i]]
                                  for i in range(len(APs))]
                all_cohort_metrics.append(all_submetrics)

        return [all_cohort_metrics, cohort_classes]
