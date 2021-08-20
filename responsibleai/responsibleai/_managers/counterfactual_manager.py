# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Counterfactual Manager class."""
import json
import dice_ml
from dice_ml import Dice
import numpy as np

from responsibleai._data_validations import validate_train_test_categories
from responsibleai._internal.constants import ManagerNames
from responsibleai._managers.base_manager import BaseManager
from responsibleai._config.base_config import BaseConfig
from responsibleai.modelanalysis.constants import ModelTask
from responsibleai.exceptions import (
    UserConfigValidationException, DuplicateManagerConfigException
)
from responsibleai._interfaces import CounterfactualData


class CounterfactualConstants:
    OPPOSITE = 'opposite'
    CLASSIFIER = 'classifier'
    REGRESSOR = 'regressor'
    SKLEARN = 'sklearn'
    RANDOM = 'random'


class CounterfactualConfig(BaseConfig):
    def __init__(self, method, continuous_features, total_CFs,
                 desired_class=CounterfactualConstants.OPPOSITE,
                 desired_range=None, permitted_range=None,
                 features_to_vary=None, feature_importance=False):
        super(CounterfactualConfig, self).__init__()
        self.method = method
        self.continuous_features = continuous_features
        self.total_CFs = total_CFs
        self.desired_range = desired_range
        self.desired_class = desired_class
        self.permitted_range = permitted_range
        self.features_to_vary = features_to_vary
        self.feature_importance = feature_importance
        self.counterfactual_obj = None
        self.has_computation_failed = False
        self.failure_reason = None

    def __eq__(self, other_cf_config):
        return (
            self.method == other_cf_config.method and
            self.continuous_features == other_cf_config.continuous_features and
            self.total_CFs == other_cf_config.total_CFs and
            self.desired_range == other_cf_config.desired_range and
            self.desired_class == other_cf_config.desired_class and
            self.permitted_range == other_cf_config.permitted_range and
            self.features_to_vary == other_cf_config.features_to_vary and
            self.feature_importance == other_cf_config.feature_importance
        )


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
        self._counterfactual_config_list = []

    def _create_diceml_explainer(self, method, continuous_features):

        dice_data = dice_ml.Data(dataframe=self._train,
                                 continuous_features=continuous_features,
                                 outcome_name=self._target_column)
        model_type = CounterfactualConstants.CLASSIFIER \
            if self._task_type == ModelTask.CLASSIFICATION else \
            CounterfactualConstants.REGRESSOR
        dice_model = dice_ml.Model(model=self._model,
                                   backend=CounterfactualConstants.SKLEARN,
                                   model_type=model_type)

        dice_explainer = Dice(dice_data, dice_model, method=method)

        return dice_explainer

    def _add_counterfactual_config(self, new_counterfactual_config):
        if self._model is None:
            raise UserConfigValidationException(
                'Model is required for counterfactual example generation and '
                'feature importances')

        validate_train_test_categories(
            train_data=self._train,
            test_data=self._test,
            rai_compute_type='Counterfactual example generation',
            categoricals=self._categorical_features)

        to_vary = new_counterfactual_config.features_to_vary
        if to_vary != 'all':
            difference_set = set(to_vary) - set(self._train.columns)
            if len(difference_set) > 0:
                message = ("Feature names in features_to_vary do "
                           f"not exist in train data: {list(difference_set)}")
                raise UserConfigValidationException(message)

        if new_counterfactual_config.permitted_range is not None:
            permitted_features = \
                list(new_counterfactual_config.permitted_range)
            difference_set = set(permitted_features) - set(self._train.columns)
            if len(difference_set) > 0:
                message = ("Feature names in permitted_range do "
                           f"not exist in train data: {list(difference_set)}")
                raise UserConfigValidationException(message)

        if self._task_type == ModelTask.CLASSIFICATION:
            if new_counterfactual_config.desired_class is None:
                raise UserConfigValidationException(
                    'The desired_class attribute should be either \'{0}\''
                    ' for binary classification or the class value for '
                    'multi-classification scenarios.'.format(
                        CounterfactualConstants.OPPOSITE))

            is_multiclass = len(np.unique(
                self._train[self._target_column].values).tolist()) > 2
            if is_multiclass and \
                    new_counterfactual_config.desired_class == \
                    CounterfactualConstants.OPPOSITE:
                raise UserConfigValidationException(
                    'The desired_class attribute should not be \'{0}\''
                    ' It should be the class value for multiclass'
                    ' classification scenario.'.format(
                        CounterfactualConstants.OPPOSITE))

        if self._task_type == ModelTask.REGRESSION:
            if new_counterfactual_config.desired_range is None:
                raise UserConfigValidationException(
                    'The desired_range should not be None'
                    ' for regression scenarios.')

        is_duplicate = new_counterfactual_config.is_duplicate(
            self._counterfactual_config_list)

        if is_duplicate:
            raise DuplicateManagerConfigException(
                'Duplicate counterfactual configuration detected.')
        else:
            self._counterfactual_config_list.append(new_counterfactual_config)

    def add(self,
            total_CFs,
            method=CounterfactualConstants.RANDOM,
            desired_class=None,
            desired_range=None,
            permitted_range=None,
            features_to_vary='all',
            feature_importance=True):
        """Add a counterfactual generation configuration to be computed later.

        :param method: Type of dice-ml explainer. Either of "random", "genetic"
                       or "kdtree".
        :type method: str
        :param total_CFs: Total number of counterfactuals required.
        :type total_CFs: int
        :param desired_class: Desired counterfactual class. For binary
                              classification, this needs to be set as
                              "opposite".
        :type desired_class: string or int
        :param desired_range: For regression problems.
                              Contains the outcome range
                              to generate counterfactuals in.
        :type desired_range: list
        :param permitted_range: Dictionary with feature names as keys and
                                permitted range in list as values.
                                Defaults to the range inferred from training
                                data.
        :type permitted_range: dict
        :param features_to_vary: Either a string "all" or a list of
                                 feature names to vary.
        :type features_to_vary: list
        :param feature_importance: Flag to compute feature importance using
                                   dice-ml.
        :type feature_importance: bool
        """
        if self._categorical_features is None:
            continuous_features = \
                list(set(self._train.columns) - set([self._target_column]))
        else:
            continuous_features = list(set(self._train.columns) -
                                       set([self._target_column]) -
                                       set(self._categorical_features))

        counterfactual_config = CounterfactualConfig(
            method=method,
            continuous_features=continuous_features,
            total_CFs=total_CFs,
            desired_class=desired_class,
            desired_range=desired_range,
            permitted_range=permitted_range,
            features_to_vary=features_to_vary,
            feature_importance=feature_importance)

        self._add_counterfactual_config(counterfactual_config)

    def compute(self):
        """Computes the counterfactual examples by running the counterfactual
           configuration."""
        for cf_config in self._counterfactual_config_list:
            if not cf_config.is_computed:
                cf_config.is_computed = True
                try:
                    dice_explainer = self._create_diceml_explainer(
                        method=cf_config.method,
                        continuous_features=cf_config.continuous_features)

                    X_test = self._test.drop([self._target_column], axis=1)

                    if not cf_config.feature_importance:
                        counterfactual_obj = \
                            dice_explainer.generate_counterfactuals(
                                X_test, total_CFs=cf_config.total_CFs,
                                desired_class=cf_config.desired_class,
                                desired_range=cf_config.desired_range,
                                features_to_vary=cf_config.features_to_vary,
                                permitted_range=cf_config.permitted_range)
                    else:
                        counterfactual_obj = \
                            dice_explainer.global_feature_importance(
                                X_test,
                                total_CFs=cf_config.total_CFs,
                                desired_class=cf_config.desired_class,
                                desired_range=cf_config.desired_range,
                                features_to_vary=cf_config.features_to_vary,
                                permitted_range=cf_config.permitted_range)

                    cf_config.counterfactual_obj = \
                        counterfactual_obj
                except Exception as e:
                    cf_config.has_computation_failed = True
                    cf_config.failure_reason = str(e)
                    raise e

    def get(self, failed_to_compute=False):
        """Return the computed counterfactual examples objects or failure reason.

        :param failed_to_compute: Get the failure reasons if counterfactual
                                  examples failed to compute.
        :type failed_to_compute: bool
        """
        if not failed_to_compute:
            counterfactual_obj_list = []
            for counterfactual_config in self._counterfactual_config_list:
                if counterfactual_config.is_computed and \
                        not counterfactual_config.has_computation_failed:
                    counterfactual_obj_list.append(
                        counterfactual_config.counterfactual_obj)
            return counterfactual_obj_list
        else:
            failure_reason_list = []
            for counterfactual_config in self._counterfactual_config_list:
                if counterfactual_config.is_computed and \
                        counterfactual_config.has_computation_failed:
                    failure_reason_list.append(
                        counterfactual_config.failure_reason)
            return failure_reason_list

    def list(self):
        pass

    def get_data(self):
        """Get counterfactual data

        :return: A array of CounterfactualData.
        :rtype: List[CounterfactualData]
        """
        return [
            self._get_counterfactual(i) for i in self.get()]

    def _get_counterfactual(self, counterfactual):
        cfdata = CounterfactualData()
        json_data = json.loads(counterfactual.to_json())
        cfdata.cfs_list = json_data["cfs_list"]
        cfdata.feature_names = json_data["feature_names"]
        cfdata.feature_names_including_target = json_data[
            "feature_names_including_target"]
        cfdata.summary_importance = json_data["summary_importance"]
        cfdata.local_importance = json_data["local_importance"]
        cfdata.model_type = json_data["model_type"]
        cfdata.desired_class = json_data["desired_class"]
        cfdata.desired_range = json_data["desired_range"]
        return cfdata

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
