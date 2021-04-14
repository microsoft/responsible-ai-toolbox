# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Counterfactual Manager class."""
import dice_ml
from dice_ml import Dice

from raitools._managers.base_manager import BaseManager
from raitools.raianalyzer.constants import ModelTask


class DuplicateCounterfactualConfig(Exception):
    """An exception indicating that a duplicate counterfactual configuration was detected.

    :param exception_message: A message describing the error.
    :type exception_message: str
    """
    _error_code = "Duplicate counterfactual configuration detected."


class _CounterfactualConfig:
    def __init__(self, method, continuous_features, total_CFs, desired_class="opposite",
                 desired_range=None, permitted_range=None, features_to_vary=None):
        self.method = method
        self.continuous_features = continuous_features
        self.total_CFs = total_CFs
        self.desired_range = desired_range
        self.desired_class = desired_class
        self.permitted_range = permitted_range
        self.features_to_vary = features_to_vary
        self.is_computed = False
        self.counterfactual_obj = None
        self.has_computation_failed = False
        self.failure_reason = None

    def __eq__(self, other_counterfactual_config):
        return self.method == other_counterfactual_config.method and \
            self.continuous_features == other_counterfactual_config.continuous_features and \
            self.total_CFs == other_counterfactual_config.total_CFs and \
            self.desired_range == other_counterfactual_config.desired_range and \
            self.desired_class == other_counterfactual_config.desired_class and \
            self.permitted_range == other_counterfactual_config.permitted_range and \
            self.features_to_vary == other_counterfactual_config.features_to_vary


class CounterfactualManager(BaseManager):
    def __init__(self, model, train, test, target_column, task_type):
        self._model = model
        self._train = train
        self._test = test
        self._target_column = target_column
        self._task_type = task_type
        self._counterfactual_config_list = []

    def _create_diceml_explainer(self, method, continuous_features):

        dice_data = dice_ml.Data(dataframe=self._train,
                                 continuous_features=continuous_features,
                                 outcome_name=self._target_column)

        model_type = "classifier" if self._task_type == ModelTask.CLASSIFICATION else 'regressor'
        dice_model = dice_ml.Model(model=self._model,
                                   backend='sklearn',
                                   model_type=model_type)

        dice_explainer = Dice(dice_data, dice_model, method=method)

        return dice_explainer

    def _add_counterfactual_config(self, new_counterfactual_config):

        duplicate_counterfactual_config_found = False
        for counterfactual_config in self._counterfactual_config_list:
            if counterfactual_config == new_counterfactual_config:
                duplicate_counterfactual_config_found = True
                break

        if duplicate_counterfactual_config_found:
            raise DuplicateCounterfactualConfig(
                "Duplicate counterfactual configuration detected")
        else:
            self._counterfactual_config_list.append(new_counterfactual_config)

    def add(self,
            continuous_features,
            total_CFs,
            method='random',
            desired_class="opposite",
            desired_range=None,
            permitted_range=None,
            features_to_vary=None):

        counterfactual_config = _CounterfactualConfig(
            method=method,
            continuous_features=continuous_features,
            total_CFs=total_CFs,
            desired_class=desired_class,
            desired_range=desired_range,
            permitted_range=permitted_range,
            features_to_vary=features_to_vary)

        self._add_counterfactual_config(counterfactual_config)

    def compute(self):
        for counterfactual_config in self._counterfactual_config_list:
            if not counterfactual_config.is_computed:
                counterfactual_config.is_computed = True
                try:
                    dice_explainer = self._create_diceml_explainer(
                        method=counterfactual_config.method,
                        continuous_features=counterfactual_config.continuous_features)

                    X_test = self._test.drop([self._target_column], axis=1)

                    counterfactual_obj = dice_explainer.generate_counterfactuals(
                        X_test, total_CFs=counterfactual_config.total_CFs,
                        desired_class=counterfactual_config.desired_class,
                        desired_range=counterfactual_config.desired_range)

                    counterfactual_config.counterfactual_obj = counterfactual_obj
                except Exception as e:
                    # import pdb
                    # pdb.set_trace()
                    counterfactual_config.has_computation_failed = True
                    counterfactual_config.failure_reason = str(e)

    def get(self, failed_to_compute=False):
        if not failed_to_compute:
            counterfactual_obj_list = []
            for counterfactual_config in self._counterfactual_config_list:
                if counterfactual_config.is_computed:
                    if not counterfactual_config.has_computation_failed:
                        counterfactual_obj_list.append(
                            counterfactual_config.counterfactual_obj)
            return counterfactual_obj_list
        else:
            feature_reason_list = []
            for counterfactual_config in self._counterfactual_config_list:
                if counterfactual_config.is_computed:
                    if counterfactual_config.has_computation_failed:
                        feature_reason_list.append(
                            counterfactual_config.failure_reason)
            return feature_reason_list

    def list(self):
        pass

    @property
    def name(self):
        """Get the name of the counterfactual manager.

        :return: The name of the counterfactual manager.
        :rtype: str
        """
        return "counterfactual"

    def save(self, path):
        raise NotImplementedError(
            "Save not implemented for CounterfactualManager")

    @staticmethod
    def load(path):
        raise NotImplementedError(
            "Load not implemented for CounterfactualManager")
