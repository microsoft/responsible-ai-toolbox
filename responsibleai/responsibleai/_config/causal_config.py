# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Configuration for causal analysis."""

import numpy as np

from responsibleai._config.base_config import BaseConfig


class CausalConfig(BaseConfig):
    """Configuration for causal analysis."""

    def __init__(
        self,
        treatment_features,
        heterogeneity_features,
        nuisance_model,
        heterogeneity_model,
        alpha,
        max_cat_expansion,
        treatment_cost,
        min_tree_leaf_samples,
        max_tree_depth,
        skip_cat_limit_checks,
    ):
        super().__init__()
        self.treatment_features = treatment_features
        self.heterogeneity_features = heterogeneity_features
        self.nuisance_model = nuisance_model
        self.heterogeneity_model = heterogeneity_model
        self.alpha = alpha
        self.max_cat_expansion = max_cat_expansion
        self.treatment_cost = treatment_cost
        self.min_tree_leaf_samples = min_tree_leaf_samples
        self.max_tree_depth = max_tree_depth
        self.skip_cat_limit_checks = skip_cat_limit_checks

        # Outputs
        self.causal_analysis = None
        self.global_effects = None
        self.local_effects = None
        self.policies = None

    def __eq__(self, other):
        return all([
            np.array_equal(self.treatment_features,
                           other.treatment_features),
            np.array_equal(self.heterogeneity_features,
                           other.heterogeneity_features),
            self.nuisance_model == other.nuisance_model,
            self.heterogeneity_model == other.heterogeneity_model,
            self.alpha == other.alpha,
            self.max_cat_expansion == other.max_cat_expansion,
            self.treatment_cost == other.treatment_cost,
            self.min_tree_leaf_samples == other.min_tree_leaf_samples,
            self.max_tree_depth == other.max_tree_depth,
            self.skip_cat_limit_checks == other.skip_cat_limit_checks,
        ])

    def __repr__(self):
        return ("CausalConfig("
                f"treatment_features={self.treatment_features}, "
                f"heterogeneity_features={self.heterogeneity_features}, "
                f"nuisance_model={self.nuisance_model}, "
                f"heterogeneity_model={self.heterogeneity_model}, "
                f"alpha={self.alpha}, "
                f"max_cat_expansion={self.max_cat_expansion}, "
                f"treatment_cost={self.treatment_cost}, "
                f"min_tree_leaf_samples={self.min_tree_leaf_samples}, "
                f"max_tree_depth={self.max_tree_depth}, "
                f"skip_cat_limit_checks={self.skip_cat_limit_checks})")

    def to_result(self):
        return {
            'causal_analysis': self.causal_analysis,
            'global_effects': self.global_effects,
            'local_effects': self.local_effects,
            'policies': self.policies,
        }
