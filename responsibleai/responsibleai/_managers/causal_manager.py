# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Causal Manager class."""
import numpy as np
import pandas as pd
from uuid import uuid4

from econml.solutions.causal_analysis import CausalAnalysis

from responsibleai._config.base_config import BaseConfig
from responsibleai._interfaces import (
    CausalData, CausalPolicy, CausalPolicyGains,
    CausalPolicyTreeInternal, CausalPolicyTreeLeaf)
from responsibleai._internal.constants import ManagerNames
from responsibleai._managers.base_manager import BaseManager
from responsibleai.exceptions import (
    UserConfigValidationException, DuplicateManagerConfigException)
from responsibleai.modelanalysis.constants import ModelTask


class CausalConstants:
    # Model types
    AUTOML = 'automl'
    LINEAR = 'linear'

    DEFAULT_ALPHA = 0.05
    DEFAULT_MAX_CAT_EXPANSION = 50
    DEFAULT_TREATMENT_COST = 0
    DEFAULT_MIN_TREE_LEAF_SAMPLES = 2
    DEFAULT_MAX_TREE_DEPTH = 3
    DEFAULT_SKIP_CAT_LIMIT_CHECKS = False


class CausalConfig(BaseConfig):
    def __init__(
        self,
        treatment_features,
        heterogeneity_features,
        nuisance_model,
        heterogeneity_model,
        alpha,
        max_cat_expansion,
        treatment_cost,
        min_tree_leaf_samples,
        max_tree_depth,
        skip_cat_limit_checks,
    ):
        super().__init__()
        self.treatment_features = treatment_features
        self.heterogeneity_features = heterogeneity_features
        self.nuisance_model = nuisance_model
        self.heterogeneity_model = heterogeneity_model
        self.alpha = alpha
        self.max_cat_expansion = max_cat_expansion
        self.treatment_cost = treatment_cost
        self.min_tree_leaf_samples = min_tree_leaf_samples
        self.max_tree_depth = max_tree_depth
        self.skip_cat_limit_checks = skip_cat_limit_checks
        self.id = str(uuid4())

        # Outputs
        self.causal_analysis = None
        self.global_effects = None
        self.local_effects = None
        self.policies = None

    def __eq__(self, other):
        return all([
            np.array_equal(self.treatment_features,
                           other.treatment_features),
            np.array_equal(self.heterogeneity_features,
                           other.heterogeneity_features),
            self.nuisance_model == other.nuisance_model,
            self.heterogeneity_model == other.heterogeneity_model,
            self.alpha == other.alpha,
            self.max_cat_expansion == other.max_cat_expansion,
            self.treatment_cost == other.treatment_cost,
            self.min_tree_leaf_samples == other.min_tree_leaf_samples,
            self.max_tree_depth == other.max_tree_depth,
            self.skip_cat_limit_checks == other.skip_cat_limit_checks,
        ])

    def __repr__(self):
        return ("CausalConfig("
                f"treatment_features={self.treatment_features}, "
                f"heterogeneity_features={self.heterogeneity_features}, "
                f"nuisance_model={self.nuisance_model}, "
                f"heterogeneity_model={self.heterogeneity_model}, "
                f"alpha={self.alpha}, "
                f"max_cat_expansion={self.max_cat_expansion}, "
                f"treatment_cost={self.treatment_cost}, "
                f"min_tree_leaf_samples={self.min_tree_leaf_samples}, "
                f"max_tree_depth={self.max_tree_depth}, "
                f"skip_cat_limit_checks={self.skip_cat_limit_checks})")

    def to_result(self):
        return {
            'causal_analysis': self.causal_analysis,
            'global_effects': self.global_effects,
            'local_effects': self.local_effects,
            'policies': self.policies,
            'id': self.id,
            'treatment_features': self.treatment_features
        }


class CausalManager(BaseManager):
    TREATMENT_FEATURE = 'treatment_feature'
    LOCAL_POLICIES = 'local_policies'
    POLICY_TREE = 'policy_tree'
    POLICY_GAINS = 'policy_gains'
    CONTROL_TREATMENT = 'control_treatment'
    RECOMMENDED_POLICY_GAINS = 'recommended_policy_gains'
    TREATMENT_GAINS = 'treatment_gains'

    LEAF = 'leaf'
    N_SAMPLES = 'n_samples'
    TREATMENT = 'treatment'
    FEATURE = 'feature'
    THRESHOLD = 'threshold'
    LEFT = 'left'
    RIGHT = 'right'

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
        treatment_features,
        heterogeneity_features=None,
        nuisance_model=CausalConstants.LINEAR,
        heterogeneity_model=None,
        alpha=CausalConstants.DEFAULT_ALPHA,
        upper_bound_on_cat_expansion=CausalConstants.DEFAULT_MAX_CAT_EXPANSION,
        treatment_cost=CausalConstants.DEFAULT_TREATMENT_COST,
        min_tree_leaf_samples=CausalConstants.DEFAULT_MIN_TREE_LEAF_SAMPLES,
        max_tree_depth=CausalConstants.DEFAULT_MAX_TREE_DEPTH,
        skip_cat_limit_checks=CausalConstants.DEFAULT_SKIP_CAT_LIMIT_CHECKS,
    ):
        """Add a causal configuration to be computed later.
        :param treatment_features: Treatment feature names.
        :type treatment_features: list
        :param heterogeneity_features: Features that mediate the causal effect.
        :type heterogeneity_features: list
        :param nuisance_model: Model type to use for nuisance estimation.
        :type nuisance_model: str
        :param heterogeneity_model: Model type to use for
                                    treatment effect heterogeneity.
        :type heterogeneity_model: str
        :param alpha: Confidence level of confidence intervals.
        :type alpha: float
        :param upper_bound_on_cat_expansion: Maximum expansion for
                                             categorical features.
        :type upper_bound_on_cat_expansion: int
        :param treatment_cost: Cost to treat one individual or
                               per-individual costs as an array.
        :type treatment_cost: float or array
        :param min_tree_leaf_samples: Minimum number of samples per leaf
                                      in policy tree.
        :type min_tree_leaf_samples: int
        :param max_tree_depth: Maximum depth of policy tree.
        :type max_tree_depth: int
        :param skip_cat_limit_checks: By default, categorical features need
                                      to have several instances of each
                                      category in order for a model to be
                                      fit robustly. Setting this to True
                                      will skip these checks.
        :type skip_cat_limit_checks: bool
        """
        if not set(treatment_features).issubset(set(self._train.columns)):
            raise UserConfigValidationException(
                'Found some feature names in treatment feature list which'
                ' do not occur in train data'
            )

        causal_config = CausalConfig(
            treatment_features,
            heterogeneity_features=heterogeneity_features,
            nuisance_model=nuisance_model,
            heterogeneity_model=heterogeneity_model,
            alpha=alpha,
            max_cat_expansion=upper_bound_on_cat_expansion,
            treatment_cost=treatment_cost,
            min_tree_leaf_samples=min_tree_leaf_samples,
            max_tree_depth=max_tree_depth,
            skip_cat_limit_checks=skip_cat_limit_checks)

        if causal_config.is_duplicate(self._causal_config_list):
            raise DuplicateManagerConfigException(
                "Duplicate causal configuration detected.")

        self._causal_config_list.append(causal_config)

    def compute(self):
        """Computes the causal insights by running the causal configuration."""
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

            categoricals = self._categorical_features
            if categoricals is None:
                categoricals = []

            analysis = CausalAnalysis(
                config.treatment_features,
                categoricals,
                heterogeneity_inds=config.heterogeneity_features,
                classification=is_classification,
                nuisance_models=config.nuisance_model,
                upper_bound_on_cat_expansion=config.max_cat_expansion,
                skip_cat_limit_checks=config.skip_cat_limit_checks,
                n_jobs=-1)
            analysis.fit(X, y)

            config.causal_analysis = analysis

            X_test = self._test.drop([self._target_column], axis=1)

            config.global_effects = analysis.global_causal_effect(
                alpha=config.alpha, keep_all_levels=True)
            config.local_effects = analysis.local_causal_effect(
                X_test, alpha=config.alpha, keep_all_levels=True)

            config.policies = []
            for treatment_feature in config.treatment_features:
                local_policies = analysis.individualized_policy(
                    X_test, treatment_feature,
                    treatment_costs=config.treatment_cost,
                    alpha=config.alpha)

                tree = analysis._policy_tree_output(
                    X_test, treatment_feature,
                    treatment_costs=config.treatment_cost,
                    max_depth=config.max_tree_depth,
                    min_samples_leaf=config.min_tree_leaf_samples,
                    alpha=config.alpha)

                policy = {
                    self.TREATMENT_FEATURE: treatment_feature,
                    self.CONTROL_TREATMENT: tree.control_name,
                    self.LOCAL_POLICIES: local_policies,
                    self.POLICY_GAINS: {
                        self.RECOMMENDED_POLICY_GAINS: tree.policy_value,
                        self.TREATMENT_GAINS: tree.always_treat,
                    },
                    self.POLICY_TREE: tree.tree_dictionary
                }
                config.policies.append(policy)

    def get(self):
        """Get the computed causal insights."""
        results = []
        for config in self._causal_config_list:
            if config.is_computed:
                results.append(config.to_result())
        return results

    def list(self):
        pass

    def _whatif(self, id, X, Xnew, feature_index, y):
        """Get what-if data

        :return: List of CausalData objects.
        :rtype: List[CausalData]
        """
        causal_filtered = [x for x in self.get() if x["id"] == id]
        if len(causal_filtered) == 0:
            raise Exception(f"Failed to find causal with id: {id}")
        causal = causal_filtered[0]['causal_analysis']
        whatif = causal.whatif(X, Xnew, feature_index, y).to_dict(
            orient="records")
        return whatif

    def get_data(self):
        """Get causal data

        :return: List of CausalData objects.
        :rtype: List[CausalData]
        """
        return [self._get_causal_object(insights) for insights in self.get()]

    def _get_causal_object(self, causal_insights):
        causal_data = CausalData()
        causal_data.id = causal_insights['id']
        causal_data.treatment_features = causal_insights['treatment_features']
        causal_data.global_effects = causal_insights['global_effects']\
            .reset_index().to_dict(orient='records')
        causal_data.local_effects = [list(v) for v in causal_insights[
            'local_effects'].groupby('sample').apply(
                lambda x: x.reset_index().to_dict(
                    orient='records')).values]

        causal_data.policies = [self._get_policy_object(p) for p in
                                causal_insights['policies']]

        return causal_data

    def _get_policy_object(self, policy):
        policy_object = CausalPolicy()
        policy_object.treatment_feature = policy[self.TREATMENT_FEATURE]
        policy_object.control_treatment = policy[self.CONTROL_TREATMENT]
        policy_object.local_policies = self._get_local_policies_object(
            policy[self.LOCAL_POLICIES])
        policy_object.policy_gains = self._get_policy_gains_object(
            policy[self.POLICY_GAINS])
        policy_object.policy_tree = self._get_policy_tree_object(
            policy[self.POLICY_TREE])
        return policy_object

    def _get_local_policies_object(self, local_policies):
        if local_policies is None:
            return None

        return local_policies.reset_index().\
            to_dict(orient='records')

    def _get_policy_tree_object(self, policy_tree):
        if policy_tree[self.LEAF]:
            policy_tree_object = CausalPolicyTreeLeaf()
            policy_tree_object.leaf = policy_tree[self.LEAF]
            policy_tree_object.n_samples = policy_tree[self.N_SAMPLES]
            policy_tree_object.treatment = policy_tree[self.TREATMENT]
        else:
            policy_tree_object = CausalPolicyTreeInternal()
            policy_tree_object.leaf = policy_tree[self.LEAF]
            policy_tree_object.feature = policy_tree[self.FEATURE]
            policy_tree_object.threshold = policy_tree[self.THRESHOLD]
            policy_tree_object.left = self._get_policy_tree_object(
                policy_tree[self.LEFT])
            policy_tree_object.right = self._get_policy_tree_object(
                policy_tree[self.RIGHT])
        return policy_tree_object

    def _get_policy_gains_object(self, policy_gains):
        policy_gains_object = CausalPolicyGains()
        policy_gains_object.recommended_policy_gains = \
            policy_gains[self.RECOMMENDED_POLICY_GAINS]
        policy_gains_object.treatment_gains = \
            policy_gains[self.TREATMENT_GAINS]
        return policy_gains_object

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
