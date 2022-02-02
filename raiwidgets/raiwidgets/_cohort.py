# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for defining cohorts in raiwidgets package."""

from typing import Any, List

from responsibleai.exceptions import UserConfigValidationException


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


def cohort_filter_json_converter(obj):
    """Helper function to convert CohortFilter object to json.

    :param obj: Object to convert to json.
    :type obj: object
    :return: The converted json.
    :rtype: dict
    """
    if isinstance(obj, CohortFilter):
        return obj.__dict__
    try:
        return obj.to_json()
    except AttributeError:
        return obj.__dict__


class CohortFilter:
    """Defines the cohort filter.

    :param method: Cohort filter method from one of CohortFilterMethods.
    :type method: str
    :param arg: List of values to be used by the cohort filter.
    :type arg: list
    :param column: The column name from the dataset on which the filter
                   will be applied.
    :type column: str
    """
    def __init__(self, method: str, arg: List[Any], column: str):
        """Defines the cohort filter.

        :param method: Cohort filter method from one of CohortFilterMethods.
        :type method: str
        :param arg: List of values to be used by the cohort filter.
        :type arg: list
        :param column: The column name from the dataset on which the filter
                       will be applied.
        :type column: str
        """
        self._validate_cohort_filter_parameters(
            method=method,
            arg=arg,
            column=column)

        self.method = method
        self.arg = arg
        self.column = column

    def _validate_cohort_filter_parameters(
            self, method: str, arg: List[Any], column: str):
        """Validate the input values for the cohort filter.

        :param method: Cohort filter method from one of CohortFilterMethods.
        :type method: str
        :param arg: List of values to be used by the cohort filter.
        :type arg: list
        :param column: The column name from the dataset on which the filter
                       will be applied.
        :type column: str
        """
        if method not in CohortFilterMethods.ALL:
            raise UserConfigValidationException(
                "Got unexpected value {0} for method. "
                "Expected either of {1}.".format(
                    method, " or ".join(CohortFilterMethods.ALL))
            )
        if not isinstance(column, str):
            raise UserConfigValidationException(
                "Got unexpected type {0} for column. "
                "Expected string type.".format(type(column))
            )
        if not isinstance(arg, list):
            raise UserConfigValidationException(
                "Got unexpected type {0} for arg. "
                "Expected list type.".format(type(arg))
            )
        if len(arg) == 0:
            raise UserConfigValidationException(
                "Empty list supplied for arg."
            )

        if method in CohortFilterMethods.SINGLE_VALUE_METHODS:
            if len(arg) != 1:
                raise UserConfigValidationException(
                    "Expected a single value in arg "
                    "for cohort methods {0}.".format(
                        " or ".join(CohortFilterMethods.SINGLE_VALUE_METHODS))
                )
            if not isinstance(arg[0], int) and not isinstance(arg[0], float):
                raise UserConfigValidationException(
                    "Expected int or float type for "
                    "arg with cohort methods {0}.".format(
                        " or ".join(CohortFilterMethods.SINGLE_VALUE_METHODS))
                )

        if method == CohortFilterMethods.METHOD_RANGE:
            if len(arg) != 2:
                raise UserConfigValidationException(
                    "Expected two entries in arg for "
                    "cohort method {0}.".format(
                        CohortFilterMethods.METHOD_RANGE)
                )
            if ((not isinstance(arg[0], int) and
                 not isinstance(arg[0], float)) or
                (not isinstance(arg[1], int) and
                 not isinstance(arg[1], float))):
                raise UserConfigValidationException(
                    "Expected int or float type for arg "
                    "with cohort method {0}.".format(
                        CohortFilterMethods.METHOD_RANGE)
                )


class Cohort:
    """Defines the cohort which will be injected from SDK into the Dashboard.

    :param name: Name of the cohort.
    :type name: str
    """
    def __init__(self, name: str):
        """Defines the cohort which will be injected from SDK into the Dashboard.

        :param name: Name of the cohort.
        :type name: str
        """
        self.name = name
        self.cohort_filter_list = None

    def add_cohort_filter(self, cohort_filter: CohortFilter):
        """Add a cohort filter into the cohort.

        :param cohort_filter: Cohort filter defined by CohortFilter class.
        :type: CohortFilter
        """
        if self.cohort_filter_list is None:
            self.cohort_filter_list = [cohort_filter]
        else:
            self.cohort_filter_list.append(cohort_filter)
