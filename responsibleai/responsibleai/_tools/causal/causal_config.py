# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""Configuration for causal analysis."""
from typing import Any, List, Optional, Union

import numpy as np


class CausalConfig:
    def __init__(
        self,
        treatment_features: List[str],
        heterogeneity_features: Optional[List[str]],
        nuisance_model: str,
        heterogeneity_model: str,
        alpha: float,
        upper_bound_on_cat_expansion: int,
        treatment_cost: Union[float, List[Union[float, np.ndarray]]],
        min_tree_leaf_samples: int,
        max_tree_depth: int,
        skip_cat_limit_checks: bool,
        categories: Union[str, List[Union[str, List[Any]]]],
        n_jobs: int,
        verbose: int,
        random_state: Optional[Union[int, np.random.RandomState]],
        categorical_features: List[str],
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
        self.categorical_features = categorical_features

    def get_config_as_dict(self):
        """Returns the dictionary representation of configuration
        in the CausalConfig.

        The dictionary contains the different parameters required for
        computing the causal effects.

        :return: The dictionary representation of the CausalConfig.
        :rtype: dict
        """
        return self.__dict__
