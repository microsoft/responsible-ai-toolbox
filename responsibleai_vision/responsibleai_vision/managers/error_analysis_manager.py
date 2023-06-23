# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Error Analysis Manager class."""

import json
from typing import Any, List, Optional

import jsonschema
import numpy as np
import pandas as pd
from ml_wrappers import wrap_model

from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.error_report import as_error_report
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager
from responsibleai.managers.error_analysis_manager import \
    ErrorAnalysisManager as BaseErrorAnalysisManager
from responsibleai.managers.error_analysis_manager import as_error_config
from responsibleai_vision.common.constants import (MLFlowSchemaLiterals,
                                                   ModelTask)
from responsibleai_vision.utils.image_reader import (
    get_base64_string_from_path, is_automl_image_model)
from responsibleai_vision.utils.image_utils import get_images

LABELS = 'labels'


def _concat_labels_column(dataset, target_column, classes):
    """Concatenate labels column for multilabel models.

    :param dataset: The dataset including the label column.
    :type dataset: pandas.DataFrame
    :param target_column: The list of label columns in multilabel task.
    :type target_column: list[str]
    :param classes: The list of labels in multilabel task.
    :type classes: list
    :return: The labels column concatenated.
    :rtype: list
    """
    labels = []
    for _, row in dataset[target_column].iterrows():
        row_idxs = range(len(row))
        pred_classes = [classes[i] for i in row_idxs if row[i]]
        labels.append(','.join(pred_classes))
    return labels


class WrappedIndexPredictorModel:
    """Wraps model that uses index to retrieve image data for making
    predictions."""

    def __init__(self, model, dataset, image_mode, transformations,
                 task_type, classes=None):
        """Initialize the WrappedIndexPredictorModel.

        :param model: The model to wrap.
        :type model: object
        :param dataset: The dataset to use for making predictions.
        :type dataset: pandas.DataFrame
        :param image_mode: The mode to open the image in.
            See pillow documentation for all modes:
            https://pillow.readthedocs.io/en/stable/handbook/concepts.html
        :type image_mode: str
        :param transformations: The transformations to apply to the image.
        :type transformations: object
        :param task_type: The task to run.
        :type task_type: str
        :param classes: The classes for the model.
        :type classes: list
        """
        self.model = model
        self.dataset = dataset
        self.classes = classes
        self.image_mode = image_mode
        self.transformations = transformations
        self.task_type = task_type
        if task_type == ModelTask.OBJECT_DETECTION:
            return
        if is_automl_image_model(self.model):
            test = np.array(
                self.dataset.iloc[:, 0].tolist()
            )
            test = pd.DataFrame(
                data=[
                    get_base64_string_from_path(img_path) for img_path in test
                ],
                columns=[MLFlowSchemaLiterals.INPUT_COLUMN_IMAGE],
            )
        else:
            test = get_images(self.dataset, self.image_mode,
                              self.transformations)
        self.predictions = self.model.predict(test)
        if task_type == ModelTask.MULTILABEL_IMAGE_CLASSIFICATION:
            predictions_joined = []
            for row in self.predictions:
                # get all labels where prediction is 1
                pred_labels = [i for i in range(len(row)) if row[i]]
                if self.classes is not None:
                    pred_labels = [self.classes[i] for i in pred_labels]
                else:
                    pred_labels = [str(i) for i in pred_labels]
                # concatenate all predicted labels into a single string
                predictions_joined.append(','.join(pred_labels))
            self.predictions = np.array(predictions_joined)
        self.predict_proba = self.model.predict_proba(test)

    def predict(self, X):
        """Predict the class labels for the provided data.

        :param X: Data to predict the labels for.
        :type X: pandas.DataFrame
        :return: Predicted class labels.
        :rtype: list
        """
        index = X.index
        predictions = self.predictions[index]
        if self.task_type == ModelTask.MULTILABEL_IMAGE_CLASSIFICATION:
            return predictions
        if self.classes is not None:
            predictions = [self.classes[y] for y in predictions]
        return predictions

    def predict_proba(self, X):
        """Predict the class probabilities for the provided data.

        :param X: Data to predict the probabilities for.
        :type X: pandas.DataFrame
        :return: Predicted class probabilities.
        :rtype: list[list]
        """
        index = X.index
        pred_proba = self.predict_proba[index]
        return pred_proba


class ErrorAnalysisManager(BaseErrorAnalysisManager):

    """Defines a wrapper class of Error Analysis for vision scenario."""

    def __init__(self, model: Any, dataset: pd.DataFrame,
                 ext_dataset: pd.DataFrame, target_column: str,
                 task_type: str,
                 image_mode: str, transformations: Any,
                 classes: Optional[List] = None,
                 categorical_features: Optional[List[str]] = None):
        """Creates an ErrorAnalysisManager object.

        :param model: The model to analyze errors on.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param dataset: The dataset including the label column.
        :type dataset: pandas.DataFrame
        :param ext_dataset: The dataset of extracted features including the
                            label column.
        :type ext_dataset: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: The task to run.
        :type task_type: str
        :param image_mode: The mode to open the image in.
            See pillow documentation for all modes:
            https://pillow.readthedocs.io/en/stable/handbook/concepts.html
        :type image_mode: str
        :param transformations: The transformations to apply to the image.
        :type transformations: object
        :param classes: Class names as a list of strings.
            The order of the class names should match that of the model
            output.  Only required if analyzing a classifier.
        :type classes: list
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        """
        index_classes = classes
        is_od = task_type == ModelTask.OBJECT_DETECTION
        if isinstance(target_column, list) and not is_od:
            # create copy of dataset as we will make modifications to it
            dataset = dataset.copy()
            index_classes = target_column
            labels = _concat_labels_column(dataset, target_column,
                                           index_classes)
            dataset[LABELS] = labels
            ext_dataset[LABELS] = dataset[LABELS]
            dataset.drop(columns=target_column, inplace=True)
            ext_dataset.drop(columns=target_column, inplace=True)
            target_column = LABELS
        index_predictor = ErrorAnalysisManager._create_index_predictor(
            model, dataset, target_column, task_type, image_mode,
            transformations, index_classes)
        super(ErrorAnalysisManager, self).__init__(
            index_predictor, ext_dataset, target_column,
            classes, categorical_features)

    def compute(self, **kwargs):
        """Compute the error analysis data.

        :param kwargs: The keyword arguments to pass to the compute method.
            Note that this method does not take any arguments currently.
        :type kwargs: dict
        """
        super(ErrorAnalysisManager, self).compute()

    @staticmethod
    def _create_index_predictor(model, dataset, target_column, task_type,
                                image_mode, transformations, classes=None):
        """Creates a wrapped predictor that uses index to retrieve text data.

        :param model: The model to analyze errors on.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param dataset: The dataset including the label column.
        :type dataset: pandas.DataFrame
        :target_column: The name of the label column.
        :type target_column: str
        :param task_type: The task to run.
        :type task_type: str
        :param image_mode: The mode to open the image in.
            See pillow documentation for all modes:
            https://pillow.readthedocs.io/en/stable/handbook/concepts.html
        :type image_mode: str
        :param transformations: The transformations to apply to the image.
        :type transformations: Any
        :param classes: Class names as a list of strings.
            The order of the class names should match that of the model
            output.
        :type classes: list
        :return: A wrapped predictor that uses index to retrieve text data.
        :rtype: WrappedIndexPredictorModel
        """
        dataset = dataset.drop(columns=[target_column])
        index_predictor = WrappedIndexPredictorModel(
            model, dataset, image_mode, transformations, task_type, classes)
        return index_predictor

    @staticmethod
    def _load(path, rai_insights):
        """Load the ErrorAnalysisManager from the given path.

        :param path: The directory path to load the ErrorAnalysisManager from.
        :type path: str
        :param rai_insights: The loaded parent RAIInsights.
        :type rai_insights: RAIInsights
        :return: The ErrorAnalysisManager manager after loading.
        :rtype: ErrorAnalysisManager
        """
        # create the ErrorAnalysisManager without any properties using
        # the __new__ function, similar to pickle
        inst = ErrorAnalysisManager.__new__(ErrorAnalysisManager)

        ea_config_list = []
        ea_report_list = []
        all_ea_dirs = DirectoryManager.list_sub_directories(path)
        for ea_dir in all_ea_dirs:
            directory_manager = DirectoryManager(
                parent_directory_path=path,
                sub_directory_name=ea_dir)

            config_path = (directory_manager.get_config_directory() /
                           'config.json')
            with open(config_path, 'r') as file:
                ea_config = json.load(file, object_hook=as_error_config)
                ea_config_list.append(ea_config)

            report_path = (directory_manager.get_data_directory() /
                           'report.json')
            with open(report_path, 'r') as file:
                ea_report = json.load(file, object_hook=as_error_report)
                # Validate the serialized output against schema
                schema = ErrorAnalysisManager._get_error_analysis_schema()
                jsonschema.validate(
                    json.loads(ea_report.to_json()), schema)
                ea_report_list.append(ea_report)

        inst.__dict__['_ea_report_list'] = ea_report_list
        inst.__dict__['_ea_config_list'] = ea_config_list

        feature_metadata = rai_insights._feature_metadata
        categorical_features = feature_metadata.categorical_features
        inst.__dict__['_categorical_features'] = categorical_features
        target_column = rai_insights.target_column
        true_y = rai_insights._ext_test_df[target_column]
        if isinstance(target_column, list):
            dropped_cols = target_column
        else:
            dropped_cols = [target_column]
        dataset = rai_insights._ext_test_df.drop(columns=dropped_cols)
        inst.__dict__['_dataset'] = dataset
        feature_names = list(dataset.columns)
        inst.__dict__['_feature_names'] = feature_names
        task_type = rai_insights.task_type
        wrapped_model = wrap_model(rai_insights.model, dataset,
                                   rai_insights.task_type,
                                   classes=rai_insights._classes,
                                   device=rai_insights.device)
        inst.__dict__['_task_type'] = task_type
        index_classes = rai_insights._classes
        is_od = task_type == ModelTask.OBJECT_DETECTION
        index_dataset = rai_insights.test
        if isinstance(target_column, list) and not is_od:
            # create copy of dataset as we will make modifications to it
            index_dataset = index_dataset.copy()
            index_classes = target_column
            labels = _concat_labels_column(index_dataset, target_column,
                                           index_classes)
            index_dataset.drop(columns=target_column, inplace=True)
            index_dataset[LABELS] = labels
            target_column = LABELS
            true_y = index_dataset[target_column]
        inst.__dict__['_true_y'] = true_y
        index_predictor = ErrorAnalysisManager._create_index_predictor(
            wrapped_model, index_dataset, target_column,
            task_type, rai_insights.image_mode,
            rai_insights._transformations,
            rai_insights._classes)
        inst.__dict__['_analyzer'] = ModelAnalyzer(index_predictor,
                                                   dataset,
                                                   true_y,
                                                   feature_names,
                                                   categorical_features)
        return inst
