# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest
from econml.solutions.causal_analysis._causal_analysis import CausalAnalysis

from responsibleai import ModelTask
from responsibleai._interfaces import (CausalConfig, CausalData, CausalPolicy,
                                       CausalPolicyGains,
                                       CausalPolicyTreeInternal,
                                       CausalPolicyTreeLeaf)
from responsibleai._internal.constants import (CausalManagerKeys,
                                               ListProperties, ManagerNames)
from responsibleai._tools.causal.causal_result import CausalResult
from responsibleai.exceptions import UserConfigValidationException

EFFECTS_ATTRIBUTES = [
    'point',
    'stderr',
    'zstat',
    'ci_lower',
    'ci_upper',
    'p_value',
]

LOCAL_POLICY_ATTRIBUTES = [
    'Treatment',
    'Effect of treatment',
    'Effect of treatment lower bound',
    'Effect of treatment upper bound',
    'Current treatment'
]


def validate_causal(rai_insights, data, target_column,
                    treatment_features, max_cat_expansion):
    if rai_insights.task_type == ModelTask.CLASSIFICATION and \
            len(np.unique(data[target_column])) > 2:
        with pytest.raises(UserConfigValidationException,
                           match="Multiclass classification isn't supported"):
            rai_insights.causal.add(
                treatment_features,
                nuisance_model='automl',
                upper_bound_on_cat_expansion=max_cat_expansion)
            rai_insights.causal.compute()
        _check_causal_properties(rai_insights.causal.list(),
                                 expected_causal_effects=0)
        return

    # Add the first configuration
    rai_insights.causal.add(
        treatment_features,
        nuisance_model='automl',
        upper_bound_on_cat_expansion=max_cat_expansion)
    rai_insights.compute()

    results = rai_insights.causal.get()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 1
    _check_causal_result(results[0])

    _check_causal_properties(rai_insights.causal.list(),
                             expected_causal_effects=1)

    results = rai_insights.causal.get_data()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 1
    _check_causal_result(results[0], is_serialized=True)

    # Add the second configuration
    rai_insights.causal.add(treatment_features,
                            nuisance_model='linear')
    rai_insights.compute()
    results = rai_insights.causal.get()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 2

    _check_causal_properties(rai_insights.causal.list(),
                             expected_causal_effects=2)

    # Add a bad configuration for nuisance_model
    with pytest.raises(UserConfigValidationException):
        rai_insights.causal.add(treatment_features,
                                nuisance_model='fake_model')

    # Add a bad configuration for heterogeneity_model
    with pytest.raises(UserConfigValidationException):
        rai_insights.causal.add(treatment_features,
                                heterogeneity_model='fake_model')


def _check_causal_properties(
        causal_props, expected_causal_effects):
    assert causal_props[ListProperties.MANAGER_TYPE] == \
        ManagerNames.CAUSAL
    assert causal_props[
        CausalManagerKeys.CAUSAL_EFFECTS] is not None
    assert len(
        causal_props[CausalManagerKeys.CAUSAL_EFFECTS]) == \
        expected_causal_effects

    for causal_effect in causal_props[CausalManagerKeys.CAUSAL_EFFECTS]:
        assert causal_effect['global_effects_computed']
        assert causal_effect['local_effects_computed']
        assert causal_effect['policies_computed']


def _check_causal_result(causal_result, is_serialized=False):
    assert len(causal_result.id) > 0

    _check_config(causal_result.config,
                  is_serialized=is_serialized)

    if is_serialized:
        assert isinstance(causal_result, CausalData)
        assert len(causal_result.__dict__) == 6
    else:
        assert isinstance(causal_result, CausalResult)
        assert len(causal_result.__dict__) == 8
        _check_causal_analysis(causal_result.causal_analysis)

    _check_global_effects(causal_result.global_effects,
                          is_serialized=is_serialized)
    _check_local_effects(causal_result.local_effects,
                         is_serialized=is_serialized)
    _check_policies(causal_result.policies, causal_result.config,
                    is_serialized=is_serialized)


def _check_config(config, is_serialized=False):
    if is_serialized:
        assert isinstance(config, CausalConfig)
        assert len(config.__dict__) == 1
        assert config.treatment_features is not None
    else:
        assert len(config.__dict__) == 15


def _check_causal_analysis(causal_analysis):
    assert isinstance(causal_analysis, CausalAnalysis)


def _check_global_effects(global_effects, is_serialized=False):
    if is_serialized:
        assert isinstance(global_effects, list)
    else:
        assert isinstance(global_effects, pd.DataFrame)
        for attribute in EFFECTS_ATTRIBUTES:
            assert attribute in global_effects.columns.to_list()


def _check_local_effects(local_effects, is_serialized=False):
    if is_serialized:
        assert isinstance(local_effects, list)
    else:
        assert isinstance(local_effects, pd.DataFrame)
        for attribute in EFFECTS_ATTRIBUTES:
            assert attribute in local_effects.columns.to_list()


def _check_policies(policies, config, is_serialized=False):
    assert isinstance(policies, list)
    for policy in policies:
        _check_policy(policy, config, is_serialized=is_serialized)


def _check_policy(policy, config, is_serialized=False):
    if is_serialized:
        assert isinstance(policy, CausalPolicy)
        treatment_feature = policy.treatment_feature
        control_treatment = policy.control_treatment
        local_policies = policy.local_policies
        policy_gains = policy.policy_gains
        policy_tree = policy.policy_tree
    else:
        assert isinstance(policy, dict)
        treatment_feature = policy['treatment_feature']
        control_treatment = policy['control_treatment']
        local_policies = policy['local_policies']
        policy_gains = policy['policy_gains']
        policy_tree = policy['policy_tree']

    _check_treatment_feature(treatment_feature)
    _check_control_treatment(control_treatment)
    _check_local_policies(local_policies, is_serialized=is_serialized)
    _check_policy_gains(policy_gains, is_serialized=is_serialized)
    _check_policy_tree(policy_tree, config, is_serialized=is_serialized)


def _check_treatment_feature(treatment_feature):
    pass


def _check_control_treatment(control_treatment):
    pass


def _check_local_policies(local_policies, is_serialized=False):
    # Required for individualized_policy bug in EconML version 0.12.0b2
    if local_policies is None:
        return

    if is_serialized:
        assert isinstance(local_policies, list)
    else:
        assert isinstance(local_policies, pd.DataFrame)


def _check_policy_gains(policy_gains, is_serialized=False):
    if is_serialized:
        assert isinstance(policy_gains, CausalPolicyGains)
        recommended_policy_gains = policy_gains.recommended_policy_gains
        treatment_gains = policy_gains.treatment_gains
    else:
        assert isinstance(policy_gains, dict)
        recommended_policy_gains = policy_gains['recommended_policy_gains']
        treatment_gains = policy_gains['treatment_gains']

    assert isinstance(recommended_policy_gains, float)

    assert isinstance(treatment_gains, dict)
    for treatment_name, treatment_value in treatment_gains.items():
        assert isinstance(treatment_name, str)
        assert isinstance(treatment_value, float)


def _check_policy_tree(policy_tree, config, depth=0, is_serialized=False):
    if is_serialized:
        if policy_tree.leaf:
            assert isinstance(policy_tree, CausalPolicyTreeLeaf)
            assert hasattr(policy_tree, 'treatment')
            assert hasattr(policy_tree, 'n_samples')
        else:
            assert isinstance(policy_tree, CausalPolicyTreeInternal)
            assert isinstance(policy_tree.feature, str)
            assert isinstance(policy_tree.right_comparison, str)
            assert isinstance(policy_tree.comparison_value, (str, int, float))
            _check_policy_tree(policy_tree.left, config, depth=depth + 1,
                               is_serialized=is_serialized)
            _check_policy_tree(policy_tree.right, config, depth=depth + 1,
                               is_serialized=is_serialized)
    else:
        assert depth <= config.max_tree_depth

        assert isinstance(policy_tree, dict)
        if policy_tree['leaf']:
            assert 'treatment' in policy_tree
            assert 'n_samples' in policy_tree
        else:
            assert isinstance(policy_tree['feature'], str)
            assert isinstance(policy_tree['threshold'], float)
            _check_policy_tree(policy_tree['left'], config, depth=depth + 1,
                               is_serialized=is_serialized)
            _check_policy_tree(policy_tree['right'], config, depth=depth + 1,
                               is_serialized=is_serialized)
