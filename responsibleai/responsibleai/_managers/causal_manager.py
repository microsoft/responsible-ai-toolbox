# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Causal Manager class."""
import numpy as np
import pandas as pd

from econml.solutions.causal_analysis import CausalAnalysis

from responsibleai._config.base_config import BaseConfig
from responsibleai._internal.constants import ManagerNames
from responsibleai._managers.base_manager import BaseManager
from responsibleai.exceptions import (
    UserConfigValidationException, DuplicateManagerConfigException)
from responsibleai.modelanalysis.constants import ModelTask


class CausalConstants:
    # Model types
    AUTOML = 'automl'
    LINEAR = 'linear'


class CausalConfig(BaseConfig):
    def __init__(
        self,
        treatment_features=None,
        nuisance_model=None,
        heterogeneity_model=None,
        alpha=0.05,
    ):
        super().__init__()
        self.treatment_features = treatment_features
        self.nuisance_model = nuisance_model
        self.heterogeneity_model = heterogeneity_model
        self.alpha = alpha

        # Outputs
        self.causal_analysis = None
        self.global_effects = None
        self.local_effects = None
        self.policy_tree = None
        self.policy_gains = None

    def __eq__(self, other):
        return (
            np.array_equal(self.treatment_features,
                           other.treatment_features) and
            self.nuisance_model == other.nuisance_model and
            self.heterogeneity_model == other.heterogeneity_model
        )

    def __repr__(self):
        return ("CausalConfig("
                f"treatment_features={self.treatment_features}, "
                f"nuisance_model={self.nuisance_model})")

    def to_result(self):
        return {
            'causal_analysis': self.causal_analysis,
            'global_effects': self.global_effects,
            'local_effects': self.local_effects,
            'policy_tree': self.policy_tree,
            'policy_gains': self.policy_gains,
        }


class CausalManager(BaseManager):
    def __init__(self, train, test, target_column, task_type,
                 categorical_features):
        """Construct a CausalManager for generating causal analyses
           from a dataset.

        :param train: Dataset on which to compute global causal effects
                     (#samples x #features).
        :type train: pandas.DataFrame
        :param test: Dataset on which to compute local causal effects
                     (#samples x #features).
        :type test: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: Task type is either 'classification/regression'
        :type task_type: str
        :param categorical_features: All categorical feature names.
        :type categorical_features: list
        """
        self._train = train
        self._test = test
        self._target_column = target_column
        self._task_type = task_type
        self._categorical_features = categorical_features
        self._causal_config_list = []

    def add(
        self,
        treatment_features=None,
        nuisance_model=CausalConstants.AUTOML,
        heterogeneity_model=None,
        alpha=0.05,
    ):
        """Add a causal configuration to be computed later.
        :param treatment_features: All treatment feature names.
        :type treatment_features: list
        :param nuisance_model: Model type to use for nuisance estimation.
        :type nuisance_model: str
        :param heterogeneity_model: Model type to use for
                                    treatment effect heterogeneity.
        :type heterogeneity_model: str
        :param alpha: Confidence level of confidence intervals.
        :type alpha: float
        """
        causal_config = CausalConfig(treatment_features=treatment_features,
                                     nuisance_model=nuisance_model,
                                     heterogeneity_model=heterogeneity_model,
                                     alpha=alpha)

        if causal_config.is_duplicate(self._causal_config_list):
            raise DuplicateManagerConfigException(
                "Duplicate causal configuration detected.")

        self._causal_config_list.append(causal_config)

    def compute(self):
        """Computes the causal effects by running the causal configuration."""
        for config in self._causal_config_list:
            if config.is_computed:
                continue

            config.is_computed = True
            if config.nuisance_model not in [CausalConstants.AUTOML,
                                             CausalConstants.LINEAR]:
                message = (f"nuisance_model should be one of "
                           f"['{CausalConstants.AUTOML}', "
                           f"'{CausalConstants.LINEAR}'], "
                           f"got {config.nuisance_model}")
                raise UserConfigValidationException(message)

            is_classification = self._task_type == ModelTask.CLASSIFICATION
            X = pd.concat([self._train, self._test], ignore_index=True)\
                .drop([self._target_column], axis=1)
            y = pd.concat([self._train, self._test], ignore_index=True)[
                self._target_column].values.ravel()

            causal_analysis = CausalAnalysis(
                X.columns.values.tolist(),
                self._categorical_features,
                heterogeneity_inds=config.treatment_features,
                classification=is_classification,
                nuisance_models=config.nuisance_model,
                n_jobs=-1)
            causal_analysis.fit(X, y)

            config.causal_analysis = causal_analysis

            config.global_effects = causal_analysis._global_causal_effect_dict(
                alpha=config.alpha)

            X_test = self._test.drop([self._target_column], axis=1)
            config.local_effects = causal_analysis._local_causal_effect_dict(
                X_test, alpha=config.alpha)

            config.policy_tree = {}
            config.policy_gains = {}

    def get(self):
        """Get the computed causal effects."""
        results = []
        for config in self._causal_config_list:
            if config.is_computed:
                results.append(config.to_result())
        return results

    def list(self):
        pass

    @property
    def name(self):
        """Get the name of the causal manager.
        :return: The name of the causal manager.
        :rtype: str
        """
        return ManagerNames.CAUSAL

    def _save(self, path):
        pass

    @staticmethod
    def _load(path, model_analysis):
        pass
