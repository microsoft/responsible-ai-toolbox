# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import numpy as np

from responsibleai._tools.causal.causal_result import CausalResult


class TestCausalResultParseCategorial:
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
