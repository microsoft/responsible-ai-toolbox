# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
from erroranalysis._internal.constants import (TRUE_Y,
                                               ROW_INDEX,
                                               METHOD,
                                               METHOD_EXCLUDES,
                                               METHOD_INCLUDES)


METHOD_EQUAL = "equal"
METHOD_GREATER = "greater"
METHOD_LESS_AND_EQUAL = "less and equal"
METHOD_RANGE = "in the range of"


def filter_from_cohort(df, filters, composite_filters,
                       feature_names, true_y,
                       categorical_features, categories):
    if not isinstance(df, pd.DataFrame):
        df = pd.DataFrame(df, columns=feature_names)
    df[TRUE_Y] = true_y
    df[ROW_INDEX] = np.arange(0, len(true_y))
    df = apply_recursive_filter(df, filters, categorical_features, categories)
    df = apply_recursive_filter(df, composite_filters,
                                categorical_features, categories)
    return df


def apply_recursive_filter(df, filters, categorical_features, categories):
    if filters:
        return df.query(build_query(filters, categorical_features, categories))
    else:
        return df


def build_query(filters, categorical_features, categories):
    queries = []
    for filter in filters:
        if METHOD in filter:
            method = filter[METHOD]
            arg0 = str(filter['arg'][0])
            colname = filter['column']
            if method == METHOD_GREATER:
                queries.append("`" + colname + "` > " + arg0)
            elif method == METHOD_LESS_AND_EQUAL:
                queries.append("`" + colname + "` <= " + arg0)
            elif method == METHOD_RANGE:
                arg1 = str(filter['arg'][1])
                queries.append("`" + colname + "` >= " + arg0 +
                               ' & `' + colname + "` <= " + arg1)
            elif method == METHOD_INCLUDES or method == METHOD_EXCLUDES:
                query = build_cat_bounds_query(filter, colname, method,
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
                    arg_cat = str(categories[cat_idx][arg0i])
                    queries.append("`{}` == '{}'".format(colname, arg_cat))
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


def build_cat_bounds_query(filter, colname, method,
                           categorical_features, categories):
    bounds = []
    if method == METHOD_EXCLUDES:
        operator = " != "
    else:
        operator = " == "
    for arg in filter['arg']:
        cat_idx = categorical_features.index(colname)
        arg_cat = "'{}'".format(str(categories[cat_idx][arg]))
        bounds.append("`{}`{}{}".format(colname, operator, arg_cat))
    if method == METHOD_EXCLUDES:
        return ' & '.join(bounds)
    else:
        return ' | '.join(bounds)
