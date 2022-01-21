# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd

from erroranalysis._internal.constants import (METHOD, METHOD_EXCLUDES,
                                               METHOD_INCLUDES, PRED_Y,
                                               ROW_INDEX, TRUE_Y, ModelTask)
from erroranalysis._internal.metrics import get_ordered_classes

COLUMN = 'column'
METHOD_EQUAL = 'equal'
METHOD_GREATER = 'greater'
METHOD_LESS = 'less'
METHOD_LESS_AND_EQUAL = 'less and equal'
METHOD_GREATER_AND_EQUAL = 'greater and equal'
METHOD_RANGE = 'in the range of'
MODEL = 'model'
CLASSIFICATION_OUTCOME = 'Classification outcome'


def filter_from_cohort(analyzer, filters, composite_filters):
    """Filters the dataset on the analyzer based on the specified filters.

    :param analyzer: The error analyzer.
    :type: BaseAnalyzer
    :param filters: The filters.
    :type filters: list[dict]
    :param composite_filters: The composite filters.
    :type composite_filters: list[dict]
    :return: The filtered dataset converted to a pandas DataFrame.
    :rtype: pandas.DataFrame
    """
    df = analyzer.dataset
    feature_names = analyzer.feature_names
    true_y = analyzer.true_y
    categorical_features = analyzer.categorical_features
    categories = analyzer.categories
    if not isinstance(df, pd.DataFrame):
        df = pd.DataFrame(df, columns=feature_names)
    else:
        # Note: we make a non-deep copy of the input dataframe since
        # we will add columns below
        df = df.copy()
    add_filter_cols(analyzer, df, filters, true_y)
    df = apply_recursive_filter(df, filters, categorical_features, categories)
    df = apply_recursive_filter(df, composite_filters,
                                categorical_features, categories)
    df = post_process_df(df)
    return df


def filters_has_classification_outcome(analyzer, filters):
    """Checks if classification outcome is specified as a filter.

    :param analyzer: The error analyzer.
    :type: BaseAnalyzer
    :param filters: The filters.
    :type filters: list[dict]
    :return: True if classification outcome is specified in the filters.
    :rtype: bool
    """
    model_task = analyzer.model_task
    # For classification task, check if classification
    # outcome included in filters, and if it is then
    # compute the necessary column data on the fly
    if model_task == ModelTask.CLASSIFICATION and filters:
        for filter in filters:
            if COLUMN in filter:
                column = filter[COLUMN]
                if column == CLASSIFICATION_OUTCOME:
                    return True
    return False


def add_filter_cols(analyzer, df, filters, true_y):
    """Adds special columns to the dataset for filtering and postprocessing.

    :param analyzer: The error analyzer.
    :type: BaseAnalyzer
    :param filters: The filters.
    :type filters: list[dict]
    :param true_y: The true labels.
    :type true_y: list
    """
    has_classification_outcome = filters_has_classification_outcome(analyzer,
                                                                    filters)
    df[TRUE_Y] = true_y
    is_model_analyzer = hasattr(analyzer, MODEL)
    if not is_model_analyzer:
        df[PRED_Y] = analyzer.pred_y
    df[ROW_INDEX] = np.arange(0, len(true_y))
    if has_classification_outcome:
        if PRED_Y in df:
            pred_y = df[PRED_Y]
        else:
            # calculate directly via prediction on model
            pred_y = analyzer.model.predict(df.drop(columns=[TRUE_Y,
                                                             ROW_INDEX]))
        classes = get_ordered_classes(analyzer.classes, true_y, pred_y)
        # calculate classification outcome and add to df
        classification_outcome = []
        if not isinstance(pred_y, np.ndarray):
            pred_y = np.array(pred_y)
        if not isinstance(true_y, np.ndarray):
            true_y = np.array(true_y)
        for i in range(len(true_y)):
            if true_y[i] == pred_y[i]:
                if true_y[i] == classes[0]:
                    # True negative == 0
                    classification_outcome.append(3)
                else:
                    # True positive == 3
                    classification_outcome.append(3)
            else:
                if true_y[i] == classes[0]:
                    # False negative == 2
                    classification_outcome.append(2)
                else:
                    # False positive == 1
                    classification_outcome.append(1)
        df[CLASSIFICATION_OUTCOME] = classification_outcome


def post_process_df(df):
    """Removes any special columns from dataset added prior to filtering.

    :param df: The filtered dataset, converted to a pandas DataFrame.
    :type: pandas.DataFrame
    :return: The post-processed pandas DataFrame, with special columns removed.
    :rtype: pandas.DataFrame
    """
    if CLASSIFICATION_OUTCOME in list(df.columns):
        df = df.drop(columns=CLASSIFICATION_OUTCOME)
    return df


def apply_recursive_filter(df, filters, categorical_features, categories):
    """Applies the specified filters or composite_filters recursively.

    :param df: The dataset to apply the filters to.
    :type: pandas.DataFrame
    :param filters: The filters or composite_filters to apply to the dataset.
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
        return df.query(build_query(filters, categorical_features, categories))
    else:
        return df


def build_query(filters, categorical_features, categories):
    """Builds a pandas query from the specified filters.

    :param filters: The filters or composite_filters to apply to the dataset.
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
            arg0 = str(filter['arg'][0])
            colname = filter[COLUMN]
            if method == METHOD_GREATER:
                queries.append("`" + colname + "` > " + arg0)
            elif method == METHOD_LESS:
                queries.append("`" + colname + "` < " + arg0)
            elif method == METHOD_LESS_AND_EQUAL:
                queries.append("`" + colname + "` <= " + arg0)
            elif method == METHOD_GREATER_AND_EQUAL:
                queries.append("`" + colname + "` >= " + arg0)
            elif method == METHOD_RANGE:
                arg1 = str(filter['arg'][1])
                queries.append("`" + colname + "` >= " + arg0 +
                               ' & `' + colname + "` <= " + arg1)
            elif method == METHOD_INCLUDES or method == METHOD_EXCLUDES:
                query = build_bounds_query(filter, colname, method,
                                           categorical_features,
                                           categories)
                queries.append(query)
            elif method == METHOD_EQUAL:
                is_categorical = False
                if categorical_features:
                    is_categorical = colname in categorical_features
                if is_categorical:
                    cat_idx = categorical_features.index(colname)
                    arg0i = filter['arg'][0]
                    arg_cat = categories[cat_idx][arg0i]
                    if isinstance(arg_cat, str):
                        queries.append("`{}` == '{}'".format(colname, arg_cat))
                    else:
                        queries.append("`{}` == {}".format(colname, arg_cat))
                else:
                    queries.append("`" + colname + "` == " + arg0)
            else:
                raise ValueError(
                    "Unsupported method type: {}".format(method))
        else:
            cqueries = []
            for composite_filter in filter['compositeFilters']:
                cqueries.append(build_query([composite_filter],
                                            categorical_features,
                                            categories))
            if filter['operation'] == 'and':
                queries.append('(' + ') & ('.join(cqueries) + ')')
            else:
                queries.append('(' + ') | ('.join(cqueries) + ')')
    return '(' + ') & ('.join(queries) + ')'


def build_bounds_query(filter, colname, method,
                       categorical_features, categories):
    """Builds a pandas query for the given include or exclude bounds filter.

    :param filter: The categorical filter or composite_filter to apply to
        the dataset.
    :type filter: list[dict]
    :param colname: The column name to filter on.
    :type colname: str
    :param method: The method type, in this method one of include or exclude.
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
    if method == METHOD_EXCLUDES:
        operator = " != "
    else:
        operator = " == "
    is_categorical = False
    if categorical_features:
        is_categorical = colname in categorical_features
    for arg in filter['arg']:
        if is_categorical:
            cat_idx = categorical_features.index(colname)
            if isinstance(categories[cat_idx][arg], str):
                arg_val = "'{}'".format(str(categories[cat_idx][arg]))
            else:
                arg_val = "{}".format(str(categories[cat_idx][arg]))
        else:
            arg_val = arg
        bounds.append("`{}`{}{}".format(colname, operator, arg_val))
    if method == METHOD_EXCLUDES:
        return ' & '.join(bounds)
    else:
        return ' | '.join(bounds)
