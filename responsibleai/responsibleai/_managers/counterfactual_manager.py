# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Counterfactual Manager class."""
import dice_ml
import json
import numpy as np

from dice_ml import Dice

from responsibleai._interfaces import CounterfactualData
from responsibleai._internal.constants import ManagerNames
from responsibleai._managers.base_manager import BaseManager
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.modelanalysis.constants import ModelTask


class CounterfactualConstants:
    OPPOSITE = 'opposite'
    CLASSIFIER = 'classifier'
    REGRESSOR = 'regressor'
    SKLEARN = 'sklearn'
    RANDOM = 'random'


class CounterfactualResult:
    def __init__(
        self,
        explainer=False,
        counterfactual_output=False,
    ):
        self.explainer = explainer
        self.counterfactual_output = counterfactual_output

    def to_dict(self):
        return self.counterfactual_output

    def serialize(self):
        data = CounterfactualData()
        json_data = json.loads(self.counterfactual_output.to_json())

        data.cfs_list = json_data['cfs_list']
        data.feature_names = json_data['feature_names']
        data.feature_names_including_target = json_data[
            'feature_names_including_target']
        data.summary_importance = json_data['summary_importance']
        data.local_importance = json_data['local_importance']
        data.model_type = json_data['model_type']
        data.desired_class = json_data['desired_class']
        data.desired_range = json_data['desired_range']
        return data


class CounterfactualManager(BaseManager):
    def __init__(self, model, train, test, target_column, task_type,
                 categorical_features):
        """Defines the CounterfactualManager for generating counterfactuals
           from a model.

        :param model: The model to generate counterfactuals from.
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
        :param task_type: Task type is either 'classification/regression'
        :type task_type: str
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        """
        self._model = model
        self._train = train
        self._test = test
        self._target_column = target_column
        self._task_type = task_type
        self._categorical_features = categorical_features

        self._results = []

    def _create_diceml_explainer(self, method, continuous_features):

        dice_data = dice_ml.Data(dataframe=self._train,
                                 continuous_features=continuous_features,
                                 outcome_name=self._target_column)
        model_type = CounterfactualConstants.CLASSIFIER \
            if self._task_type == ModelTask.CLASSIFICATION else \
            CounterfactualConstants.REGRESSOR

        backend = CounterfactualConstants.SKLEARN
        dice_model = dice_ml.Model(
            model=self._model, backend=backend, model_type=model_type)

        return Dice(dice_data, dice_model, method=method)

    def compute(
        self,
        total_CFs,
        method=CounterfactualConstants.RANDOM,
        desired_class=None,
        desired_range=None,
        permitted_range=None,
        features_to_vary=None,
        feature_importance=True,
    ):
        """Compute diverse counterfactual insights.

        :param total_CFs: Total number of counterfactuals required.
        :type total_CFs: int
        :param desired_class: Desired counterfactual class. For binary
            classification, this needs to be set as "opposite".
        :type desired_class: string or int
        :param desired_range: For regression problems.
            Contains the outcome range to generate counterfactuals in.
        :type desired_range: list
        :param permitted_range: Dictionary with feature names as keys and
            permitted range in list as values. Defaults to the range
            inferred from training data.
        :type permitted_range: dict
        :param features_to_vary: Either a string "all" or a list of feature
            names to vary.
        :type features_to_vary: list
        :param feature_importance: Flag to compute feature importance
            using dice-ml.
        :type feature_importance: bool
        """
        if self._task_type == ModelTask.CLASSIFICATION:
            if desired_class is None:
                raise UserConfigValidationException(
                    'The desired_class attribute should be either \'{0}\''
                    ' or the class value for classification scenarios.'.format(
                        CounterfactualConstants.OPPOSITE))

            is_multiclass = len(np.unique(
                self._train[self._target_column].values).tolist()) > 2
            class_is_opposite = desired_class == \
                CounterfactualConstants.OPPOSITE
            if is_multiclass and class_is_opposite:
                raise UserConfigValidationException(
                    'The desired_class attribute should not be \'{0}\''
                    ' It should be the class value for multiclass'
                    ' classification scenario.'.format(
                        CounterfactualConstants.OPPOSITE))
        elif self._task_type == ModelTask.REGRESSION:
            if desired_range is None:
                raise UserConfigValidationException(
                    "The desired_range should not be None"
                    " for regression scenarios.")

        if self._categorical_features is None:
            continuous_features = \
                list(set(self._train.columns) - set([self._target_column]))
        else:
            continuous_features = list(set(self._train.columns) -
                                       set([self._target_column]) -
                                       set(self._categorical_features))
        result = CounterfactualResult()

        result.explainer = self._create_diceml_explainer(
            method=method, continuous_features=continuous_features)

        X_test = self._test.drop([self._target_column], axis=1)

        if not feature_importance:
            result.counterfactual_output = \
                result.explainer.generate_counterfactuals(
                    X_test, total_CFs=total_CFs,
                    desired_class=desired_class,
                    desired_range=desired_range)
        else:
            result.counterfactual_output = \
                result.explainer.global_feature_importance(
                    X_test, total_CFs=total_CFs,
                    desired_class=desired_class,
                    desired_range=desired_range)

        self._results.append(result)

    def get(self):
        """Return the computed counterfactual insights."""
        return [result.to_dict() for result in self._results]

    def list(self):
        pass

    def get_data(self):
        """Get counterfactual data

        :return: List of CounterfactualData objects.
        :rtype: List[CounterfactualData]
        """
        return [result.serialize() for result in self._results]

    @property
    def name(self):
        """Get the name of the counterfactual manager.

        :return: The name of the counterfactual manager.
        :rtype: str
        """
        return ManagerNames.COUNTERFACTUAL

    def _save(self, path):
        pass

    @staticmethod
    def _load(path, model_analysis):
        pass
