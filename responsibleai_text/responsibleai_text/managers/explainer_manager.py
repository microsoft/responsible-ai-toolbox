# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Explainer Manager class."""

import json
import pickle
import warnings
from pathlib import Path
from typing import Any, List, Optional

import numpy as np
import pandas as pd
import shap

from raiutils.data_processing import convert_to_list
from responsibleai._interfaces import (FeatureImportance, ModelExplanationData,
                                       PrecomputedExplanations,
                                       TextFeatureImportance)
from responsibleai._internal.constants import ExplainerManagerKeys as Keys
from responsibleai._internal.constants import (ListProperties, ManagerNames,
                                               Metadata)
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.managers.base_manager import BaseManager
from responsibleai_text.common.constants import (ModelTask,
                                                 QuestionAnsweringFields,
                                                 Tokens)
from responsibleai_text.utils.question_answering import QAPredictor

CONTEXT = QuestionAnsweringFields.CONTEXT
QUESTIONS = QuestionAnsweringFields.QUESTIONS
SEP = Tokens.SEP
SPARSE_NUM_FEATURES_THRESHOLD = 1000
IS_RUN = 'is_run'
IS_ADDED = 'is_added'
CLASSES = 'classes'
U_EVALUATION_EXAMPLES = '_evaluation_examples'
FEATURES = 'features'
META_JSON = Metadata.META_JSON
MODEL = Metadata.MODEL
EXPLANATION = '_explanation'
TASK_TYPE = '_task_type'


class ExplainerManager(BaseManager):

    """Defines the ExplainerManager for explaining a text-based model."""

    def __init__(self, model: Any, evaluation_examples: pd.DataFrame,
                 target_column: str,
                 task_type: str,
                 classes: Optional[List] = None):
        """Creates an ExplainerManager object.

        :param model: The model to explain.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param evaluation_examples: A matrix of feature vector
            examples (# examples x # features) on which to explain the
            model's output, with an additional label column.
        :type evaluation_examples: pandas.DataFrame
        :param target_column: The name of the label column or list of columns.
            This is a list of columns for multilabel models.
        :type target_column: str or list[str]
        :param task_type: The task to run.
        :type task_type: str
        :param classes: Class names as a list of strings.
            The order of the class names should match that of the model
            output.  Only required if explaining classifier.
        :type classes: list
        """
        self._model = model
        self._target_column = target_column
        if not isinstance(target_column, list):
            target_column = [target_column]
        self._evaluation_examples = \
            evaluation_examples.drop(columns=target_column)
        self._is_run = False
        self._is_added = False
        self._features = list(self._evaluation_examples.columns)
        self._classes = classes
        self._explanation = None
        self._task_type = task_type

    def add(self):
        """Add an explainer to be computed later."""
        if self._model is None:
            raise UserConfigValidationException(
                'Model is required for model explanations')

        if self._is_added:
            warnings.warn(("DUPLICATE-EXPLAINER-CONFIG: Ignoring. "
                           "Explanation has already been added, "
                           "currently limited to one explainer type."),
                          UserWarning)
            return
        self._is_added = True

    def compute(self):
        """Creates an explanation by running the explainer on the model."""
        if not self._is_added:
            return
        if self._is_run:
            return
        if self._is_classification_task:
            if hasattr(self._model, 'predict_proba'):
                # use model-agnostic simple tokenizer
                masker = shap.maskers.Text()
                explainer = shap.Explainer(self._model.predict_proba,
                                           masker)
            else:
                explainer = shap.Explainer(self._model)
            eval_examples = self._evaluation_examples.iloc[:, 0].tolist()
            self._explanation = explainer(eval_examples)
        elif self._task_type == ModelTask.QUESTION_ANSWERING:
            qa_predictor = QAPredictor(self._model)
            qa_start = qa_predictor.predict_qa_start
            qa_output_names_func = qa_predictor.output_names
            qa_start.__func__.output_names = qa_output_names_func
            explainer_start = shap.Explainer(qa_start, self._model.tokenizer)
            qa_end = qa_predictor.predict_qa_end
            qa_end.__func__.output_names = qa_output_names_func
            explainer_end = shap.Explainer(qa_end, self._model.tokenizer)
            context = self._evaluation_examples[CONTEXT]
            questions = self._evaluation_examples[QUESTIONS]
            eval_examples = []
            for context, question in zip(context, questions):
                eval_examples.append(question + SEP + context)
            self._explanation = [explainer_start(eval_examples),
                                 explainer_end(eval_examples)]
        else:
            raise ValueError("Unknown task type: {}".format(self._task_type))

        self._is_run = True

    def get(self):
        """Get the computed explanation.

        Must be called after add and compute methods.

        :return: The computed explanations.
        :rtype:
            list[interpret_community.explanation.explanation.BaseExplanation]
        """
        if self._explanation:
            return [self._explanation]
        else:
            return []

    def list(self):
        """List information about the ExplainerManager.

        :return: A dictionary of properties.
        :rtype: dict
        """
        props = {ListProperties.MANAGER_TYPE: self.name}
        if self._explanation:
            props[Keys.IS_COMPUTED] = True
        else:
            props[Keys.IS_COMPUTED] = False
        return props

    def get_data(self):
        """Get explanation data

        :return: A array of ModelExplanationData.
        :rtype: List[ModelExplanationData]
        """
        return [self._get_interpret(i) for i in self.get()]

    @property
    def _is_multilabel_task(self):
        """Check if the task is a multilabel classification task.

        :return: True if the task is a multilabel classification task.
        :rtype: bool
        """
        return self._task_type == ModelTask.MULTILABEL_TEXT_CLASSIFICATION

    @property
    def _is_classification_task(self):
        """Check if the task is a classification task.

        :return: True if the task is a classification task.
        :rtype: bool
        """
        is_onelabel_task = self._task_type == ModelTask.TEXT_CLASSIFICATION
        is_multilabel_task = self._is_multilabel_task
        return is_onelabel_task or is_multilabel_task

    def _get_interpret(self, explanation):
        interpretation = ModelExplanationData()

        try:
            importances = FeatureImportance()
            features, scores, intercept = self._compute_global_importances(
                explanation)
            importances.featureNames = features
            importances.scores = scores
            importances.intercept = intercept
            text_feature_importances = self._compute_text_feature_importances(
                explanation)
            precomputedExplanations = PrecomputedExplanations()
            precomputedExplanations.globalFeatureImportance = importances
            precomputedExplanations.textFeatureImportance = \
                text_feature_importances
            interpretation.precomputedExplanations = precomputedExplanations
        except Exception as ex:
            raise ValueError(
                "Unsupported explanation type") from ex
        return interpretation

    def _compute_global_importances(self, explanation):
        """Compute global feature importances.

        :param explanation: The explanation.
        :type explanation: shap.Explanation
        :return: The feature names, scores, and intercept.
        :rtype: tuple[list[str], list[float], float]
        """
        is_classif_task = self._is_classification_task
        if is_classif_task:
            global_exp = explanation[:, :, :].mean(0)
            features = convert_to_list(global_exp.feature_names)
            scores = convert_to_list(np.abs(global_exp.values).mean(1))
            intercept = global_exp.base_values.mean(0)
        elif self._task_type == ModelTask.QUESTION_ANSWERING:
            flattened_start_features = explanation[0]._flatten_feature_names()
            flattened_end_features = explanation[1]._flatten_feature_names()
            scores = []
            features = []
            for key in flattened_start_features.keys():
                features.append(key)
                token_importances = []
                for importances_start, importances_end in zip(
                        flattened_start_features[key],
                        flattened_end_features[key]):
                    abs_start_imps = np.abs(importances_start)
                    abs_end_imps = np.abs(importances_end)
                    importances = (abs_start_imps + abs_end_imps) / 2
                    mean_importances = np.mean(importances)
                    token_importances.append(mean_importances)
                scores.append(np.mean(token_importances))
                start_base_values = explanation[0].base_values
                end_base_values = explanation[1].base_values
                base_values = [
                    sbv.mean() + ebv.mean() / 2
                    for sbv, ebv in zip(start_base_values, end_base_values)]
                intercept = sum(base_values) / len(base_values)
        else:
            raise ValueError("Unknown task type: {}".format(self._task_type))
        return features, scores, intercept

    def _compute_text_feature_importances(self, explanation):
        """Compute the text feature importances.

        :param explanation: The explanation.
        :type explanation: shap.Explanation
        :return: The text importances and corresponding tokens.
        :rtype: tuple[list[str], list[float], float]
        """
        text_feature_importances = []
        is_classif_task = self._is_classification_task
        if is_classif_task:
            for instance in explanation:
                text_feature_importance = TextFeatureImportance()
                text_feature_importance.localExplanations = \
                    instance.values.tolist()
                text_feature_importance.text = instance.data
                text_feature_importances.append(text_feature_importance)
        elif self._task_type == ModelTask.QUESTION_ANSWERING:
            for i_start, i_end in zip(explanation[0], explanation[1]):
                text_feature_importance = TextFeatureImportance()
                text_feature_importance.localExplanations = \
                    [i_start.values.tolist(), i_end.values.tolist()]
                text_feature_importance.text = i_start.data
                text_feature_importance.baseValues = \
                    [i_start.base_values.tolist(), i_end.base_values.tolist()]
                text_feature_importances.append(text_feature_importance)
        else:
            raise ValueError("Unknown task type: {}".format(
                self._task_type))
        return text_feature_importances

    @property
    def name(self):
        """Get the name of the explainer manager.

        :return: The name of the explainer manager.
        :rtype: str
        """
        return ManagerNames.EXPLAINER

    def _save(self, path):
        """Save the ExplainerManager to the given path.

        :param path: The directory path to save the ExplainerManager to.
        :type path: str
        """
        top_dir = Path(path)
        top_dir.mkdir(parents=True, exist_ok=True)
        if self._is_added:
            directory_manager = DirectoryManager(parent_directory_path=path)
            data_directory = directory_manager.create_data_directory()

            # save the explanation
            if self._explanation:
                with open(data_directory / ManagerNames.EXPLAINER, 'wb') as f:
                    pickle.dump(self._explanation, f)

            meta = {IS_RUN: self._is_run,
                    IS_ADDED: self._is_added}
            with open(data_directory / META_JSON, 'w') as file:
                json.dump(meta, file)

    @staticmethod
    def _load(path, rai_insights):
        """Load the ExplainerManager from the given path.

        :param path: The directory path to load the ExplainerManager from.
        :type path: str
        :param rai_insights: The loaded parent RAIInsights.
        :type rai_insights: RAIInsights
        :return: The ExplainerManager manager after loading.
        :rtype: ExplainerManager
        """
        # create the ExplainerManager without any properties using the __new__
        # function, similar to pickle
        inst = ExplainerManager.__new__(ExplainerManager)

        all_cf_dirs = DirectoryManager.list_sub_directories(path)
        if len(all_cf_dirs) != 0:
            directory_manager = DirectoryManager(
                parent_directory_path=path,
                sub_directory_name=all_cf_dirs[0])
            data_directory = directory_manager.get_data_directory()

            with open(data_directory / META_JSON, 'r') as meta_file:
                meta = meta_file.read()
            meta = json.loads(meta)
            inst.__dict__['_' + IS_RUN] = meta[IS_RUN]
            inst.__dict__['_' + IS_ADDED] = meta[IS_ADDED]

            inst.__dict__[EXPLANATION] = None
            explanation_path = data_directory / ManagerNames.EXPLAINER
            if explanation_path.exists():
                with open(explanation_path, 'rb') as f:
                    explanation = pickle.load(f)
                inst.__dict__[EXPLANATION] = explanation
        else:
            inst.__dict__['_' + IS_RUN] = False
            inst.__dict__['_' + IS_ADDED] = False
            inst.__dict__[EXPLANATION] = None

        inst.__dict__['_' + MODEL] = rai_insights.model
        inst.__dict__['_' + CLASSES] = rai_insights._classes
        target_column = rai_insights.target_column
        if not isinstance(target_column, list):
            target_column = [target_column]
        test = rai_insights.test.drop(columns=target_column)
        inst.__dict__[U_EVALUATION_EXAMPLES] = test
        inst.__dict__['_' + FEATURES] = list(test.columns)
        inst.__dict__[TASK_TYPE] = rai_insights.task_type

        return inst
