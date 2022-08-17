# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from typing import Any, List, Optional

import numpy as np
import pandas as pd

from erroranalysis._internal.constants import (ARG, COLUMN, COMPOSITE_FILTERS,
                                               METHOD, OPERATION, PRED_Y,
                                               ROW_INDEX, TRUE_Y,
                                               CohortFilterMethods,
                                               CohortFilterOps, ModelTask)
from erroranalysis._internal.metrics import get_ordered_classes
from erroranalysis._internal.utils import is_spark

MODEL = 'model'
CLASSIFICATION_OUTCOME = 'Classification outcome'
REGRESSION_ERROR = 'Error'


def filter_from_cohort(analyzer, filters, composite_filters,
                       include_original_columns_only=False):
    """Filters the dataset on the analyzer based on the specified filters.

    :param analyzer: The error analyzer.
    :type: BaseAnalyzer
    :param filters: The filters.
    :type filters: list[dict]
    :param composite_filters: The composite filters.
    :type composite_filters: list[dict]
    :return: The filtered dataset converted to a pandas DataFrame.
    :param include_original_columns_only: Whether to just include
                                          the original data columns.
    :type include_original_columns_only: bool
    :rtype: pandas.DataFrame
    """
    is_model_analyzer = hasattr(analyzer, MODEL)
    model = None
    pred_y = None

    if is_model_analyzer:
        model = analyzer.model
    else:
        pred_y = analyzer.pred_y

    filter_data_with_cohort = FilterDataWithCohortFilters(
        model=model,
        dataset=analyzer.dataset,
        features=analyzer.feature_names,
        categorical_features=analyzer.categorical_features,
        categories=analyzer.categories,
        true_y=analyzer.true_y,
        pred_y=pred_y,
        model_task=analyzer.model_task)

    return filter_data_with_cohort.filter_data_from_cohort(
        filters=filters,
        composite_filters=composite_filters,
        include_original_columns_only=include_original_columns_only)


class FilterDataWithCohortFilters:
    def __init__(self, model: Any, dataset: pd.DataFrame,
                 features: List[str],
                 categorical_features: List[str], categories: List[List[str]],
                 true_y: np.ndarray, pred_y: np.ndarray,
                 model_task: str,
                 classes: Optional[List[str]] = None):
        """Class to filter data with cohort filters.

        :param model: The model to compute RAI insights for.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: Any
        :param dataset: The dataset.
        :type dataset: pandas.DataFrame
        :param features: The features in the dataset.
        :type features: list[str]
        :param categorical_features: The categorical features.
        :type categorical_features: list[str]
        :param categories: The categories.
        :type categories: list[list[str]]
        :param true_y: The true y.
        :type true_y: numpy.ndarray
        :param pred_y: The predicted y.
        :type pred_y: numpy.ndarray
        :param model_task: Either 'classification' or 'regression'.
        :type model_task: str
        :param classes: The list of classes in case of
                        classification problems.
        :type classes: list[str]
        """
        self.model = model
        self.dataset = dataset
        self.features = features
        self.categorical_features = categorical_features
        self.categories = categories
        self.true_y = true_y
        self.pred_y = pred_y
        self.model_task = model_task
        self.classes = classes

    def filter_data_from_cohort(self, filters, composite_filters,
                                include_original_columns_only=False):
        """Filters the dataset on the model based on the specified filters.

        :param filters: The filters.
        :type filters: list[dict]
        :param composite_filters: The composite filters.
        :type composite_filters: list[dict]
        :return: The filtered dataset converted to a pandas DataFrame.
        :param include_original_columns_only: Whether to just include
                                              the original data columns.
        :type include_original_columns_only: bool
        :rtype: pandas.DataFrame
        """
        df = self.dataset
        if not is_spark(df):
            if not isinstance(df, pd.DataFrame):
                df = pd.DataFrame(df, columns=self.features)
            else:
                # Note: we make a non-deep copy of the input DataFrame since
                # we will add columns below
                df = df.copy()
        self._add_filter_cols(df, filters)
        df = self._apply_recursive_filter(
            df, filters, self.categorical_features, self.categories)
        df = self._apply_recursive_filter(
            df, composite_filters, self.categorical_features, self.categories)
        df = self._post_process_df(
            df, include_original_columns_only=include_original_columns_only)
        return df

    def _filters_has_classification_outcome(self, filters):
        """Checks if classification outcome is specified as a filter.

        :param filters: The filters.
        :type filters: list[dict]
        :return: True if classification outcome is specified in the filters.
        :rtype: bool
        """
        model_task = self.model_task
        # For classification task, check if classification
        # outcome is included in filters, and if it is then
        # compute the necessary column data on the fly
        if model_task == ModelTask.CLASSIFICATION and filters:
            for filter in filters:
                if COLUMN in filter:
                    column = filter[COLUMN]
                    if column == CLASSIFICATION_OUTCOME:
                        return True
        return False

    def _filters_has_regression_error(self, filters):
        """Checks if regression error is specified as a filter.

        :param filters: The filters.
        :type filters: list[dict]
        :return: True if regression error filter is specified in
                 the filters.
        :rtype: bool
        """
        model_task = self.model_task
        # For regression task, check if regression error
        # is included in filters, and if it is then
        # compute the necessary column data on the fly
        if model_task == ModelTask.REGRESSION and filters:
            for filter in filters:
                if COLUMN in filter:
                    column = filter[COLUMN]
                    if column == REGRESSION_ERROR:
                        return True
        return False

    def _compute_binary_classification_outcome_data(self, true_y, pred_y,
                                                    classes):
        """Creates the classification outcome data for binary
        classification scenario.

        :param true_y: The true labels.
        :type true_y: list or numpy.ndarray
        :param pred_y: The predicted labels.
        :type pred_y: list or numpy.ndarray
        :param classes: The classes.
        :type classes: list
        :return: The classification outcome data.
        :rtype: list
        """
        classification_outcome = []
        if not isinstance(pred_y, np.ndarray):
            pred_y = np.array(pred_y)

        if not isinstance(true_y, np.ndarray):
            true_y = np.array(true_y)

        for i in range(len(true_y)):
            if true_y[i] == pred_y[i]:
                if true_y[i] == classes[0]:
                    # True positive == 0
                    classification_outcome.append(0)
                else:
                    # True negative == 3
                    classification_outcome.append(3)
            else:
                if true_y[i] == classes[0]:
                    # False negative == 2
                    classification_outcome.append(2)
                else:
                    # False positive == 1
                    classification_outcome.append(1)
        return classification_outcome

    def _compute_multiclass_classification_outcome_data(
            self, true_y, pred_y):
        """Creates the classification outcome data for multiclass
        classification scenario.

        :param true_y: The true labels.
        :type true_y: list or numpy.ndarray
        :param pred_y: The predicted labels.
        :type pred_y: list or numpy.ndarray
        :return: The classification outcome data.
        :rtype: list
        """
        classification_outcome = []
        if not isinstance(pred_y, np.ndarray):
            pred_y = np.array(pred_y)

        if not isinstance(true_y, np.ndarray):
            true_y = np.array(true_y)

        for i in range(len(true_y)):
            if true_y[i] == pred_y[i]:
                # Correct prediction == 0
                classification_outcome.append(0)
            else:
                # Incorrect prediction == 1
                classification_outcome.append(1)

        return classification_outcome

    def _compute_regression_error_data(self, true_y, pred_y):
        """Computes the per instance absolute difference
        between the true and predicted values.

        :param true_y: The true labels.
        :type true_y: list or numpy.ndarray
        :param pred_y: The predicted labels.
        :type pred_y: list or numpy.ndarray
        :return: The regression error data.
        :rtype: list
        """
        regression_error = []
        if not isinstance(pred_y, np.ndarray):
            pred_y = np.array(pred_y)

        if not isinstance(true_y, np.ndarray):
            true_y = np.array(true_y)

        for i in range(len(true_y)):
            regression_error.append(abs(true_y[i] - pred_y[i]))
        return regression_error

    def _add_filter_cols(self, df, filters):
        """Adds special columns to the dataset for filtering and postprocessing.

        :param df: The dataset as a pandas dataframe.
        :type df: pandas.DataFrame
        :param filters: The filters.
        :type filters: list[dict]
        """
        has_classification_outcome = self._filters_has_classification_outcome(
            filters)
        has_regression_error = self._filters_has_regression_error(filters)

        if isinstance(self.true_y, str):
            df.rename(columns={self.true_y: TRUE_Y})
        else:
            df[TRUE_Y] = self.true_y

        if self.model is None:
            df[PRED_Y] = self.pred_y

        if not is_spark(df):
            df[ROW_INDEX] = np.arange(0, len(self.true_y))
        if has_classification_outcome:
            if PRED_Y in df:
                pred_y = df[PRED_Y]
            else:
                # calculate directly via prediction on model
                pred_y = self.model.predict(
                    df.drop(columns=[TRUE_Y, ROW_INDEX]))

            classes = get_ordered_classes(
                self.classes, self.true_y, pred_y)

            # calculate classification outcome and add to df
            if len(classes) == 2:
                df[CLASSIFICATION_OUTCOME] = \
                    self._compute_binary_classification_outcome_data(
                        self.true_y, pred_y, classes)
            else:
                df[CLASSIFICATION_OUTCOME] = \
                    self._compute_multiclass_classification_outcome_data(
                        self.true_y, pred_y)
        elif has_regression_error:
            if PRED_Y in df:
                pred_y = df[PRED_Y]
            else:
                # calculate directly via prediction on model
                pred_y = self.model.predict(
                    df.drop(columns=[TRUE_Y, ROW_INDEX]))
            # calculate regression error and add to df
            df[REGRESSION_ERROR] = self._compute_regression_error_data(
                self.true_y, pred_y)

    def _post_process_df(self, df, include_original_columns_only=False):
        """Removes any special columns from dataset added prior to filtering.

        :param df: The filtered dataset, converted to a pandas DataFrame.
        :type: pandas.DataFrame
        :param include_original_columns_only: Whether to just include
                                              the original data columns.
        :type include_original_columns_only: bool
        :return: The post-processed pandas DataFrame, with special columns
                 removed.
        :rtype: pandas.DataFrame
        """
        if CLASSIFICATION_OUTCOME in list(df.columns):
            df = df.drop(columns=CLASSIFICATION_OUTCOME)
        if REGRESSION_ERROR in list(df.columns):
            df = df.drop(columns=REGRESSION_ERROR)
        if include_original_columns_only:
            if PRED_Y in list(df.columns):
                df = df.drop(columns=PRED_Y)
            if ROW_INDEX in list(df.columns):
                df = df.drop(columns=ROW_INDEX)
            if TRUE_Y in list(df.columns):
                df = df.drop(columns=TRUE_Y)
        return df

    def _apply_recursive_filter(self, df, filters, categorical_features,
                                categories):
        """Applies the specified filters or composite_filters recursively.

        :param df: The dataset to apply the filters to.
        :type: pandas.DataFrame
        :param filters: The filters or composite_filters to apply to the
                        dataset.
        :type filters: list[dict]
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param categories: The list of categorical values for the categorical
            features.
        :type categories: list[list]
        :return: The filtered dataset.
        :rtype: pandas.DataFrame
        """
        if filters:
            return df.query(self._build_query(
                filters, categorical_features, categories))
        else:
            return df

    def _build_query(self, filters, categorical_features, categories):
        """Builds a pandas query from the specified filters.

        :param filters: The filters or composite_filters to apply to the
                        dataset.
        :type filters: list[dict]
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param categories: The list of categorical values for the categorical
            features.
        :type categories: list[list]
        :return: The built pandas query from the specified features.
        :rtype: str
        """
        queries = []
        for filter in filters:
            if METHOD in filter:
                method = filter[METHOD]
                arg0 = str(filter[ARG][0])
                colname = filter[COLUMN]
                if method == CohortFilterMethods.METHOD_GREATER:
                    queries.append("`" + colname + "` > " + arg0)
                elif method == CohortFilterMethods.METHOD_LESS:
                    queries.append("`" + colname + "` < " + arg0)
                elif method == CohortFilterMethods.METHOD_LESS_AND_EQUAL:
                    queries.append("`" + colname + "` <= " + arg0)
                elif method == CohortFilterMethods.METHOD_GREATER_AND_EQUAL:
                    queries.append("`" + colname + "` >= " + arg0)
                elif method == CohortFilterMethods.METHOD_RANGE:
                    arg1 = str(filter[ARG][1])
                    queries.append("`" + colname + "` >= " + arg0 +
                                   ' & `' + colname + "` <= " + arg1)
                elif method == CohortFilterMethods.METHOD_INCLUDES or \
                        method == CohortFilterMethods.METHOD_EXCLUDES:
                    query = self._build_bounds_query(filter, colname, method,
                                                     categorical_features,
                                                     categories)
                    queries.append(query)
                elif method == CohortFilterMethods.METHOD_EQUAL:
                    is_categorical = False
                    if categorical_features:
                        is_categorical = colname in categorical_features
                    if is_categorical:
                        cat_idx = categorical_features.index(colname)
                        arg0i = filter[ARG][0]
                        arg_cat = categories[cat_idx][arg0i]
                        if isinstance(arg_cat, str):
                            queries.append("`{}` == '{}'".format(colname,
                                                                 arg_cat))
                        else:
                            queries.append("`{}` == {}".format(colname,
                                                               arg_cat))
                    else:
                        queries.append("`" + colname + "` == " + arg0)
                else:
                    raise ValueError(
                        "Unsupported method type: {}".format(method))
            else:
                cqueries = []
                for composite_filter in filter[COMPOSITE_FILTERS]:
                    cqueries.append(self._build_query([composite_filter],
                                                      categorical_features,
                                                      categories))
                if filter[OPERATION] == CohortFilterOps.AND:
                    queries.append('(' + ') & ('.join(cqueries) + ')')
                else:
                    queries.append('(' + ') | ('.join(cqueries) + ')')
        return '(' + ') & ('.join(queries) + ')'

    def _build_bounds_query(self, filter, colname, method,
                            categorical_features, categories):
        """Builds a pandas query for the given include or exclude bounds filter.

        :param filter: The categorical filter or composite_filter to apply to
            the dataset.
        :type filter: list[dict]
        :param colname: The column name to filter on.
        :type colname: str
        :param method: The method type, in this method one of include or
                       exclude.
        :type method: str
        :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param categories: The list of categorical values for the categorical
            features.
        :type categories: list[list]
        :return: The built pandas bounds query.
        :rtype: str
        """
        bounds = []
        if method == CohortFilterMethods.METHOD_EXCLUDES:
            operator = " != "
        else:
            operator = " == "
        is_categorical = False
        if categorical_features:
            is_categorical = colname in categorical_features
        for arg in filter[ARG]:
            if is_categorical:
                cat_idx = categorical_features.index(colname)
                if isinstance(categories[cat_idx][arg], str):
                    arg_val = "'{}'".format(str(categories[cat_idx][arg]))
                else:
                    arg_val = "{}".format(str(categories[cat_idx][arg]))
            else:
                arg_val = arg
            bounds.append("`{}`{}{}".format(colname, operator, arg_val))
        if method == CohortFilterMethods.METHOD_EXCLUDES:
            return ' & '.join(bounds)
        else:
            return ' | '.join(bounds)
