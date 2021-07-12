# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Result of causal analysis."""

from responsibleai._tools.causal.causal_constants import ResultAttributes
from responsibleai._interfaces import (
    CausalData, CausalPolicy, CausalPolicyGains,
    CausalPolicyTreeInternal, CausalPolicyTreeLeaf)


class CausalResult:
    """Result of causal analysis."""

    def __init__(
        self,
        id=None,
        config=None,
        causal_analysis=None,
        global_effects=None,
        local_effects=None,
        policies=None,
    ):
        self.id = id
        self.config = config
        self.causal_analysis = causal_analysis
        self.global_effects = global_effects
        self.local_effects = local_effects
        self.policies = policies

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

    def _whatif(self):
        pass

    def _get_policy_object(self, policy):
        policy_object = CausalPolicy()
        policy_object.treatment_feature = policy[
            ResultAttributes.TREATMENT_FEATURE]
        policy_object.control_treatment = policy[
            ResultAttributes.CONTROL_TREATMENT]
        policy_object.local_policies = self._get_local_policies_object(
            policy[ResultAttributes.LOCAL_POLICIES])
        policy_object.policy_gains = self._get_policy_gains_object(
            policy[ResultAttributes.POLICY_GAINS])
        policy_object.policy_tree = self._get_policy_tree_object(
            policy[ResultAttributes.POLICY_TREE])
        return policy_object

    def _get_local_policies_object(self, local_policies):
        if local_policies is None:
            return None

        return local_policies.reset_index().\
            to_dict(orient='records')

    def _get_policy_gains_object(self, policy_gains):
        policy_gains_object = CausalPolicyGains()
        policy_gains_object.recommended_policy_gains = \
            policy_gains[ResultAttributes.RECOMMENDED_POLICY_GAINS]
        policy_gains_object.treatment_gains = \
            policy_gains[ResultAttributes.TREATMENT_GAINS]
        return policy_gains_object

    def _get_policy_tree_object(self, policy_tree):
        if policy_tree[ResultAttributes.LEAF]:
            policy_tree_object = CausalPolicyTreeLeaf()
            policy_tree_object.leaf = policy_tree[ResultAttributes.LEAF]
            policy_tree_object.n_samples = policy_tree[
                ResultAttributes.N_SAMPLES]
            policy_tree_object.treatment = policy_tree[
                ResultAttributes.TREATMENT]
        else:
            policy_tree_object = CausalPolicyTreeInternal()
            policy_tree_object.leaf = policy_tree[ResultAttributes.LEAF]
            policy_tree_object.feature = policy_tree[ResultAttributes.FEATURE]
            policy_tree_object.threshold = policy_tree[
                ResultAttributes.THRESHOLD]
            policy_tree_object.left = self._get_policy_tree_object(
                policy_tree[ResultAttributes.LEFT])
            policy_tree_object.right = self._get_policy_tree_object(
                policy_tree[ResultAttributes.RIGHT])
        return policy_tree_object

    def save(self, path):
        pass

    @classmethod
    def load(cls, path) -> 'CausalResult':
        pass
