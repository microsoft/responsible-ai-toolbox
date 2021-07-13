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
    ):
        self.treatment_features = treatment_features
        self.heterogeneity_features = treatment_features
        self.nuisance_model = treatment_features
        self.heterogeneity_model = treatment_features
        self.alpha = treatment_features
        self.upper_bound_on_cat_expansion = treatment_features
        self.treatment_cost = treatment_features
        self.min_tree_leaf_samples = treatment_features
        self.max_tree_depth = treatment_features
        self.skip_cat_limit_checks = treatment_features
