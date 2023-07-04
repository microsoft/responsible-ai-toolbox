# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Manager for causal analysis."""
from pathlib import Path
from typing import Any, List, Optional, Union

import numpy as np
import pandas as pd
from econml.solutions.causal_analysis import CausalAnalysis

from raiutils.exceptions import UserConfigValidationException
from raiutils.models import ModelTask
from responsibleai._data_validations import validate_train_test_categories
from responsibleai._internal.constants import (CausalManagerKeys,
                                               ListProperties, ManagerNames)
from responsibleai._tools.causal.causal_config import CausalConfig
from responsibleai._tools.causal.causal_constants import (DefaultParams,
                                                          ModelTypes)
from responsibleai._tools.causal.causal_result import CausalResult
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager
from responsibleai.feature_metadata import FeatureMetadata
from responsibleai.managers.base_manager import BaseManager
from responsibleai.utils import _measure_time


class CausalManager(BaseManager):
    """Manager for generating causal analyses from a dataset."""

    def __init__(
        self,
        train: pd.DataFrame,
        test: pd.DataFrame,
        target_column: str,
        task_type: str,
        categorical_features: Optional[List[str]],
        feature_metadata: Optional[FeatureMetadata] = None
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
        :param feature_metadata: Feature metadata for the train/test
                                 dataset to identify different kinds
                                 of features in the dataset.
        :type feature_metadata: FeatureMetadata
        """
        self._train = train
        self._test = test
        self._target_column = target_column
        self._task_type = task_type

        self._categorical_features = categorical_features
        if categorical_features is None:
            self._categorical_features = []
        self._feature_metadata = feature_metadata

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
        """
        if not isinstance(treatment_features, list):
            raise UserConfigValidationException(
                "Expecting a list for treatment_features but got {0}".format(
                    type(treatment_features)))
        if len(treatment_features) == 0:
            raise UserConfigValidationException(
                "Please specify at least one feature in "
                "treatment_features list")
        for feature in treatment_features:
            if self._feature_metadata and \
                    self._feature_metadata.dropped_features and \
                    feature in set(self._feature_metadata.dropped_features):
                message = ("'{}' in treatment_features has been dropped "
                           "during training the model").format(feature)
                raise UserConfigValidationException(message)
        difference_set = set(treatment_features) - set(self._train.columns)
        if len(difference_set) > 0:
            message = ("Feature names in treatment_features do "
                       f"not exist in train data: {list(difference_set)}")
            raise UserConfigValidationException(message)

        if heterogeneity_features is not None:
            difference_set = \
                set(heterogeneity_features) - set(self._train.columns)
            if len(difference_set) > 0:
                message = ("Feature names in heterogeneity_features do "
                           f"not exist in train data: {list(difference_set)}")
                raise UserConfigValidationException(message)

        if self._task_type == ModelTask.CLASSIFICATION:
            is_multiclass = len(np.unique(
                self._train[self._target_column].values).tolist()) > 2
            if is_multiclass:
                raise UserConfigValidationException(
                    "Multiclass classification isn't supported")

        if nuisance_model not in [ModelTypes.AUTOML,
                                  ModelTypes.LINEAR]:
            message = (f"nuisance_model should be one of "
                       f"['{ModelTypes.AUTOML}', "
                       f"'{ModelTypes.LINEAR}'], "
                       f"got {nuisance_model}")
            raise UserConfigValidationException(message)

        if heterogeneity_model not in [ModelTypes.FOREST,
                                       ModelTypes.LINEAR]:
            message = (f"heterogeneity_model should be one of "
                       f"['{ModelTypes.FOREST}', "
                       f"'{ModelTypes.LINEAR}'], "
                       f"got {heterogeneity_model}")
            raise UserConfigValidationException(message)

        validate_train_test_categories(
            train_data=self._train,
            test_data=self._test,
            rai_compute_type='Causal analysis',
            categoricals=self._categorical_features)

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
                " Increase the value {} in rai_insights.causal.add("
                "upper_bound_on_cat_expansion={})."
            ).format(max_cat_expansion, max_cat_expansion)
            if expected in message:
                raise ValueError(message + clarification)
            raise e

    def _create_policy(
        self,
        causal_result,
        X_test,
        treatment_feature,
        treatment_cost,
        alpha,
        max_tree_depth,
        min_tree_leaf_samples,
    ):
        return causal_result._create_policy(
            X_test=X_test,
            treatment_feature=treatment_feature,
            treatment_cost=treatment_cost,
            alpha=alpha,
            max_tree_depth=max_tree_depth,
            min_tree_leaf_samples=min_tree_leaf_samples,
        )

    def _whatif(self, id, X, X_feature_new, feature_name, y, alpha=0.1):
        """Get what-if data."""
        filtered = [r for r in self.get() if r.id == id]
        if len(filtered) == 0:
            raise ValueError(f"Failed to find causal result with ID: {id}")
        result = filtered[0]
        return result._whatif(X, X_feature_new, feature_name,
                              y, alpha=alpha).to_dict(orient="records")

    def request_global_cohort_effects(self, id, X_test):
        """Get global causal effects for cohort data.

        :param id: The query id for finding the
                   causal config.
        :type id: str
        :param X_test: The data for which the global causal effects
                       needs to be generated.
        :type X_test: Any
        :return: An object of type CausalData with
                 causal effects.
        :rtype: CausalData

        """
        filtered = [r for r in self.get() if r.id == id]
        if len(filtered) == 0:
            raise ValueError(f"Failed to find causal result with ID: {id}")
        result = filtered[0]
        return result._global_cohort_effects(X_test)

    def request_local_instance_effects(self, id, X_test):
        """Get local causal effects for a given data point.

        :param id: The query id for finding the
                   causal config.
        :type id: str
        :param X_test: The data for which the local causal effects
                       needs to be generated for a given point.
        :type X_test: Any
        :return: An object of type CausalData with
                 causal effects for a given point.
        :rtype: CausalData
        """
        filtered = [r for r in self.get() if r.id == id]

        if len(filtered) == 0:
            raise ValueError(f"Failed to find causal result with ID: {id}")

        if not isinstance(X_test, pd.DataFrame):
            raise UserConfigValidationException(
                'Data is of type {0} but it must be '
                'a pandas DataFrame.'.format(type(X_test)))

        if X_test.shape[0] > 1:
            raise UserConfigValidationException(
                'Only one row of data is allowed for '
                'local causal effects.')

        result = filtered[0]
        return result._local_instance_effects(X_test)

    def request_global_cohort_policy(self, id, X_test):
        """Get global causal policy for cohort data.

        :param id: The query id for finding the
                   causal config.
        :type id: str
        :param X_test: The data for which the causal policy
                       needs to be generated.
        :type X_test: Any
        :return: An object of type CausalData with
                 causal effects.
        :rtype: CausalData
        """
        filtered = [r for r in self.get() if r.id == id]
        if len(filtered) == 0:
            raise ValueError(f"Failed to find causal result with ID: {id}")
        result = filtered[0]
        return result._global_cohort_policy(X_test)

    @_measure_time
    def compute(self):
        """Computes the causal effects by running the causal
           configuration."""
        print("Causal Effects")
        print('Current Status: Generating Causal Effects.')
        is_classification = self._task_type == ModelTask.CLASSIFICATION
        for result in self._results:
            causal_config = result.config
            if not result.is_computed:
                analysis = CausalAnalysis(
                    causal_config.treatment_features,
                    self._categorical_features,
                    heterogeneity_inds=causal_config.heterogeneity_features,
                    classification=is_classification,
                    nuisance_models=causal_config.nuisance_model,
                    heterogeneity_model=causal_config.heterogeneity_model,
                    upper_bound_on_cat_expansion=causal_config.
                    upper_bound_on_cat_expansion,
                    skip_cat_limit_checks=causal_config.skip_cat_limit_checks,
                    n_jobs=causal_config.n_jobs,
                    categories=causal_config.categories,
                    verbose=causal_config.verbose,
                    random_state=causal_config.random_state,
                )

                X_train = self._train.drop([self._target_column], axis=1)
                X_test = self._test.drop([self._target_column], axis=1)
                y_train = self._train[self._target_column].values.ravel()

                self._fit_causal_analysis(
                    analysis, X_train, y_train,
                    causal_config.upper_bound_on_cat_expansion)
                result.causal_analysis = analysis

                result.global_effects = analysis.global_causal_effect(
                    alpha=causal_config.alpha, keep_all_levels=True)
                result.local_effects = analysis.local_causal_effect(
                    X_test, alpha=causal_config.alpha, keep_all_levels=True)

                result.policies = []

                # Check treatment_cost is valid
                if isinstance(causal_config.treatment_cost, int) and \
                        causal_config.treatment_cost == 0:
                    revised_treatment_cost = [0] * len(
                        causal_config.treatment_features)
                else:
                    revised_treatment_cost = causal_config.treatment_cost

                if not isinstance(revised_treatment_cost, list):
                    message = (
                        "treatment_cost must be a list with "
                        "the same number of elements as "
                        "treatment_features where each element "
                        "is either a constant cost of treatment "
                        "or an array specifying the cost of "
                        "treatment per sample. "
                        "Found treatment_cost of type "
                        f"{type(revised_treatment_cost)}, expected list.")
                    raise UserConfigValidationException(message)
                elif len(revised_treatment_cost) != \
                        len(causal_config.treatment_features):
                    message = ("treatment_cost must be a list with "
                               "the same number of elements as "
                               "treatment_features. "
                               "Length of treatment_cost was "
                               f"{len(revised_treatment_cost)}, expected "
                               f"{len(causal_config.treatment_features)}.")
                    raise UserConfigValidationException(message)

                for i in range(len(causal_config.treatment_features)):
                    policy = self._create_policy(
                        result, X_test,
                        causal_config.treatment_features[i],
                        revised_treatment_cost[i],
                        causal_config.alpha, causal_config.max_tree_depth,
                        causal_config.min_tree_leaf_samples)
                    result.policies.append(policy)

                result._validate_schema()
        print('Current Status: Finished generating causal effects.')

    def get(self):
        """Get the computed causal insights."""
        return self._results

    def list(self):
        """List information about the CausalManager.

        :return: A dictionary of properties.
        :rtype: dict
        """
        props = {ListProperties.MANAGER_TYPE: self.name}
        causal_props_list = []
        for result in self._results:
            causal_config_dict = result.config.get_config_as_dict()
            causal_config_dict[CausalManagerKeys.GLOBAL_EFFECTS_COMPUTED] = \
                True if result.global_effects is not None else False
            causal_config_dict[CausalManagerKeys.LOCAL_EFFECTS_COMPUTED] = \
                True if result.local_effects is not None else False
            causal_config_dict[CausalManagerKeys.POLICIES_COMPUTED] = \
                True if result.policies is not None else False
            causal_props_list.append(causal_config_dict)
        props[CausalManagerKeys.CAUSAL_EFFECTS] = causal_props_list

        return props

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
        inst.__dict__['_feature_metadata'] = rai_insights._feature_metadata

        return inst
