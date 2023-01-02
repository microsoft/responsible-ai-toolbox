# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for defining constants related to cohorts."""


class CohortFilterMethods:
    """Defines different methods for cohort filters.
    """
    METHOD_GREATER = "greater"  # Strictly greater than a value
    # Greater than or equal to a value
    METHOD_GREATER_AND_EQUAL = "greater and equal"
    METHOD_LESS = "less"  # Strictly lesser than a value
    METHOD_LESS_AND_EQUAL = "less and equal"  # Lesser than or equal to a value
    METHOD_EQUAL = "equal"  # Equal to a value
    METHOD_INCLUDES = "includes"  # Includes a set of values
    METHOD_EXCLUDES = "excludes"  # Excludes a set of values
    METHOD_RANGE = "in the range of"  # In a given range of two values

    # List of all filter methods
    ALL = [METHOD_GREATER,
           METHOD_GREATER_AND_EQUAL,
           METHOD_LESS,
           METHOD_LESS_AND_EQUAL,
           METHOD_EQUAL,
           METHOD_INCLUDES,
           METHOD_EXCLUDES,
           METHOD_RANGE]

    # List of filter methods which expect a single value from the user
    SINGLE_VALUE_METHODS = [METHOD_GREATER_AND_EQUAL,
                            METHOD_GREATER,
                            METHOD_LESS_AND_EQUAL,
                            METHOD_LESS,
                            METHOD_EQUAL]


class ClassificationOutcomes:
    """Defines the possible values for classification outcomes.
    """
    FALSE_NEGATIVE = 'False negative'
    FALSE_POSITIVE = 'False positive'
    TRUE_NEGATIVE = 'True negative'
    TRUE_POSITIVE = 'True positive'

    ALL = [FALSE_NEGATIVE, FALSE_POSITIVE,
           TRUE_NEGATIVE, TRUE_POSITIVE]


class CohortFilterOps:
    """
    Cohort filter operations
    """

    AND = "and"
    OR = "or"


class CohortJsonConst:
    ARG = "arg"
    COLUMN = "column"
    COMPOSITE_FILTERS = "compositeFilters"
    METHOD = "method"
    OPERATION = "operation"

    PRED_Y = "pred_y"
    PREDICTED_Y = "Predicted Y"
    ROW_INDEX = "Index"
    TRUE_Y = "True Y"
    TRUE_Y_2 = "true_y"

    INVALID_TERMS = [PRED_Y, PREDICTED_Y, ROW_INDEX, TRUE_Y, TRUE_Y_2]
