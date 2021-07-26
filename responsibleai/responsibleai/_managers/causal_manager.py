# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Manager for causal analysis."""
import pandas as pd

from econml.solutions.causal_analysis import CausalAnalysis
from pathlib import Path

from responsibleai._internal.constants import ManagerNames
from responsibleai._managers.base_manager import BaseManager
from responsibleai.exceptions import (
    UserConfigValidationException)
from responsibleai._tools.causal.causal_constants import (
    DefaultParams, ModelTypes, ResultAttributes, SerializationAttributes)
from responsibleai._tools.causal.causal_config import CausalConfig
from responsibleai._tools.causal.causal_result import CausalResult
from responsibleai.modelanalysis.constants import ModelTask


class CausalManager(BaseManager):
    """Manager for causal analysis."""

    def __init__(self, train, test, target_column, task_type,
                 categorical_features):
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
        self._results = []

    def add(
        self,
        treatment_features,
        heterogeneity_features=None,
        nuisance_model=ModelTypes.LINEAR,
        heterogeneity_model=ModelTypes.LINEAR,
        alpha=DefaultParams.DEFAULT_ALPHA,
        upper_bound_on_cat_expansion=DefaultParams.DEFAULT_MAX_CAT_EXPANSION,
        treatment_cost=DefaultParams.DEFAULT_TREATMENT_COST,
        min_tree_leaf_samples=DefaultParams.DEFAULT_MIN_TREE_LEAF_SAMPLES,
        max_tree_depth=DefaultParams.DEFAULT_MAX_TREE_DEPTH,
        skip_cat_limit_checks=DefaultParams.DEFAULT_SKIP_CAT_LIMIT_CHECKS,
        categories=DefaultParams.DEFAULT_CATEGORIES,
        n_jobs=DefaultParams.DEFAULT_N_JOBS,
        verbose=DefaultParams.DEFAULT_VERBOSE,
        random_state=DefaultParams.DEFAULT_RANDOM_STATE,
    ):
        """Compute causal insights.
        :param treatment_features: Treatment feature names.
        :type treatment_features: list
        :param heterogeneity_features: Features that mediate the causal effect.
        :type heterogeneity_features: list
        :param nuisance_model: Model type to use for nuisance estimation.
        :type nuisance_model: str
        :param heterogeneity_model: Model type to use for
                                    treatment effect heterogeneity.
        :type heterogeneity_model: str
        :param alpha: Confidence level of confidence intervals.
        :type alpha: float
        :param upper_bound_on_cat_expansion: Maximum expansion for
                                             categorical features.
        :type upper_bound_on_cat_expansion: int
        :param treatment_cost: Cost to treat one individual or
                               per-individual costs as an array.
        :type treatment_cost: float or array
        :param min_tree_leaf_samples: Minimum number of samples per leaf
                                      in policy tree.
        :type min_tree_leaf_samples: int
        :param max_tree_depth: Maximum depth of policy tree.
        :type max_tree_depth: int
        :param skip_cat_limit_checks: By default, categorical features need
                                      to have several instances of each
                                      category in order for a model to be
                                      fit robustly. Setting this to True
                                      will skip these checks.
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
        """
        if not set(treatment_features).issubset(set(self._train.columns)):
            raise UserConfigValidationException(
                'Found some feature names in treatment feature list which'
                ' do not occur in train data'
            )

        if nuisance_model not in [ModelTypes.AUTOML,
                                  ModelTypes.LINEAR]:
            message = (f"nuisance_model should be one of "
                       f"['{ModelTypes.AUTOML}', "
                       f"'{ModelTypes.LINEAR}'], "
                       f"got {nuisance_model}")
            raise UserConfigValidationException(message)

        # Update X and y to contain both train and test
        # This solves issues with categorical features missing some
        # categories in the test set and causing transformers to fail
        X = pd.concat([self._train, self._test], ignore_index=True)\
            .drop([self._target_column], axis=1)
        y = pd.concat([self._train, self._test], ignore_index=True)[
            self._target_column].values.ravel()

        categoricals = self._categorical_features
        if categoricals is None:
            categoricals = []

        is_classification = self._task_type == ModelTask.CLASSIFICATION
        analysis = CausalAnalysis(
            treatment_features,
            categoricals,
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
        self._fit_causal_analysis(analysis, X, y,
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
        )

        result.causal_analysis = analysis

        X_test = self._test.drop([self._target_column], axis=1)

        result.global_effects = analysis.global_causal_effect(
            alpha=alpha, keep_all_levels=True)
        result.local_effects = analysis.local_causal_effect(
            X_test, alpha=alpha, keep_all_levels=True)

        result.policies = []
        for treatment_feature in treatment_features:
            policy = self._create_policy(
                analysis, X_test,
                treatment_feature, treatment_cost,
                alpha, max_tree_depth, min_tree_leaf_samples)
            result.policies.append(policy)
        self._results.append(result)

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
                " Increase the value {} in model_analysis.causal.add("
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
        results_path = causal_dir / SerializationAttributes.RESULTS
        results_path.mkdir(parents=True, exist_ok=True)
        for result in self._results:
            result_path = results_path / result.id
            result.save(result_path)

    @classmethod
    def _load(cls, path, model_analysis):
        """Load the CausalManager from the given path.

        :param path: The directory path to load the CausalManager from.
        :type path: str
        :param model_analysis: The loaded parent ModelAnalysis.
        :type model_analysis: ModelAnalysis
        """
        this = cls.__new__(cls)
        causal_dir = Path(path)

        # Rehydrate results
        results_path = causal_dir / SerializationAttributes.RESULTS
        paths = results_path.resolve().glob('*')
        this.__dict__['_results'] = [CausalResult.load(p) for p in paths]

        # Rehydrate model analysis data
        this.__dict__['_train'] = model_analysis.train
        this.__dict__['_test'] = model_analysis.test
        this.__dict__['_target_column'] = model_analysis.target_column
        this.__dict__['_task_type'] = model_analysis.task_type
        this.__dict__['_categorical_features'] = \
            model_analysis.categorical_features

        return this
