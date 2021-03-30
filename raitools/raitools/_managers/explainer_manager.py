# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Explainer Manager class."""

import warnings
from scipy.sparse import issparse
from interpret_community.mimic.mimic_explainer import MimicExplainer
from interpret_community.mimic.models.lightgbm_model import (
    LGBMExplainableModel)
from interpret_community.mimic.models.linear_model import (
    LinearExplainableModel)
from interpret_community.common.constants import ModelTask
from raitools._managers.base_manager import BaseManager

SPARSE_NUM_FEATURES_THRESHOLD = 1000


class ExplainerManager(BaseManager):

    """Defines the ExplainerManager for explaining a model.

    :param model: The model to explain.
        A model that implements sklearn.predict or sklearn.predict_proba
        or function that accepts a 2d ndarray.
    :type model: object
    :param initialization_examples: A matrix of feature vector
        examples (# examples x # features) for initializing the explainer.
    :type initialization_examples: pandas.DataFrame
    :param evaluation_examples: A matrix of feature vector
        examples (# examples x # features) on which to explain the
        model's output.
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
            examples (# examples x # features) for initializing the explainer.
        :type initialization_examples: pandas.DataFrame
        :param evaluation_examples: A matrix of feature vector
            examples (# examples x # features) on which to explain the
            model's output.
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
        pass

    @property
    def name(self):
        """Get the name of the explainer manager.

        :return: The name of the explainer manager.
        :rtype: str
        """
        return "explain"

    def save(self, path):
        raise NotImplementedError(
            "Save not implemented for ExplainerManager")

    @staticmethod
    def load(path):
        raise NotImplementedError(
            "Load not implemented for ExplainerManager")
