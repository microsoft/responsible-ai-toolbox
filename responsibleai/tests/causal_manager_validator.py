# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from responsibleai.exceptions import (
    DuplicateManagerConfigException,
    UserConfigValidationException)


EFFECTS_ATTRIBUTES = [
    'raw_name',
    'name',
    'cat',
    'type',
    'version',
    'causal_computation_type',
    'confounding_interval',
    'init_args',
    'point',
    'stderr',
    'zstat',
    'ci_lower',
    'ci_upper',
    'p_value',
    'view',
]


def validate_causal(model_analysis, data, target_column):
    # Add the first configuration
    model_analysis.causal.add(nuisance_model='automl')
    model_analysis.causal.compute()
    results = model_analysis.causal.get()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 1
    causal_analysis = results[0]
    _check_causal_analysis(causal_analysis)

    # Add a duplicate configuration
    message = "Duplicate causal configuration detected."
    with pytest.raises(DuplicateManagerConfigException, match=message):
        model_analysis.causal.add(nuisance_model='automl')

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


def _check_causal_analysis(causal_analysis):
    assert 'global_effects' in causal_analysis
    _check_global_effects(causal_analysis['global_effects'])
    assert 'local_effects' in causal_analysis
    _check_local_effects(causal_analysis['local_effects'])
    assert 'policy_tree' in causal_analysis
    _check_policy_tree(causal_analysis['policy_tree'])
    assert 'policy_gains' in causal_analysis
    _check_policy_gains(causal_analysis['policy_gains'])


def _check_global_effects(global_effects):
    print(global_effects.keys())
    assert isinstance(global_effects, dict)
    for attribute in EFFECTS_ATTRIBUTES:
        assert attribute in global_effects


def _check_local_effects(local_effects):
    print(local_effects.keys())
    assert isinstance(local_effects, dict)
    for attribute in EFFECTS_ATTRIBUTES:
        assert attribute in local_effects


def _check_policy_tree(policy_tree):
    assert policy_tree == {}


def _check_policy_gains(policy_gains):
    assert policy_gains == {}
