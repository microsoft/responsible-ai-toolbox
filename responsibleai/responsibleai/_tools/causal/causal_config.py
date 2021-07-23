# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Configuration for causal analysis."""


class CausalConfig:
    def __init__(
        self,
        treatment_features,
        heterogeneity_features,
        nuisance_model,
        heterogeneity_model,
        alpha,
        upper_bound_on_cat_expansion,
        treatment_cost,
        min_tree_leaf_samples,
        max_tree_depth,
        skip_cat_limit_checks,
        n_jobs,
        categories,
        verbose,
        random_state,
    ):
        self.treatment_features = treatment_features
        self.heterogeneity_features = heterogeneity_features
        self.nuisance_model = nuisance_model
        self.heterogeneity_model = heterogeneity_model
        self.alpha = alpha
        self.upper_bound_on_cat_expansion = upper_bound_on_cat_expansion
        self.treatment_cost = treatment_cost
        self.min_tree_leaf_samples = min_tree_leaf_samples
        self.max_tree_depth = max_tree_depth
        self.skip_cat_limit_checks = skip_cat_limit_checks
        self.n_jobs = n_jobs
        self.categories = categories
        self.verbose = verbose
        self.random_state = random_state
