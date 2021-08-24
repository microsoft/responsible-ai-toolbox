# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Result of causal analysis."""

import json
import re
import uuid

from pathlib import Path
from typing import Any, Optional, Tuple, Union

from responsibleai._tools.causal.causal_constants import (
    ResultAttributes, SerializationAttributes)
from responsibleai._interfaces import (
    CausalConfig as CausalConfigInterface, CausalData, CausalPolicy,
    CausalPolicyGains, CausalPolicyTreeInternal, CausalPolicyTreeLeaf,
    ComparisonTypes)
from responsibleai._tools.causal.causal_config import CausalConfig
from responsibleai._tools.shared.attribute_serialization import (
    load_attributes, save_attributes)
from responsibleai.serialization_utilities import serialize_json_safe


class CausalResult:
    """Result of causal analysis."""

    _ATTRIBUTES = [
        'config',
        'causal_analysis',
        'global_effects',
        'local_effects',
        'policies'
    ]

    def __init__(
        self,
        config: Optional[CausalConfig] = None,
        causal_analysis: Optional[Any] = None,
        global_effects: Optional[Any] = None,
        local_effects: Optional[Any] = None,
        policies: Optional[Any] = None,
    ):
        self.id = str(uuid.uuid4())

        self.config = config

        self.causal_analysis = causal_analysis
        self.global_effects = global_effects
        self.local_effects = local_effects
        self.policies = policies

    def save(self, path: Union[str, Path]):
        result_dir = Path(path)
        result_dir.mkdir(parents=True, exist_ok=True)

        # Save all result attributes to disk
        save_attributes(self, self._ATTRIBUTES, result_dir)

        # Save dashboard file
        dashboard = self._get_dashboard_data()
        dashboard_filename = SerializationAttributes.DASHBOARD_FILENAME
        with open(result_dir / dashboard_filename, 'w') as f:
            json.dump(dashboard, f)

    @classmethod
    def load(cls, path: Union[str, Path]) -> 'CausalResult':
        result_dir = Path(path)

        result_id = result_dir.name
        loaded = cls()
        loaded.id = result_id

        # Load all result attributes from disk
        load_attributes(loaded, cls._ATTRIBUTES, result_dir)
        return loaded

    def _get_dashboard_data(self):
        return serialize_json_safe(self._get_dashboard_object())

    def _get_dashboard_object(self):
        causal_data = CausalData()

        causal_data.id = self.id
        causal_data.config = self._get_config_object(self.config)

        causal_data.global_effects = self.global_effects\
            .reset_index().to_dict(orient='records')
        local_dicts = self.local_effects.groupby('sample').apply(
            lambda x: x.reset_index().to_dict(
                orient='records')).values
        causal_data.local_effects = [list(v) for v in local_dicts]
        causal_data.policies = [self._get_policy_object(p) for p in
                                self.policies]

        return causal_data

    def _whatif(self, X, X_feature_new, feature_name, y, alpha=0.1):
        return self.causal_analysis.whatif(
            X, X_feature_new, feature_name, y, alpha=alpha)

    def _cohort_effects(self, X_test, alpha=0.01, keep_all_levels=False):
        return self.causal_analysis.cohort_causal_effect(
            X_test, alpha=alpha, keep_all_levels=keep_all_levels)

    def _get_config_object(self, config):
        config_object = CausalConfigInterface()
        config_object.treatment_features = config.treatment_features
        return config_object

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
            feature, comparison, value = self._parse_comparison(
                policy_tree, self.config.categorical_features)
            policy_tree_object.feature = feature
            policy_tree_object.right_comparison = comparison
            policy_tree_object.comparison_value = value
            policy_tree_object.left = self._get_policy_tree_object(
                policy_tree[ResultAttributes.LEFT])
            policy_tree_object.right = self._get_policy_tree_object(
                policy_tree[ResultAttributes.RIGHT])
        return policy_tree_object

    @classmethod
    def _parse_comparison(
        cls,
        policy_tree,
        categoricals,
    ) -> Tuple[str, str, Union[float, int, str]]:
        """Attempt to parse a categorical comparison from a policy tree node.

        The default assumption is that the feature is continuous and will
        have a real-valued threshold.

        This function checks known categorical features and attempts to parse
        a (feature, category) pair that would come from a one-hot encoding.

        Example (continuous):
            Original feature: "Size"
            Original comparison value: 0.891
            Parsed feature: "Size"
            Parsed comparison: "gt"
            Parsed comparison value: 0.891

        Example (categorical):
            Original feature: "Fruit_apple"
            Original comparison value: 0.5
            Parsed feature: "Fruit"
            Parsed comparison: "eq"
            Parsed comparison value: "apple"

        """
        tree_feature = policy_tree[ResultAttributes.FEATURE]
        threshold = policy_tree[ResultAttributes.THRESHOLD]

        # Default assumption is a continuous feature
        feature = tree_feature
        comparison = ComparisonTypes.GT
        value = threshold

        # Check for a categorical feature
        for cat_feature in sorted(categoricals)[::-1]:
            pattern = f'({cat_feature})_(.+)'
            match = re.match(pattern, tree_feature)
            if match is not None:
                feature = match.group(1)
                value = match.group(2)
                comparison = ComparisonTypes.EQ
                break

        return feature, comparison, value
