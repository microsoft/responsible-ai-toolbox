# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

import pandas as pd

from responsibleai.exceptions import (
    DuplicateManagerConfigException,
    UserConfigValidationException)

from econml.solutions.causal_analysis._causal_analysis import CausalAnalysis


EFFECTS_ATTRIBUTES = [
    # 'raw_name',
    # 'name',
    # 'cat',
    # 'type',
    # 'version',
    # 'causal_computation_type',
    # 'confounding_interval',
    # 'init_args',
    'point',
    'stderr',
    'zstat',
    'ci_lower',
    'ci_upper',
    'p_value',
    # 'view',
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
    # Add the first configuration
    model_analysis.causal.add(nuisance_model='automl',
                              treatment_features=treatment_features,
                              max_cat_expansion=max_cat_expansion)
    model_analysis.causal.compute()
    results = model_analysis.causal.get()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 1
    causal_results = results[0]
    _check_causal_results(causal_results)

    # Add a duplicate configuration
    message = "Duplicate causal configuration detected."
    with pytest.raises(DuplicateManagerConfigException, match=message):
        model_analysis.causal.add(nuisance_model='automl',
                                  treatment_features=treatment_features,
                                  max_cat_expansion=max_cat_expansion)

    # Add the second configuration
    model_analysis.causal.add(nuisance_model='linear')
    model_analysis.causal.compute()
    results = model_analysis.causal.get()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 2

    # Add a bad configuration
    model_analysis.causal.add(nuisance_model='fake_model')
    with pytest.raises(UserConfigValidationException):
        model_analysis.causal.compute()


def _check_causal_results(causal_results):
    assert isinstance(causal_results, dict)
    assert len(causal_results) == 4

    assert 'causal_analysis' in causal_results
    _check_causal_analysis(causal_results['causal_analysis'])
    assert 'global_effects' in causal_results
    _check_global_effects(causal_results['global_effects'])
    assert 'local_effects' in causal_results
    _check_local_effects(causal_results['local_effects'])
    assert 'policies' in causal_results
    _check_policies(causal_results['policies'])


def _check_causal_analysis(causal_analysis):
    assert isinstance(causal_analysis, CausalAnalysis)


def _check_global_effects(global_effects):
    assert isinstance(global_effects, pd.DataFrame)
    for attribute in EFFECTS_ATTRIBUTES:
        assert attribute in global_effects.columns.to_list()


def _check_local_effects(local_effects):
    assert isinstance(local_effects, pd.DataFrame)
    for attribute in EFFECTS_ATTRIBUTES:
        assert attribute in local_effects.columns.to_list()


def _check_policies(policies):
    assert isinstance(policies, list)
    for policy in policies:
        _check_policy(policy)


def _check_policy(policy):
    assert isinstance(policy, dict)

    assert 'local_policies' in policy
    local_policies = policy['local_policies']
    assert isinstance(local_policies, dict)
    for attribute in LOCAL_POLICY_ATTRIBUTES:
        assert attribute in local_policies

    assert 'policy_tree' in policy
    policy_tree = policy['policy_tree']
    _check_policy_tree(policy_tree)

    assert 'policy_gains' in policy
    policy_gains = policy['policy_gains']
    assert isinstance(policy_gains, dict)

    assert 'recommended_policy_gains' in policy_gains
    recommended_policy_gains = policy_gains['recommended_policy_gains']
    assert isinstance(recommended_policy_gains, float)

    assert 'treatment_gains' in policy_gains
    treatment_gains = policy_gains['treatment_gains']
    assert isinstance(treatment_gains, list)
    assert all(isinstance(v, float) for v in treatment_gains)


def _check_policy_tree(policy_tree):
    assert 'leaf' in policy_tree
    leaf = policy_tree['leaf']

    if leaf:
        assert 'n_samples' in policy_tree
        assert 'treatment' in policy_tree
    else:
        assert 'feature' in policy_tree
        assert isinstance(policy_tree['feature'], str)

        assert 'threshold' in policy_tree
        assert isinstance(policy_tree['threshold'], float)

        assert 'left' in policy_tree
        assert 'right' in policy_tree
        _check_policy_tree(policy_tree['left'])
        _check_policy_tree(policy_tree['right'])
