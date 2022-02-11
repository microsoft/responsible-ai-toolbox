# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Constants for causal analysis."""


class ModelTypes:
    """Model type constants."""
    AUTOML = 'automl'
    LINEAR = 'linear'
    FOREST = 'forest'


class DefaultParams:
    """Default parameter constants."""
    DEFAULT_ALPHA = 0.05
    DEFAULT_MAX_CAT_EXPANSION = 50
    DEFAULT_TREATMENT_COST = 0
    DEFAULT_MIN_TREE_LEAF_SAMPLES = 2
    DEFAULT_MAX_TREE_DEPTH = 2
    DEFAULT_SKIP_CAT_LIMIT_CHECKS = False
    DEFAULT_CATEGORIES = 'auto'
    DEFAULT_N_JOBS = -1
    DEFAULT_VERBOSE = 0
    DEFAULT_RANDOM_STATE = None


class ConfigSettings:
    """Attribute constants for a CausalResult."""

    TREATMENT_FEATURES = 'treatment_features'
    HETEROGENEITY_FEATURES = 'heterogeneity_features'
    NUISANCE_MODEL = 'nuisance_model'
    HETEROGENEITY_MODEL = 'heterogeneity_model'
    ALPHA = 'alpha'
    UPPER_BOUND_ON_CAT_EXPANSION = 'upper_bound_on_cat_expansion'
    TREATMENT_COST = 'treatment_cost'
    MIN_TREE_LEAF_SAMPLES = 'min_tree_leaf_samples'
    MAX_TREE_DEPTH = 'max_tree_depth'
    SKIP_CAT_LIMIT_CHECKS = 'skip_cat_limit_checks'


class ResultAttributes:
    """Attributes constants for a CausalResult."""

    TREATMENT_FEATURE = 'treatment_feature'
    LOCAL_POLICIES = 'local_policies'
    POLICY_TREE = 'policy_tree'
    POLICY_GAINS = 'policy_gains'
    CONTROL_TREATMENT = 'control_treatment'
    RECOMMENDED_POLICY_GAINS = 'recommended_policy_gains'
    TREATMENT_GAINS = 'treatment_gains'
    LEAF = 'leaf'
    N_SAMPLES = 'n_samples'
    TREATMENT = 'treatment'
    FEATURE = 'feature'
    THRESHOLD = 'threshold'
    LEFT = 'left'
    RIGHT = 'right'
