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
from responsibleai._interfaces import CausalData


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
        max_cat_expansion=5,
        treatment_cost=0,
        min_tree_leaf_samples=2,
        max_tree_depth=3,
    ):
        super().__init__()
        self.treatment_features = treatment_features
        self.nuisance_model = nuisance_model
        self.heterogeneity_model = heterogeneity_model
        self.alpha = alpha
        self.max_cat_expansion = max_cat_expansion
        self.treatment_cost = treatment_cost
        self.min_tree_leaf_samples = min_tree_leaf_samples
        self.max_tree_depth = max_tree_depth

        # Outputs
        self.causal_analysis = None
        self.global_effects = None
        self.local_effects = None
        self.policies = None

    def __eq__(self, other):
        return all([
            np.array_equal(self.treatment_features,
                           other.treatment_features),
            self.nuisance_model == other.nuisance_model,
            self.heterogeneity_model == other.heterogeneity_model,
            self.alpha == other.alpha,
            self.max_cat_expansion == other.max_cat_expansion,
            self.treatment_cost == other.treatment_cost,
            self.min_tree_leaf_samples == other.min_tree_leaf_samples,
            self.max_tree_depth == other.max_tree_depth,
        ])

    def __repr__(self):
        return ("CausalConfig("
                f"treatment_features={self.treatment_features}, "
                f"nuisance_model={self.nuisance_model}, "
                f"heterogeneity_model={self.heterogeneity_model}, "
                f"alpha={self.alpha}, "
                f"max_cat_expansion={self.max_cat_expansion}, "
                f"treatment_cost={self.treatment_cost}, "
                f"min_tree_leaf_samples={self.min_tree_leaf_samples}, "
                f"max_tree_depth={self.max_tree_depth})")

    def to_result(self):
        return {
            'causal_analysis': self.causal_analysis,
            'global_effects': self.global_effects,
            'local_effects': self.local_effects,
            'policies': self.policies,
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
        max_cat_expansion=5,
        treatment_cost=0,
        min_tree_leaf_samples=2,
        max_tree_depth=3,
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
        :param max_cat_expansion: Maximum expansion for categorical features.
        :type max_cat_expansion: int
        :param treatment_cost: Cost to treat one individual or
                               per-individual costs as an array.
        :type treatment_cost: float or array
        :param min_tree_leaf_samples: Minimum number of samples per leaf
                                      in policy tree.
        :type min_tree_leaf_samples: int
        :param max_tree_depth: Maximum depth of policy tree.
        :type max_tree_depth: int
        """
        causal_config = CausalConfig(
            treatment_features=treatment_features,
            nuisance_model=nuisance_model,
            heterogeneity_model=heterogeneity_model,
            alpha=alpha,
            max_cat_expansion=max_cat_expansion,
            treatment_cost=treatment_cost,
            min_tree_leaf_samples=min_tree_leaf_samples,
            max_tree_depth=max_tree_depth)

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

            analysis = CausalAnalysis(
                X.columns.values.tolist(),
                self._categorical_features,
                heterogeneity_inds=config.treatment_features,
                classification=is_classification,
                nuisance_models=config.nuisance_model,
                upper_bound_on_cat_expansion=config.max_cat_expansion,
                n_jobs=-1)
            analysis.fit(X, y)

            config.causal_analysis = analysis

            config.global_effects = analysis.global_causal_effect(
                alpha=0.05)
            X_test = self._test.drop([self._target_column], axis=1)
            config.local_effects = analysis.local_causal_effect(
                X_test)

            config.policies = []
            if config.treatment_features is not None:
                for treatment_feature in config.treatment_features:
                    local_policies = analysis._individualized_policy_dict(
                        X_test, treatment_feature,
                        treatment_costs=config.treatment_cost,
                        alpha=config.alpha)

                    policy_tree, recommended_gains, treatment_gains = \
                        analysis._policy_tree_output(
                            X_test, treatment_feature,
                            treatment_costs=config.treatment_cost,
                            max_depth=config.max_tree_depth,
                            min_samples_leaf=config.min_tree_leaf_samples,
                            alpha=config.alpha)

                    policy = {
                        'local_policies': local_policies,
                        'policy_tree': policy_tree,
                        'policy_gains': {
                            'recommended_policy_gains': recommended_gains,
                            'treatment_gains': treatment_gains,
                        }
                    }
                    config.policies.append(policy)

    def get(self):
        """Get the computed causal effects."""
        results = []
        for config in self._causal_config_list:
            if config.is_computed:
                results.append(config.to_result())
        return results

    def list(self):
        pass

    def get_data(self):
        """Get causal data

        :return: A array of CausalData.
        :rtype: List[CausalData]
        """
        return [self._get_causal(i)
                for i in self.get()]

    def _get_causal(self, causal):
        causal_data = CausalData()
        causal_data.globalCausalEffects = causal["global_effects"]\
            .reset_index().to_dict(orient="records")
        causal_data.localCausalEffects = causal["local_effects"]\
            .groupby("sample").apply(
                lambda x: x.reset_index().to_dict(
                    orient='records')).values
        return causal_data

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
