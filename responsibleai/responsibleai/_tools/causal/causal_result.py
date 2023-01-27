# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Result of causal analysis."""

import json
import re
import uuid
from pathlib import Path
from typing import Any, List, Optional, Tuple, Union

import pandas as pd
import semver

from responsibleai._interfaces import CausalConfig as CausalConfigInterface
from responsibleai._interfaces import (CausalData, CausalPolicy,
                                       CausalPolicyGains,
                                       CausalPolicyTreeInternal,
                                       CausalPolicyTreeLeaf, ComparisonTypes)
from responsibleai._internal.constants import (FileFormats,
                                               SerializationAttributes)
from responsibleai._tools.causal.causal_config import CausalConfig
from responsibleai._tools.causal.causal_constants import ResultAttributes
from responsibleai._tools.shared.base_result import BaseResult
from responsibleai._tools.shared.versions import CausalVersions


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

    @property
    def is_computed(self):
        """Check if the causal analysis was performed.

        :return: True if causal analysis was performed and False
            otherwise.
        :rtype: boolean
        """
        return self.causal_analysis is not None or \
            self.global_effects is not None or \
            self.local_effects is not None or \
            self.policies is not None

    def _create_causal_data_object(self):
        """Create a causal data object.

        :return: An object of type CausalData.
        :rtype: CausalData
        """
        causal_data = CausalData()

        causal_data.id = self.id
        causal_data.version = self.version
        causal_data.config = self._get_config_object(self.config)

        return causal_data

    def _get_dashboard_object(self):
        causal_data = self._create_causal_data_object()

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

    def _global_cohort_effects(self, X_test):
        """Get global causal effects for cohort data.

        :param X_test: The data for which the causal policy
                       needs to be generated.
        :type X_test: Any
        :return: An object of type CausalData with
                 causal effects.
        :rtype: CausalData
        """
        causal_data = self._create_causal_data_object()
        causal_data.global_effects = \
            self.causal_analysis.cohort_causal_effect(
                X_test, alpha=self.config.alpha,
                keep_all_levels=True).reset_index().to_dict(
                    orient="records")
        return causal_data

    def _local_instance_effects(self, X_test):
        """Get local causal effects for a given data point.

        :param X_test: The data for which the local causal effects
                       needs to be generated for a given point.
        :type X_test: Any
        :return: An object of type CausalData with
                 causal effects for a given point.
        :rtype: CausalData
        """
        causal_data = self._create_causal_data_object()

        local_effects = self.causal_analysis.local_causal_effect(
            X_test, alpha=self.config.alpha,
            keep_all_levels=True)

        local_dicts = local_effects.groupby('sample').apply(
            lambda x: x.reset_index().to_dict(
                orient='records')).values
        causal_data.local_effects = [list(v) for v in local_dicts]

        return causal_data

    def _global_cohort_policy(self, X_test):
        """Get global causal policy for cohort data.

        :param X_test: The data for which the causal policy
                       needs to be generated.
        :type X_test: Any
        :return: An object of type CausalData with
                 causal effects.
        :rtype: CausalData
        """
        causal_data = self._create_causal_data_object()

        causal_config = self.config
        if isinstance(causal_config.treatment_cost, int) and \
                causal_config.treatment_cost == 0:
            revised_treatment_cost = [0] * len(
                causal_config.treatment_features)
        else:
            revised_treatment_cost = causal_config.treatment_cost

        policies = []
        for i in range(len(causal_config.treatment_features)):
            policy = self._create_policy(
                X_test,
                causal_config.treatment_features[i],
                revised_treatment_cost[i],
                causal_config.alpha, causal_config.max_tree_depth,
                causal_config.min_tree_leaf_samples)
            policies.append(policy)
        causal_data.policies = [self._get_policy_object(p) for p in
                                policies]
        return causal_data

    def _create_policy(
        self,
        X_test,
        treatment_feature,
        treatment_cost,
        alpha,
        max_tree_depth,
        min_tree_leaf_samples,
    ):
        local_policies = self.causal_analysis.individualized_policy(
            X_test, treatment_feature,
            treatment_costs=treatment_cost,
            alpha=alpha)

        tree = self.causal_analysis._policy_tree_output(
            X_test, treatment_feature,
            treatment_costs=treatment_cost,
            max_depth=max_tree_depth,
            min_samples_leaf=min_tree_leaf_samples,
            alpha=alpha)

        return {
            ResultAttributes.TREATMENT_FEATURE: treatment_feature,
            ResultAttributes.CONTROL_TREATMENT: tree.control_name,
            ResultAttributes.LOCAL_POLICIES: local_policies,
            ResultAttributes.POLICY_GAINS: {
                ResultAttributes.RECOMMENDED_POLICY_GAINS:
                    tree.policy_value,
                ResultAttributes.TREATMENT_GAINS: tree.always_treat,
            },
            ResultAttributes.POLICY_TREE: tree.tree_dictionary
        }

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

        schema_directory = Path(__file__).parent / \
            SerializationAttributes.DASHBOARD_SCHEMAS
        schema_filename = f'schema_{version}{FileFormats.JSON}'
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
