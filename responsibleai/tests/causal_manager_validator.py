# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

import pandas as pd
import numpy as np

from responsibleai.modelanalysis.constants import (
    ModelTask)

from responsibleai.exceptions import (
    DuplicateManagerConfigException,
    UserConfigValidationException)

from responsibleai._interfaces import (
    CausalData, CausalPolicy, CausalPolicyGains,
    CausalPolicyTreeInternal, CausalPolicyTreeLeaf)

from econml.solutions.causal_analysis._causal_analysis import CausalAnalysis


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


def validate_causal(model_analysis, data, target_column,
                    treatment_features, max_cat_expansion):
    if model_analysis.task_type == ModelTask.CLASSIFICATION and \
            len(np.unique(data[target_column])) > 2:
        with pytest.raises(AssertionError,
                           match="Multiclass classification isn't supported"):
            model_analysis.causal.add(
                treatment_features,
                nuisance_model='automl',
                upper_bound_on_cat_expansion=max_cat_expansion)
            model_analysis.causal.compute()
        return

    # Add the first configuration
    model_analysis.causal.add(
        treatment_features,
        nuisance_model='automl',
        upper_bound_on_cat_expansion=max_cat_expansion)
    model_analysis.causal.compute()

    results = model_analysis.causal.get()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 1
    _check_causal_results(results[0])

    results = model_analysis.causal.get_data()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 1
    _check_causal_results(results[0], is_serialized=True)

    # Add a duplicate configuration
    message = "Duplicate causal configuration detected."
    with pytest.raises(DuplicateManagerConfigException, match=message):
        model_analysis.causal.add(
            treatment_features,
            nuisance_model='automl',
            upper_bound_on_cat_expansion=max_cat_expansion)

    # Add the second configuration
    model_analysis.causal.add(treatment_features,
                              nuisance_model='linear')
    model_analysis.causal.compute()
    results = model_analysis.causal.get()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 2

    # Add a bad configuration
    model_analysis.causal.add(treatment_features,
                              nuisance_model='fake_model')
    with pytest.raises(UserConfigValidationException):
        model_analysis.causal.compute()


def _check_causal_results(causal_results, is_serialized=False):
    if is_serialized:
        assert isinstance(causal_results, CausalData)
        assert len(causal_results.__dict__) == 5
        global_effects = causal_results.global_effects
        local_effects = causal_results.local_effects
        policies = causal_results.policies
        assert len(causal_results.id) > 0
        assert causal_results.treatment_features is not None
    else:
        assert isinstance(causal_results, dict)
        assert len(causal_results) == 6
        global_effects = causal_results['global_effects']
        local_effects = causal_results['local_effects']
        policies = causal_results['policies']
        assert len(causal_results['id']) > 0
        assert causal_results['treatment_features'] is not None

        _check_causal_analysis(causal_results['causal_analysis'])

    _check_global_effects(global_effects, is_serialized=is_serialized)
    _check_local_effects(local_effects, is_serialized=is_serialized)
    _check_policies(policies, is_serialized=is_serialized)


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


def _check_policies(policies, is_serialized=False):
    assert isinstance(policies, list)
    for policy in policies:
        _check_policy(policy, is_serialized=is_serialized)


def _check_policy(policy, is_serialized=False):
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
    _check_policy_tree(policy_tree, is_serialized=is_serialized)


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


def _check_policy_tree(policy_tree, is_serialized=False):
    if is_serialized:
        if policy_tree.leaf:
            assert isinstance(policy_tree, CausalPolicyTreeLeaf)
            assert hasattr(policy_tree, 'treatment')
            assert hasattr(policy_tree, 'n_samples')
        else:
            assert isinstance(policy_tree, CausalPolicyTreeInternal)
            assert isinstance(policy_tree.feature, str)
            assert hasattr(policy_tree, 'threshold')
            _check_policy_tree(policy_tree.left,
                               is_serialized=is_serialized)
            _check_policy_tree(policy_tree.right,
                               is_serialized=is_serialized)
    else:
        assert isinstance(policy_tree, dict)
        if policy_tree['leaf']:
            assert 'treatment' in policy_tree
            assert 'n_samples' in policy_tree
        else:
            assert isinstance(policy_tree['feature'], str)
            assert isinstance(policy_tree['threshold'], float)
            _check_policy_tree(policy_tree['left'],
                               is_serialized=is_serialized)
            _check_policy_tree(policy_tree['right'],
                               is_serialized=is_serialized)
