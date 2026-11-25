# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import numpy as np
import pytest

from responsibleai._tools.causal.causal_result import CausalResult


class TestCausalResultParseCategorial:
    @pytest.mark.parametrize('feature_name', [
        'a+b',
        'Price (USD)',
        'rate[%]',
        'x*y?',
        'a|b',
        'C++',
        '^start$',
        'back\\slash',
    ])
    def test_regex_metacharacters(self, feature_name):
        policy_tree = {
            "leaf": False,
            "feature": f"{feature_name}_category",
            "threshold": 0.5,
            "left": {"leaf": True, "n_samples": 8, "treatment": "decrease"},
            "right": {"leaf": True, "n_samples": 6, "treatment": "increase"},
        }
        categoricals = np.array([feature_name])
        feature, comparison, value = CausalResult._parse_comparison(
            policy_tree, categoricals)
        assert feature == feature_name
        assert comparison == 'eq'
        assert value == 'category'

    def test_regex_metacharacter_does_not_match(self):
        policy_tree = {
            "leaf": False,
            "feature": "axb_yes",
            "threshold": 0.5,
            "left": {"leaf": True, "n_samples": 8, "treatment": "decrease"},
            "right": {"leaf": True, "n_samples": 6, "treatment": "increase"},
        }
        categoricals = np.array(['a.b'])
        feature, comparison, value = CausalResult._parse_comparison(
            policy_tree, categoricals)
        assert feature == 'axb_yes'
        assert comparison == 'gt'
        assert value == 0.5

    def test_unbalanced_regex_metacharacter(self):
        policy_tree = {
            "leaf": False,
            "feature": "income(_low",
            "threshold": 0.5,
            "left": {"leaf": True, "n_samples": 8, "treatment": "decrease"},
            "right": {"leaf": True, "n_samples": 6, "treatment": "increase"},
        }
        categoricals = np.array(['income('])
        feature, comparison, value = CausalResult._parse_comparison(
            policy_tree, categoricals)
        assert feature == 'income('
        assert comparison == 'eq'
        assert value == 'low'

    def test_non_string_categorical(self):
        policy_tree = {
            "leaf": False,
            "feature": "123_yes",
            "threshold": 0.5,
            "left": {"leaf": True, "n_samples": 8, "treatment": "decrease"},
            "right": {"leaf": True, "n_samples": 6, "treatment": "increase"},
        }
        categoricals = [123]
        feature, comparison, value = CausalResult._parse_comparison(
            policy_tree, categoricals)
        assert feature == '123'
        assert comparison == 'eq'
        assert value == 'yes'

    def test_basic(self):
        policy_tree = {
            "leaf": False,
            "feature": "Fruit_apple",
            "threshold": 0.5,
            "left": {"leaf": True, "n_samples": 8, "treatment": "decrease"},
            "right": {"leaf": True, "n_samples": 6, "treatment": "increase"},
        }
        categoricals = np.array(['Fruit', 'Vegetable'])
        feature, comparison, value = CausalResult._parse_comparison(
            policy_tree, categoricals)
        assert feature == 'Fruit'
        assert comparison == 'eq'
        assert value == 'apple'

    def test_selection_not_greedy(self):
        policy_tree = {
            "leaf": False,
            "feature": "a_b_0",
            "threshold": 0.5,
            "left": {"leaf": True, "n_samples": 8, "treatment": "decrease"},
            "right": {"leaf": True, "n_samples": 6, "treatment": "increase"},
        }
        categoricals = np.array(['a', 'a_b'])
        feature, comparison, value = CausalResult._parse_comparison(
            policy_tree, categoricals)
        # If greedy we would extract
        # feature="a" and category="b_0", which is wrong
        assert feature == 'a_b'
        assert comparison == 'eq'
        assert value == '0'

    def test_failed_parse(self):
        policy_tree = {
            "leaf": False,
            "feature": "Fruit_apple",
            "threshold": 0.5,
            "left": {"leaf": True, "n_samples": 8, "treatment": "decrease"},
            "right": {"leaf": True, "n_samples": 6, "treatment": "increase"},
        }
        categoricals = np.array(['Vegetable', 'Grain'])
        feature, comparison, value = CausalResult._parse_comparison(
            policy_tree, categoricals)
        assert feature == 'Fruit_apple'
        assert comparison == 'gt'
        assert value == 0.5

    def test_empty_category(self):
        policy_tree = {
            "leaf": False,
            "feature": "Fruit_",
            "threshold": 0.5,
            "left": {"leaf": True, "n_samples": 8, "treatment": "decrease"},
            "right": {"leaf": True, "n_samples": 6, "treatment": "increase"},
        }
        categoricals = np.array(['Fruit'])
        feature, comparison, value = CausalResult._parse_comparison(
            policy_tree, categoricals)
        assert feature == 'Fruit_'
        assert comparison == 'gt'
        assert value == 0.5
