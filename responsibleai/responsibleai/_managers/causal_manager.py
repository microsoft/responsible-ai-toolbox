# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Causal Manager class."""
import pandas as pd

from econml.solutions.causal_analysis import CausalAnalysis

from responsibleai._interfaces import (
    CausalData, CausalPolicy, CausalPolicyGains,
    CausalPolicyTreeInternal, CausalPolicyTreeLeaf)
from responsibleai._internal.constants import ManagerNames
from responsibleai._managers.base_manager import BaseManager
from responsibleai.exceptions import (
    UserConfigValidationException)
from responsibleai.modelanalysis.constants import ModelTask


class CausalConstants:
    # Model types
    AUTOML = 'automl'
    LINEAR = 'linear'

    # Default parameter values
    DEFAULT_ALPHA = 0.05
    DEFAULT_MAX_CAT_EXPANSION = 50
    DEFAULT_TREATMENT_COST = 0
    DEFAULT_MIN_TREE_LEAF_SAMPLES = 2
    DEFAULT_MAX_TREE_DEPTH = 3
    DEFAULT_SKIP_CAT_LIMIT_CHECKS = False

    # Causal result attributes
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


class CausalResult:
    def __init__(
        self,
        causal_analysis=None,
        global_effects=None,
        local_effects=None,
        policies=None,
    ):
        self.causal_analysis = causal_analysis
        self.global_effects = global_effects
        self.local_effects = local_effects
        self.policies = policies

    def to_dict(self):
        return {
            'causal_analysis': self.causal_analysis,
            'global_effects': self.global_effects,
            'local_effects': self.local_effects,
            'policies': self.policies,
        }

    def serialize(self):
        causal_data = CausalData()
        causal_data.global_effects = self.global_effects\
            .reset_index().to_dict(orient='records')
        local_dicts = self.local_effects.groupby('sample').apply(
            lambda x: x.reset_index().to_dict(
                orient='records')).values
        causal_data.local_effects = [list(v) for v in local_dicts]
        causal_data.policies = [self._get_policy_object(p) for p in
                                self.policies]

        return causal_data

    def _get_policy_object(self, policy):
        policy_object = CausalPolicy()
        policy_object.treatment_feature = policy[
            CausalConstants.TREATMENT_FEATURE]
        policy_object.control_treatment = policy[
            CausalConstants.CONTROL_TREATMENT]
        policy_object.local_policies = self._get_local_policies_object(
            policy[CausalConstants.LOCAL_POLICIES])
        policy_object.policy_gains = self._get_policy_gains_object(
            policy[CausalConstants.POLICY_GAINS])
        policy_object.policy_tree = self._get_policy_tree_object(
            policy[CausalConstants.POLICY_TREE])
        return policy_object

    def _get_local_policies_object(self, local_policies):
        if local_policies is None:
            return None

        return local_policies.reset_index().\
            to_dict(orient='records')

    def _get_policy_tree_object(self, policy_tree):
        if policy_tree[CausalConstants.LEAF]:
            policy_tree_object = CausalPolicyTreeLeaf()
            policy_tree_object.leaf = policy_tree[CausalConstants.LEAF]
            policy_tree_object.n_samples = policy_tree[
                CausalConstants.N_SAMPLES]
            policy_tree_object.treatment = policy_tree[
                CausalConstants.TREATMENT]
        else:
            policy_tree_object = CausalPolicyTreeInternal()
            policy_tree_object.leaf = policy_tree[CausalConstants.LEAF]
            policy_tree_object.feature = policy_tree[CausalConstants.FEATURE]
            policy_tree_object.threshold = policy_tree[
                CausalConstants.THRESHOLD]
            policy_tree_object.left = self._get_policy_tree_object(
                policy_tree[CausalConstants.LEFT])
            policy_tree_object.right = self._get_policy_tree_object(
                policy_tree[CausalConstants.RIGHT])
        return policy_tree_object

    def _get_policy_gains_object(self, policy_gains):
        policy_gains_object = CausalPolicyGains()
        policy_gains_object.recommended_policy_gains = \
            policy_gains[CausalConstants.RECOMMENDED_POLICY_GAINS]
        policy_gains_object.treatment_gains = \
            policy_gains[CausalConstants.TREATMENT_GAINS]
        return policy_gains_object


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
        self._results = []

    def compute(
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
        """Compute causal insights.
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
        if nuisance_model not in [CausalConstants.AUTOML,
                                  CausalConstants.LINEAR]:
            message = (f"nuisance_model should be one of "
                       f"['{CausalConstants.AUTOML}', "
                       f"'{CausalConstants.LINEAR}'], "
                       f"got {nuisance_model}")
            raise UserConfigValidationException(message)

        is_classification = self._task_type == ModelTask.CLASSIFICATION
        X = pd.concat([self._train, self._test], ignore_index=True)\
            .drop([self._target_column], axis=1)
        y = pd.concat([self._train, self._test], ignore_index=True)[
            self._target_column].values.ravel()

        analysis = CausalAnalysis(
            treatment_features,
            self._categorical_features,
            heterogeneity_inds=heterogeneity_features,
            classification=is_classification,
            nuisance_models=nuisance_model,
            upper_bound_on_cat_expansion=upper_bound_on_cat_expansion,
            skip_cat_limit_checks=skip_cat_limit_checks,
            n_jobs=-1)
        analysis.fit(X, y)

        result = CausalResult()

        result.causal_analysis = analysis

        X_test = self._test.drop([self._target_column], axis=1)

        result.global_effects = analysis.global_causal_effect(
            alpha=alpha)
        result.local_effects = analysis.local_causal_effect(
            X_test, alpha=alpha)

        result.policies = []
        for treatment_feature in treatment_features:
            # Error handling required to mitigate
            # individualized_policy bug in EconML version 0.12.0b2
            try:
                local_policies = analysis.individualized_policy(
                    X_test, treatment_feature,
                    treatment_costs=treatment_cost,
                    alpha=alpha)
            except (IndexError, ValueError):
                local_policies = None

            tree = analysis._policy_tree_output(
                X_test, treatment_feature,
                treatment_costs=treatment_cost,
                max_depth=max_tree_depth,
                min_samples_leaf=min_tree_leaf_samples,
                alpha=alpha)

            policy = {
                CausalConstants.TREATMENT_FEATURE: treatment_feature,
                CausalConstants.CONTROL_TREATMENT: tree.control_name,
                CausalConstants.LOCAL_POLICIES: local_policies,
                CausalConstants.POLICY_GAINS: {
                    CausalConstants.RECOMMENDED_POLICY_GAINS:
                        tree.policy_value,
                    CausalConstants.TREATMENT_GAINS: tree.always_treat,
                },
                CausalConstants.POLICY_TREE: tree.tree_dictionary
            }
            result.policies.append(policy)
        self._results.append(result)

    def get(self):
        """Get the computed causal insights."""
        return [result.to_dict() for result in self._results]

    def list(self):
        pass

    def get_data(self):
        """Get causal data

        :return: List of CausalData objects.
        :rtype: List[CausalData]
        """
        return [result.serialize() for result in self._results]

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
