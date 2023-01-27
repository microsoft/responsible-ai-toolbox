# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Explainer Manager class."""

import json
import warnings
from pathlib import Path
from typing import Any, List, Optional

import numpy as np
import pandas as pd
from interpret_community.common.constants import ModelTask
from interpret_community.explanation.explanation import (
    FeatureImportanceExplanation, load_explanation, save_explanation)
from interpret_community.mimic.mimic_explainer import MimicExplainer
from interpret_community.mimic.models.lightgbm_model import \
    LGBMExplainableModel
from interpret_community.mimic.models.linear_model import \
    LinearExplainableModel
from scipy.sparse import issparse

from raiutils.data_processing import convert_to_list
from responsibleai._interfaces import (EBMGlobalExplanation, FeatureImportance,
                                       ModelExplanationData,
                                       PrecomputedExplanations)
from responsibleai._internal.constants import ExplainerManagerKeys as Keys
from responsibleai._internal.constants import (ExplanationKeys, ListProperties,
                                               ManagerNames, Metadata)
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.managers.base_manager import BaseManager

SPARSE_NUM_FEATURES_THRESHOLD = 1000
IS_RUN = 'is_run'
IS_ADDED = 'is_added'
CLASSES = 'classes'
U_INITIALIZATION_EXAMPLES = '_initialization_examples'
U_EVALUATION_EXAMPLES = '_evaluation_examples'
FEATURES = 'features'
CATEGORICAL_FEATURES = 'categorical_features'
EXPLANATION = '_explanation'
MAXIMUM_ROWS_FOR_GLOBAL_EXPLANATIONS = 10000


class ExplainerManager(BaseManager):

    """Defines the ExplainerManager for explaining a model."""

    def __init__(self, model: Any, initialization_examples: pd.DataFrame,
                 evaluation_examples: pd.DataFrame,
                 target_column: str,
                 classes: Optional[List] = None,
                 categorical_features: Optional[List[str]] = None):
        """Creates an ExplainerManager object.

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
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
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
        self._categorical_features = categorical_features

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

        self._initialize_surrogate_model()
        self._is_added = True

    def _initialize_surrogate_model(self):
        """Initialize the surrogate model."""
        is_sparse = issparse(self._evaluation_examples)
        num_cols = self._evaluation_examples.shape[1]
        many_cols = num_cols > SPARSE_NUM_FEATURES_THRESHOLD
        self._surrogate_model = LGBMExplainableModel
        if is_sparse and many_cols:
            self._surrogate_model = LinearExplainableModel

    def _compute_explanations(self, local: bool, data: Any):
        """Compute explanations using MimicWrapper.

        :param local: True if local explanations are requested
                and False otherwise.
        :type local: bool
        :param data: The data point(s) for which the explanations
                     need to be generated.
        :type data: Any
        :return: The computed explanations.
        :rtype: Any
        """
        if self._classes is not None:
            model_task = ModelTask.Classification
        else:
            model_task = ModelTask.Regression

        explainer = MimicExplainer(
            self._model,
            self._initialization_examples,
            self._surrogate_model,
            features=self._features,
            model_task=model_task,
            classes=self._classes,
            categorical_features=self._categorical_features)

        if len(data) <= MAXIMUM_ROWS_FOR_GLOBAL_EXPLANATIONS:
            return explainer.explain_global(data, include_local=local)
        else:
            warnings.warn((
                "LARGE-DATA-SCENARIO-DETECTED: "
                "The data is larger than the supported limit of {0}. "
                "Computing explanations for first {0} samples only.").format(
                    MAXIMUM_ROWS_FOR_GLOBAL_EXPLANATIONS),
                UserWarning)
            return explainer.explain_global(data[
                0:MAXIMUM_ROWS_FOR_GLOBAL_EXPLANATIONS], include_local=local)

    def compute(self):
        """Creates an explanation by running the explainer on the model."""
        if not self._is_added:
            return
        if self._is_run:
            return
        self._explanation = self._compute_explanations(
            local=True,
            data=self._evaluation_examples
        )
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

    def get_data(self):
        """Get explanation data

        :return: A array of ModelExplanationData.
        :rtype: List[ModelExplanationData]
        """
        return [
            self._get_interpret(
                i, self._evaluation_examples) for i in self.get()]

    def request_explanations(self, local: bool, data: Any):
        """Return the explanations for a given point(s) .

        :param local: True if local explanations are requested
                      and False otherwise.
        :type local: bool
        :param data: The data point(s) for which the explanations
                     need to be generated.
        :type data: Any
        :return: The explanations for the given data point(s)
                 according to the interface specified by
                 ModelExplanationData.
        :rtype: ModelExplanationData
        """
        if not isinstance(data, pd.DataFrame):
            raise UserConfigValidationException(
                'Data is of type {0} but it must be '
                'a pandas DataFrame.'.format(type(data)))

        if local and data.shape[0] > 1:
            raise UserConfigValidationException(
                'Only one row of data is allowed for '
                'local explanation generation.')

        explanations = self._compute_explanations(
            local=local,
            data=data)
        return self._get_interpret(explanations, data)

    def _get_interpret(self, explanation, evaluation_examples=None):
        interpretation = ModelExplanationData()

        # List of explanations, key of explanation type is "explanation_type"
        if explanation is not None:
            mli_explanations = explanation.data(-1)["mli"]
        else:
            mli_explanations = None
        local_explanation = self._find_first_explanation(
            ExplanationKeys.LOCAL_EXPLANATION_KEY,
            mli_explanations)
        global_explanation = self._find_first_explanation(
            ExplanationKeys.GLOBAL_EXPLANATION_KEY,
            mli_explanations)
        ebm_explanation = self._find_first_explanation(
            ExplanationKeys.EBM_GLOBAL_EXPLANATION_KEY,
            mli_explanations)

        if explanation is not None and hasattr(explanation, 'method'):
            interpretation.method = explanation.method

        local_dim = None

        if local_explanation is not None or global_explanation is not None\
                or ebm_explanation is not None:
            interpretation.precomputedExplanations = PrecomputedExplanations()

        if local_explanation is not None:
            try:
                local_feature_importance = FeatureImportance()
                local_feature_importance.scores = convert_to_list(
                    local_explanation["scores"])
                if np.shape(local_feature_importance.scores)[-1] > 1000:
                    raise ValueError("Exceeds maximum number of features for "
                                     "visualization (1000). Please regenerate"
                                     " the explanation using fewer features.")
                local_feature_importance.intercept = convert_to_list(
                    local_explanation["intercept"])
                # We can ignore perf explanation data.
                # Note if it is added back at any point,
                # the numpy values will need to be converted to python,
                # otherwise serialization fails.
                local_explanation["perf"] = None
                interpretation.precomputedExplanations.localFeatureImportance\
                    = local_feature_importance
            except Exception as ex:
                raise ValueError(
                    "Unsupported local explanation type") from ex

            if evaluation_examples is not None:
                _feature_length = evaluation_examples.shape[1]
                _row_length = evaluation_examples.shape[0]
                local_dim = np.shape(local_feature_importance.scores)
                if len(local_dim) != 2 and len(local_dim) != 3:
                    raise ValueError(
                        "Local explanation expected to be a 2D or 3D list")
                if (len(local_dim) == 2 and
                    (local_dim[1] != _feature_length or
                     local_dim[0] != _row_length)):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        "length differs from dataset")
                if (len(local_dim) == 3 and
                   (local_dim[2] != _feature_length or
                        local_dim[1] != _row_length)):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        " length differs from dataset")
        if global_explanation is not None:
            try:
                global_feature_importance = FeatureImportance()
                global_feature_importance.scores = convert_to_list(
                    global_explanation["scores"])
                if 'intercept' in global_explanation:
                    global_feature_importance.intercept\
                        = convert_to_list(
                            global_explanation["intercept"])
                interpretation.precomputedExplanations.globalFeatureImportance\
                    = global_explanation
            except Exception as ex:
                raise ValueError("Unsupported global explanation type") from ex
        if ebm_explanation is not None:
            try:
                ebm_feature_importance = EBMGlobalExplanation()
                ebm_feature_importance.feature_list\
                    = ebm_explanation["feature_list"]
                interpretation.precomputedExplanations.ebmGlobalExplanation\
                    = ebm_feature_importance

            except Exception as ex:
                raise ValueError(
                    "Unsupported ebm explanation type") from ex
        return interpretation

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
                save_explanation(self._explanation,
                                 data_directory / ManagerNames.EXPLAINER)

            meta = {IS_RUN: self._is_run,
                    IS_ADDED: self._is_added}
            with open(data_directory / Metadata.META_JSON, 'w') as file:
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

            with open(data_directory / Metadata.META_JSON, 'r') as meta_file:
                meta = meta_file.read()
            meta = json.loads(meta)
            inst.__dict__['_' + IS_RUN] = meta[IS_RUN]
            inst.__dict__['_' + IS_ADDED] = meta[IS_ADDED]

            inst.__dict__[EXPLANATION] = None
            explanation_path = data_directory / ManagerNames.EXPLAINER
            if explanation_path.exists():
                explanation = load_explanation(explanation_path)
                inst.__dict__[EXPLANATION] = explanation
        else:
            inst.__dict__['_' + IS_RUN] = False
            inst.__dict__['_' + IS_ADDED] = False
            inst.__dict__[EXPLANATION] = None

        inst.__dict__['_' + Metadata.MODEL] = rai_insights.model
        inst.__dict__['_' + CLASSES] = rai_insights._classes
        inst.__dict__['_' + CATEGORICAL_FEATURES] = \
            rai_insights.categorical_features
        target_column = rai_insights.target_column
        train = rai_insights.get_train_data().drop(columns=[target_column])
        test = rai_insights.get_test_data().drop(columns=[target_column])
        inst.__dict__[U_INITIALIZATION_EXAMPLES] = train
        inst.__dict__[U_EVALUATION_EXAMPLES] = test
        inst.__dict__['_' + FEATURES] = list(train.columns)

        # reset the surrogate model
        inst._initialize_surrogate_model()

        return inst

    def _find_first_explanation(self, key, mli_explanations):
        if mli_explanations is None:
            return None
        new_array = [explanation for explanation
                     in mli_explanations
                     if explanation[
                         ExplanationKeys.EXPLANATION_TYPE_KEY
                     ] == key]
        if len(new_array) > 0:
            return new_array[0]["value"]
        return None
