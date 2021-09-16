# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Result of causal analysis."""

import json
import pandas as pd
import re
import semver
import uuid

from pathlib import Path
from typing import Any, List, Optional, Tuple, Union

from responsibleai._tools.causal.causal_constants import (
    ResultAttributes)
from responsibleai._tools.shared.versions import CausalVersions
from responsibleai._interfaces import (
    CausalConfig as CausalConfigInterface, CausalData, CausalPolicy,
    CausalPolicyGains, CausalPolicyTreeInternal, CausalPolicyTreeLeaf,
    ComparisonTypes)
from responsibleai._tools.causal.causal_config import CausalConfig
from responsibleai._tools.shared.base_result import BaseResult


class CausalResult(BaseResult['CausalResult']):
    """Result of causal analysis."""

    _ATTRIBUTES = [
        'config',
        'causal_analysis',
        'global_effects',
        'local_effects',
        'policies',
    ]

    def __init__(
        self,
        config: Optional[CausalConfig] = None,
        causal_analysis: Optional[Any] = None,
        global_effects: Optional[pd.DataFrame] = None,
        local_effects: Optional[pd.DataFrame] = None,
        policies: Optional[Any] = None,
    ):
        super().__init__(str(uuid.uuid4()), CausalVersions.get_current())

        self.config = config

        self.causal_analysis = causal_analysis
        self.global_effects = global_effects
        self.local_effects = local_effects
        self.policies = policies

    def _get_dashboard_object(self):
        causal_data = CausalData()

        causal_data.id = self.id
        causal_data.version = self.version

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
        policy_tree: Any,
        categoricals: List[str],
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

    @classmethod
    def _get_schema(cls, version: str):
        cls._validate_version(version)

        schema_directory = Path(__file__).parent / 'dashboard_schemas'
        schema_filename = f'schema_{version}.json'
        schema_filepath = schema_directory / schema_filename
        with open(schema_filepath, 'r') as f:
            return json.load(f)

    @classmethod
    def _validate_version(cls, version):
        semver_version = semver.VersionInfo.parse(version)
        if semver_version.compare(CausalVersions.get_current()) > 0:
            raise ValueError("The installed version of responsibleai "
                             "is not compatible with causal result version "
                             f"{version}. Please upgrade in order to load "
                             "this result.")

        if version not in CausalVersions.get_all():
            raise ValueError(f"Invalid version for causal result: {version}")

    def _get_attributes(self):
        return self._ATTRIBUTES
