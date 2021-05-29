# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Causal Manager class."""
from econml.solutions.causal_analysis import CausalAnalysis

from responsibleai._internal.constants import ManagerNames
from responsibleai._managers.base_manager import BaseManager
from responsibleai._config.base_config import BaseConfig
from responsibleai.modelanalysis.constants import ModelTask
from responsibleai.exceptions import (
    UserConfigValidationException, DuplicateManagerConfigException)


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
    ):
        super().__init__()
        self.treatment_features = treatment_features
        self.nuisance_model = nuisance_model
        self.heterogeneity_model = heterogeneity_model

        # Outputs
        self.causal_effects = None

    def __eq__(self, other):
        return (
            self.treatment_features == other.treatment_features and
            self.nuisance_model == other.nuisance_model and
            self.heterogeneity_model == other.heterogeneity_model
        )

    def __repr__(self):
        return ("CausalConfig("
                f"treatment_features={self.treatment_features}, "
                f"nuisance_model={self.nuisance_model})")


class CausalManager(BaseManager):
    def __init__(self, full_dataset, subsample, target_column, task_type,
                 categorical_features):
        """Construct a CausalManager for generating causal effects from a dataset.
        :param full_dataset: Dataset on which to compute global causal effects
                     (#samples x #features).
        :type full_dataset: pandas.DataFrame
        :param subsample: Dataset on which to compute local causal effects
                     (#samples x #features).
        :type subsample: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: Task type is either 'classification/regression'
        :type task_type: str
        :param categorical_features: All categorical feature names.
        :type categorical_features: list
        """
        self._full_dataset = full_dataset
        self._subsample = subsample
        self._target_column = target_column
        self._task_type = task_type
        self._categorical_features = categorical_features
        self._causal_config_list = []
        self._causal_analysis_list = []

    def add(
        self,
        treatment_features=None,
        nuisance_model=CausalConstants.AUTOML,
        heterogeneity_model=None,
    ):
        """Add a causal configuration to be computed later.
        :param treatment_features: All treatment feature names.
        :type treatment_features: list
        :param heterogeneity_model: Model type to use for
                                    treatment effect heterogeneity.
        :type heterogeneity_model: str
        :param nuisance_model: Model type to use for nuisance estimation.
        :type nuisance_model: str
        """
        causal_config = CausalConfig(treatment_features=treatment_features,
                                     nuisance_model=nuisance_model,
                                     heterogeneity_model=heterogeneity_model)

        if causal_config.is_duplicate(self._causal_config_list):
            raise DuplicateManagerConfigException(
                "Duplicate causal configuration detected.")

        self._causal_config_list.append(causal_config)

    def compute(self):
        """Computes the causal effects by running the causal configuration."""
        for config in self._causal_config_list:
            if not config.is_computed:
                config.is_computed = True
                if config.nuisance_model not in [CausalConstants.AUTOML,
                                                 CausalConstants.LINEAR]:
                    message = (f"nuisance_model should be one of "
                               f"['{CausalConstants.AUTOML}', "
                               f"'{CausalConstants.LINEAR}'], "
                               f"got {config.nuisance_model}")
                    raise UserConfigValidationException(message)

                is_classification = self._task_type == ModelTask.CLASSIFICATION
                X = self._full_dataset.drop([self._target_column], axis=1)
                y = self._full_dataset[self._target_column].values.ravel()
                causal_analysis = CausalAnalysis(
                    X.columns.values.tolist(),
                    self._categorical_features,
                    heterogeneity_inds=config.treatment_features,
                    classification=is_classification,
                    nuisance_models=config.nuisance_model,
                    n_jobs=-1)
                causal_analysis.fit(X, y)
                config.global_causal_effects = causal_analysis\
                    .global_causal_effect(
                        alpha=0.05)
                config.local_causal_effects = causal_analysis\
                    .local_causal_effect(
                        self._subsample.drop([self._target_column], axis=1),
                        alpha=0.05)
                self._causal_analysis_list.append(causal_analysis)

    def get(self):
        """Get the computed causal effects."""
        causal_effects = []
        for config in self._causal_config_list:
            if config.is_computed:
                causal_effects.append(
                    {
                        "global_causal_effects": config.global_causal_effects,
                        "local_causal_effects": config.local_causal_effects
                    })
        return causal_effects

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
