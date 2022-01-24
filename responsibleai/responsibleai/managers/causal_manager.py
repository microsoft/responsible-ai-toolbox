# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Manager for causal analysis."""
from pathlib import Path
from typing import Any, List, Optional, Union

import numpy as np
import pandas as pd
from econml.solutions.causal_analysis import CausalAnalysis

from responsibleai._data_validations import validate_train_test_categories
from responsibleai._internal.constants import ManagerNames
from responsibleai._tools.causal.causal_config import CausalConfig
from responsibleai._tools.causal.causal_constants import (DefaultParams,
                                                          ModelTypes,
                                                          ResultAttributes)
from responsibleai._tools.causal.causal_result import CausalResult
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.managers.base_manager import BaseManager
from responsibleai.rai_insights.constants import ModelTask


class CausalManager(BaseManager):
    """Manager for causal analysis."""

    def __init__(
        self,
        train: pd.DataFrame,
        test: pd.DataFrame,
        target_column: str,
        task_type: str,
        categorical_features: Optional[List[str]]
    ):
        """Construct a CausalManager for generating causal analyses
           from a dataset.
        :param train: Dataset on which to compute global causal effects
                     (#samples x #features).
        :type train: pandas.DataFrame
        :param test: Dataset on which to compute local causal effects
                     (#samples x #features).
        :type test: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: Task type is either 'classification/regression'
        :type task_type: str
        :param categorical_features: All categorical feature names.
        :type categorical_features: list
        """
        self._train = train
        self._test = test
        self._target_column = target_column
        self._task_type = task_type

        self._categorical_features = categorical_features
        if categorical_features is None:
            self._categorical_features = []

        self._results = []

    def add(
        self,
        treatment_features: List[str],
        heterogeneity_features: Optional[List[str]] = None,
        nuisance_model: str = ModelTypes.LINEAR,
        heterogeneity_model: str = ModelTypes.LINEAR,
        alpha: float = DefaultParams.DEFAULT_ALPHA,
        upper_bound_on_cat_expansion: int = (
            DefaultParams.DEFAULT_MAX_CAT_EXPANSION),
        treatment_cost: Union[float, List[Union[float, np.ndarray]]] = (
            DefaultParams.DEFAULT_TREATMENT_COST),
        min_tree_leaf_samples: int = (
            DefaultParams.DEFAULT_MIN_TREE_LEAF_SAMPLES),
        max_tree_depth: int = (
            DefaultParams.DEFAULT_MAX_TREE_DEPTH),
        skip_cat_limit_checks: bool = (
            DefaultParams.DEFAULT_SKIP_CAT_LIMIT_CHECKS),
        categories: Union[str, List[Union[str, List[Any]]]] = (
            DefaultParams.DEFAULT_CATEGORIES),
        n_jobs: int = (
            DefaultParams.DEFAULT_N_JOBS),
        verbose: int = (
            DefaultParams.DEFAULT_VERBOSE),
        random_state: Optional[Union[int, np.random.RandomState]] = (
            DefaultParams.DEFAULT_RANDOM_STATE),
    ):
        """Compute causal insights.
        :param treatment_features: Treatment feature names.
        :type treatment_features: list
        :param heterogeneity_features: Features that mediate the causal effect.
        :type heterogeneity_features: list
        :param nuisance_model: This model used to estimate the outcome and the
            treatment features from the other features present in user data.
            It is one of {'linear', 'automl'}, optional (default='linear').
            If 'linear', then LassoCV (for regression) and
            LogisticRegressionCV (for classification) are used.
            If 'automl', then a k-fold cross-validation and model selection
            is performed among several models and the best is chosen.
        :type nuisance_model: str
        :param heterogeneity_model: The heterogeneity model is used to
            estimate the treatment effect based on the heterogeneity features.
            It is one of {'linear', 'forest'} (default='linear').
            'linear' means that a heterogeneity model of the form
            theta(X)=<a, X> will be used, while 'forest' means that a
            forest model will be trained instead.
        :type heterogeneity_model: str
        :param alpha: Confidence level of confidence intervals.
        :type alpha: float
        :param upper_bound_on_cat_expansion: Maximum expansion for
                                             categorical features.
        :type upper_bound_on_cat_expansion: int
        :param treatment_cost: Cost of treatment. If 0, all treatments will
            have zero cost. If a list is passed, then each element will be
            applied to each treatment feature. Each element can be a scalar
            value to indicate a constant cost of applying that treatment or
            an array indicating the cost for each sample. If the treatment
            is a discrete treatment, then the array for that feature should
            be two dimensional with the first dimension representing samples
            and the second representing the difference in cost between the
            non-default values and the default value.
        :type treatment_cost: None, List of float or array
        :param min_tree_leaf_samples: Minimum number of samples per leaf
            in policy tree.
        :type min_tree_leaf_samples: int
        :param max_tree_depth: Maximum depth of policy tree.
        :type max_tree_depth: int
        :param skip_cat_limit_checks:
            By default, categorical features need to have several instances
            of each category in order for a model to be fit robustly.
            Setting this to True will skip these checks.
        :type skip_cat_limit_checks: bool
        :param categories: 'auto' or list of category values, default 'auto'
            What categories to use for the categorical columns.
            If 'auto', then the categories will be inferred for all
            categorical columns. Otherwise, this argument should have
            as many entries as there are categorical columns.
            Each entry should be either 'auto' to infer the values for
            that column or the list of values for the column.
            If explicit values are provided, the first value is treated
            as the "control" value for that column against which other
            values are compared.
        :type categories: str or list
        :param n_jobs: Degree of parallelism to use when training models
            via joblib.Parallel
        :type n_jobs: int
        :param verbose: Controls the verbosity when fitting and predicting.
        :type verbose: int
        :param random_state: Controls the randomness of the estimator.
        :type random_state: int or RandomState or None
        :return: Causal result.
        :rtype: CausalResult
        """
        difference_set = set(treatment_features) - set(self._train.columns)
        if len(difference_set) > 0:
            message = ("Feature names in treatment_features do "
                       f"not exist in train data: {list(difference_set)}")
            raise UserConfigValidationException(message)

        if nuisance_model not in [ModelTypes.AUTOML,
                                  ModelTypes.LINEAR]:
            message = (f"nuisance_model should be one of "
                       f"['{ModelTypes.AUTOML}', "
                       f"'{ModelTypes.LINEAR}'], "
                       f"got {nuisance_model}")
            raise UserConfigValidationException(message)

        X_train = self._train.drop([self._target_column], axis=1)
        X_test = self._test.drop([self._target_column], axis=1)
        y_train = self._train[self._target_column].values.ravel()

        validate_train_test_categories(
            train_data=self._train,
            test_data=self._test,
            rai_compute_type='Causal analysis',
            categoricals=self._categorical_features)

        is_classification = self._task_type == ModelTask.CLASSIFICATION
        analysis = CausalAnalysis(
            treatment_features,
            self._categorical_features,
            heterogeneity_inds=heterogeneity_features,
            classification=is_classification,
            nuisance_models=nuisance_model,
            heterogeneity_model=heterogeneity_model,
            upper_bound_on_cat_expansion=upper_bound_on_cat_expansion,
            skip_cat_limit_checks=skip_cat_limit_checks,
            n_jobs=n_jobs,
            categories=categories,
            verbose=verbose,
            random_state=random_state,
        )
        self._fit_causal_analysis(analysis, X_train, y_train,
                                  upper_bound_on_cat_expansion)

        result = CausalResult()
        result.config = CausalConfig(
            treatment_features=treatment_features,
            heterogeneity_features=heterogeneity_features,
            nuisance_model=nuisance_model,
            heterogeneity_model=heterogeneity_model,
            alpha=alpha,
            upper_bound_on_cat_expansion=upper_bound_on_cat_expansion,
            treatment_cost=treatment_cost,
            min_tree_leaf_samples=min_tree_leaf_samples,
            max_tree_depth=max_tree_depth,
            skip_cat_limit_checks=skip_cat_limit_checks,
            n_jobs=n_jobs,
            categories=categories,
            verbose=verbose,
            random_state=random_state,
            categorical_features=self._categorical_features,
        )

        result.causal_analysis = analysis

        result.global_effects = analysis.global_causal_effect(
            alpha=alpha, keep_all_levels=True)
        result.local_effects = analysis.local_causal_effect(
            X_test, alpha=alpha, keep_all_levels=True)

        result.policies = []

        # Check treatment_cost is valid
        if isinstance(treatment_cost, int) and treatment_cost == 0:
            treatment_cost = [0] * len(treatment_features)

        if not isinstance(treatment_cost, list):
            message = ("treatment_cost must be a list with "
                       "the same number of elements as "
                       "treatment_features where each element "
                       "is either a constant cost of treatment "
                       "or an array specifying the cost of "
                       "treatment per sample. "
                       "Found treatment_cost of type "
                       f"{type(treatment_cost)}, expected list.")
            raise UserConfigValidationException(message)
        elif len(treatment_cost) != len(treatment_features):
            message = ("treatment_cost must be a list with "
                       "the same number of elements as "
                       "treatment_features. "
                       "Length of treatment_cost was "
                       f"{len(treatment_cost)}, expected "
                       f"{len(treatment_features)}.")
            raise UserConfigValidationException(message)

        for i in range(len(treatment_features)):
            policy = self._create_policy(
                analysis, X_test,
                treatment_features[i], treatment_cost[i],
                alpha, max_tree_depth, min_tree_leaf_samples)
            result.policies.append(policy)

        result._validate_schema()
        self._results.append(result)
        return result

    def _fit_causal_analysis(
        self,
        causal_analysis,
        X,
        y,
        max_cat_expansion
    ):
        try:
            causal_analysis.fit(X, y)
        except ValueError as e:
            message = str(e)
            expected = "increase the upper_bound_on_cat_expansion"
            clarification = (
                " Increase the value {} in rai_insights.causal.add("
                "upper_bound_on_cat_expansion={})."
            ).format(max_cat_expansion, max_cat_expansion)
            if expected in message:
                raise ValueError(message + clarification)
            raise e

    def _create_policy(
        self,
        causal_analysis,
        X_test,
        treatment_feature,
        treatment_cost,
        alpha,
        max_tree_depth,
        min_tree_leaf_samples,
    ):
        local_policies = causal_analysis.individualized_policy(
            X_test, treatment_feature,
            treatment_costs=treatment_cost,
            alpha=alpha)

        tree = causal_analysis._policy_tree_output(
            X_test, treatment_feature,
            treatment_costs=treatment_cost,
            max_depth=max_tree_depth,
            min_samples_leaf=min_tree_leaf_samples,
            alpha=alpha)

        return {
            ResultAttributes.TREATMENT_FEATURE: treatment_feature,
            ResultAttributes.CONTROL_TREATMENT: tree.control_name,
            ResultAttributes.LOCAL_POLICIES: local_policies,
            ResultAttributes.POLICY_GAINS: {
                ResultAttributes.RECOMMENDED_POLICY_GAINS:
                    tree.policy_value,
                ResultAttributes.TREATMENT_GAINS: tree.always_treat,
            },
            ResultAttributes.POLICY_TREE: tree.tree_dictionary
        }

    def _whatif(self, id, X, X_feature_new, feature_name, y, alpha=0.1):
        """Get what-if data."""
        filtered = [r for r in self.get() if r.id == id]
        if len(filtered) == 0:
            raise ValueError(f"Failed to find causal result with ID: {id}")
        result = filtered[0]
        return result._whatif(X, X_feature_new, feature_name,
                              y, alpha=alpha).to_dict(orient="records")

    def compute(self):
        """No-op function to comply with model analysis design."""
        pass

    def get(self):
        """Get the computed causal insights."""
        return self._results

    def list(self):
        pass

    def get_data(self):
        """Get causal data
        :return: List of CausalData objects.
        :rtype: List[CausalData]
        """
        return [result._get_dashboard_object() for result in self._results]

    @property
    def name(self):
        """Get the name of the causal manager.
        :return: The name of the causal manager.
        :rtype: str
        """
        return ManagerNames.CAUSAL

    def _save(self, path):
        """Save the CausalManager to the given path.

        :param path: The directory path to save the CausalManager to.
        :type path: str
        """
        causal_dir = Path(path)
        causal_dir.mkdir(parents=True, exist_ok=True)

        # Save results to disk
        for result in self._results:
            directory_manager = DirectoryManager(parent_directory_path=path)
            data_path = directory_manager.create_data_directory()
            result.save(data_path)

    @staticmethod
    def _load(path, rai_insights):
        """Load the CausalManager from the given path.

        :param path: The directory path to load the CausalManager from.
        :type path: str
        :param rai_insights: The loaded parent RAIInsights.
        :type rai_insights: RAIInsights
        :return: The CausalManager manager after loading.
        :rtype: CausalManager
        """
        inst = CausalManager.__new__(CausalManager)

        # Rehydrate results
        all_causal_dirs = DirectoryManager.list_sub_directories(path)
        inst.__dict__['_results'] = []
        for causal_dir in all_causal_dirs:
            dm = DirectoryManager(parent_directory_path=path,
                                  sub_directory_name=causal_dir)
            causal_result = CausalResult.load(dm.get_data_directory())
            inst.__dict__['_results'].append(causal_result)

        # Rehydrate model analysis data
        inst.__dict__['_train'] = rai_insights.train
        inst.__dict__['_test'] = rai_insights.test
        inst.__dict__['_target_column'] = rai_insights.target_column
        inst.__dict__['_task_type'] = rai_insights.task_type
        inst.__dict__['_categorical_features'] = \
            rai_insights.categorical_features

        return inst
