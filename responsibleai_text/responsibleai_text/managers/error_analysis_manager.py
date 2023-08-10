# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Error Analysis Manager class."""

import json
from typing import Any, List, Optional, Union

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
from responsibleai_text.common.constants import ModelTask
from responsibleai_text.utils.feature_extractors import get_text_columns

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
    """Wraps model that uses index to retrieve text data for making
    predictions."""

    def __init__(self, model, dataset, is_multilabel, task_type, classes=None):
        """Initialize the WrappedIndexPredictorModel.

        :param model: The model to wrap.
        :type model: object
        :param dataset: The dataset to use for making predictions.
        :type dataset: pandas.DataFrame
        :param is_multilabel: Whether the model is multilabel.
        :type is_multilabel: bool
        :param task_type: The task to run.
        :type task_type: str
        :param classes: The classes for the model.
        :type classes: list
        """
        self.model = model
        self.dataset = dataset
        self.classes = classes
        self.is_multilabel = is_multilabel
        self.task_type = task_type
        classif_tasks = [ModelTask.TEXT_CLASSIFICATION,
                         ModelTask.MULTILABEL_TEXT_CLASSIFICATION]
        if self.task_type in classif_tasks:
            dataset = self.dataset.iloc[:, 0].tolist()
            self.predictions = self.model.predict(dataset)
            self.predict_proba = self.model.predict_proba(dataset)
        elif self.task_type == ModelTask.QUESTION_ANSWERING:
            self.predictions = self.model.predict(
                self.dataset.loc[:, ['context', 'questions']])
            self.predictions = np.array(self.predictions)
        else:
            raise ValueError("Unknown task type: {}".format(self.task_type))

        if self.is_multilabel:
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

    def predict(self, X):
        """Predict the class labels for the provided data.

        :param X: Data to predict the labels for.
        :type X: pandas.DataFrame
        :return: Predicted class labels.
        :rtype: list
        """
        index = X.index
        predictions = self.predictions[index]
        if self.task_type == ModelTask.MULTILABEL_TEXT_CLASSIFICATION:
            return predictions
        if self.classes is not None and isinstance(predictions[0], int):
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

    """Defines a wrapper class of Error Analysis for text scenario."""

    def __init__(self, model: Any, dataset: pd.DataFrame,
                 ext_dataset: pd.DataFrame, target_column: str,
                 text_column: Optional[Union[str, List]],
                 task_type: str, classes: Optional[List] = None,
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
        :param target_column: The name of the label column or list of columns.
            This is a list of columns for multilabel models.
        :type target_column: str or list[str]
        :param text_column: The name of the text column or list of columns.
            This is a list of columns for question answering models.
        :type text_column: str or list[str]
        :param task_type: The task to run.
        :type task_type: str
        :param classes: Class names as a list of strings.
            The order of the class names should match that of the model
            output.  Only required if analyzing a classifier.
        :type classes: list
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        """
        is_multilabel = False
        index_classes = classes
        if isinstance(target_column, list):
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
            is_multilabel = True
        index_predictor = ErrorAnalysisManager._create_index_predictor(
            model, dataset, target_column, text_column, is_multilabel,
            task_type, index_classes)
        if categorical_features is None:
            categorical_features = []
        super(ErrorAnalysisManager, self).__init__(
            index_predictor, ext_dataset, target_column,
            classes, categorical_features)

    @staticmethod
    def _create_index_predictor(model, dataset, target_column,
                                text_column, is_multilabel,
                                task_type, classes=None):
        """Creates a wrapped predictor that uses index to retrieve text data.

        :param model: The model to analyze errors on.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param dataset: The dataset including the label column.
        :type dataset: pandas.DataFrame
        :param target_column: The name of the label column or list of columns.
            This is a list of columns for multilabel models.
        :type target_column: str or list[str]
        :param text_column: The name of the text column or list of columns.
            This is a list of columns for question answering models.
        :type text_column: str or list[str]
        :param is_multilabel: Whether the model is multilabel.
        :type is_multilabel: bool
        :param task_type: The task to run.
        :type task_type: str
        :param classes: Class names as a list of strings.
            The order of the class names should match that of the model
            output.
        :type classes: list
        :return: A wrapped predictor that uses index to retrieve text data.
        :rtype: WrappedIndexPredictorModel
        """
        dataset = dataset.drop(columns=[target_column])
        dataset = get_text_columns(dataset, text_column)
        index_predictor = WrappedIndexPredictorModel(
            model, dataset, is_multilabel, task_type, classes)
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
        wrapped_model = wrap_model(rai_insights.model, dataset,
                                   rai_insights.task_type)
        is_multilabel = False
        index_classes = rai_insights._classes
        index_dataset = rai_insights.test
        if isinstance(target_column, list):
            index_dataset = index_dataset.copy()
            index_classes = target_column
            labels = _concat_labels_column(index_dataset, target_column,
                                           index_classes)
            index_dataset.drop(columns=target_column, inplace=True)
            index_dataset[LABELS] = labels
            target_column = LABELS
            is_multilabel = True
            true_y = index_dataset[target_column]
        inst.__dict__['_true_y'] = true_y
        inst.__dict__['_task_type'] = rai_insights.task_type
        text_column = rai_insights._text_column
        index_predictor = ErrorAnalysisManager._create_index_predictor(
            wrapped_model, index_dataset, target_column, text_column,
            is_multilabel, rai_insights.task_type, index_classes)
        inst.__dict__['_analyzer'] = ModelAnalyzer(index_predictor,
                                                   dataset,
                                                   true_y,
                                                   feature_names,
                                                   categorical_features)
        return inst
