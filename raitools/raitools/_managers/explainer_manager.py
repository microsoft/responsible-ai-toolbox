# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Explainer Manager class."""

import warnings
import json
from scipy.sparse import issparse
from pathlib import Path
from interpret_community.mimic.mimic_explainer import MimicExplainer
from interpret_community.mimic.models.lightgbm_model import (
    LGBMExplainableModel)
from interpret_community.mimic.models.linear_model import (
    LinearExplainableModel)
from interpret_community.common.constants import ModelTask
from interpret_community.explanation.explanation import (
    save_explanation, load_explanation, FeatureImportanceExplanation)
from raitools._internal.constants import (
    ManagerNames, Metadata, ListProperties, ExplainerManagerKeys as Keys)
from raitools._managers.base_manager import BaseManager

SPARSE_NUM_FEATURES_THRESHOLD = 1000
IS_RUN = 'is_run'
IS_ADDED = 'is_added'
CLASSES = 'classes'
U_INITIALIZATION_EXAMPLES = '_initialization_examples'
U_EVALUATION_EXAMPLES = '_evaluation_examples'
FEATURES = 'features'
META_JSON = Metadata.META_JSON
MODEL = Metadata.MODEL


class ExplainerManager(BaseManager):

    """Defines the ExplainerManager for explaining a model.

    :param model: The model to explain.
        A model that implements sklearn.predict or sklearn.predict_proba
        or function that accepts a 2d ndarray.
    :type model: object
    :param initialization_examples: A matrix of feature vector
        examples (# examples x # features) for initializing the explainer,
        with an additional label column.
    :type initialization_examples: pandas.DataFrame
    :param evaluation_examples: A matrix of feature vector
        examples (# examples x # features) on which to explain the
        model's output, with an additional label column.
    :type evaluation_examples: pandas.DataFrame
    :param target_column: The name of the label column.
    :type target_column: str
    :param classes: Class names as a list of strings.
        The order of the class names should match that of the model
        output.  Only required if explaining classifier.
    :type classes: list
    """

    def __init__(self, model, initialization_examples, evaluation_examples,
                 target_column, classes=None):
        """Defines the ExplainerManager for explaining a model.

        :param model: The model to explain.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param initialization_examples: A matrix of feature vector
            examples (# examples x # features) for initializing the explainer,
            with an additional label column.
        :type initialization_examples: pandas.DataFrame
        :param evaluation_examples: A matrix of feature vector
            examples (# examples x # features) on which to explain the
            model's output, with an additional label column.
        :type evaluation_examples: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param classes: Class names as a list of strings.
            The order of the class names should match that of the model
            output.  Only required if explaining classifier.
        :type classes: list
        """
        self._model = model
        self._initialization_examples = \
            initialization_examples.drop(columns=[target_column])
        self._evaluation_examples = \
            evaluation_examples.drop(columns=[target_column])
        self._is_run = False
        self._is_added = False
        self._surrogate_model = None
        self._features = list(self._initialization_examples.columns)
        self._classes = classes
        self._target_column = target_column
        self._explanation = None

    def add(self):
        """Add an explainer to be computed later."""
        if self._is_added:
            warnings.warn(("Ignoring.  Explanation has already been added, "
                           "currently limited to one explainer type."),
                          UserWarning)
            return
        is_sparse = issparse(self._evaluation_examples)
        num_cols = self._evaluation_examples.shape[1]
        many_cols = num_cols > SPARSE_NUM_FEATURES_THRESHOLD
        self._surrogate_model = LGBMExplainableModel
        if is_sparse and many_cols:
            self._surrogate_model = LinearExplainableModel
        self._is_added = True

    def compute(self):
        """Creates an explanation by running the explainer on the model."""
        if self._is_run:
            return
        model_task = ModelTask.Unknown
        explainer = MimicExplainer(self._model,
                                   self._initialization_examples,
                                   self._surrogate_model,
                                   features=self._features,
                                   model_task=model_task,
                                   classes=self._classes)
        self._explanation = explainer.explain_global(self._evaluation_examples)

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
            props[Keys.ID] = self._explanation.id
            props[Keys.METHOD] = self._explanation.method
            props[Keys.MODEL_TASK] = self._explanation.model_task
            props[Keys.MODEL_TYPE] = self._explanation.model_type
            if FeatureImportanceExplanation._does_quack(self._explanation):
                props[Keys.IS_RAW] = self._explanation.is_raw
                props[Keys.IS_ENGINEERED] = self._explanation.is_engineered
            props[Keys.IS_COMPUTED] = True
        else:
            props[Keys.IS_COMPUTED] = False
        return props

    @property
    def name(self):
        """Get the name of the explainer manager.

        :return: The name of the explainer manager.
        :rtype: str
        """
        return ManagerNames.EXPLAINER

    def save(self, path):
        """Save the ExplainerManager to the given path.

        :param path: The directory path to save the ExplainerManager to.
        :type path: str
        """
        top_dir = Path(path)
        # save the explanation
        if self._explanation:
            save_explanation(self._explanation,
                             top_dir / ManagerNames.EXPLAINER)
        meta = {IS_RUN: self._is_run,
                IS_ADDED: self._is_added}
        with open(Path(path) / META_JSON, 'w') as file:
            json.dump(meta, file)

    @staticmethod
    def load(path, rai_analyzer):
        """Load the ExplainerManager from the given path.

        :param path: The directory path to load the ExplainerManager from.
        :type path: str
        :param rai_analyzer: The loaded parent RAIAnalyzer.
        :type rai_analyzer: RAIAnalyzer
        """
        # create the ExplainerManager without any properties using the __new__
        # function, similar to pickle
        inst = ExplainerManager.__new__(ExplainerManager)
        top_dir = Path(path)
        explanation_path = top_dir / ManagerNames.EXPLAINER
        if explanation_path.exists():
            explanation = load_explanation(explanation_path)
            inst.__dict__['_' + ManagerNames.EXPLAINER] = explanation
        inst.__dict__['_' + MODEL] = rai_analyzer.model

        with open(top_dir / META_JSON, 'r') as meta_file:
            meta = meta_file.read()
        meta = json.loads(meta)
        inst.__dict__['_' + IS_RUN] = meta[IS_RUN]
        inst.__dict__['_' + CLASSES] = rai_analyzer._classes
        target_column = rai_analyzer.target_column
        train = rai_analyzer.train.drop(columns=[target_column])
        test = rai_analyzer.test.drop(columns=[target_column])
        inst.__dict__[U_INITIALIZATION_EXAMPLES] = train
        inst.__dict__[U_EVALUATION_EXAMPLES] = test
        inst.__dict__['_' + FEATURES] = list(train.columns)
        inst.__dict__['_' + IS_ADDED] = False
        # reset self._surrogate_model
        if meta[IS_ADDED]:
            inst.add()
        return inst
