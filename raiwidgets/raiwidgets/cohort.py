# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Module for defining cohorts in raiwidgets package."""

from typing import Any, List
import json

from responsibleai.exceptions import UserConfigValidationException


class CohortFilterMethods:
    GreaterThan = "greater"
    GreaterThanEqualTo = "greater and equal"
    LessThan = "less"
    LessThanEqualTo = "less and equal"
    Equal = "equal"
    Includes = "includes"
    Excludes = "excludes"
    InTheRangeOf = "in the range of"

    ALL = [GreaterThan,
           GreaterThanEqualTo,
           LessThan,
           LessThanEqualTo,
           Equal,
           Includes,
           Excludes,
           InTheRangeOf]

    SINGLE_VALUE_METHODS = [GreaterThanEqualTo,
                            GreaterThan,
                            LessThanEqualTo,
                            LessThan,
                            Equal]


class CohortFilter:
    def __init__(self, method: str, arg: List[Any], column: str):
        if method not in CohortFilterMethods.ALL:
            raise UserConfigValidationException(
                "Got unexpected value {0} for method. Expected either of {1}".format(
                    method, "or".join(CohortFilterMethods.ALL))
            )
        if not isinstance(column, str):
            raise UserConfigValidationException(
                "Got unexpected type {0} for column. Expected string type".format(type(column))
            )
        if not isinstance(arg, list):
            raise UserConfigValidationException(
                "Got unexpected type {0} for arg. Expected list type".format(type(arg))
            )
        if len(arg) == 0:
            raise UserConfigValidationException(
                "Empty list supplied for arg"
            )

        if method in CohortFilterMethods.SINGLE_VALUE_METHODS:
            if len(arg) != 1:
                raise UserConfigValidationException(
                    "Expected a single value in arg for cohort methods {0}".format(
                        "or".join(CohortFilterMethods.SINGLE_VALUE_METHODS))
                )
            if not isinstance(arg[0], int) and not isinstance(arg[0], float):
                raise UserConfigValidationException(
                    "Expected int or float type for arg with cohort filters {0}".format(
                        "or".join(CohortFilterMethods.SINGLE_VALUE_METHODS))
                )

        if method == CohortFilterMethods.InTheRangeOf:
            if len(arg) != 2:
                raise UserConfigValidationException(
                    "Expected two arguments for cohort filter {0}".format(
                        CohortFilterMethods.InTheRangeOf)
                )
            if (not isinstance(arg[0], int) and not isinstance(arg[0], float) and
                    not isinstance(arg[1], int) and not isinstance(arg[1], float)):
                raise UserConfigValidationException(
                    "Expected int or float type for arg with cohort filters {0}".format(
                        CohortFilterMethods.InTheRangeOf)
                )

        self.method = method
        self.arg = arg
        self.column = column

    def serialize_cohort_filter(self):
        return json.dumps(
            {
                "method": self.method,
                "arg": self.arg,
                "column": self.column
            }
        )


class Cohort:
    def __init__(self, name: str):
        self.name = name
        self.cohort_filter_list = None

    def add_cohort_filter(self, cohort_filter: CohortFilter):
        if self.cohort_filter_list is None:
            self.cohort_filter_list = [cohort_filter]
        else:
            self.cohort_filter_list.append(cohort_filter)

    def serialize_cohort(self):
        cohort_list_serialized = []
        for cohort_filter in self.cohort_filter_list:
            cohort_list_serialized.append(
                json.loads(cohort_filter.serialize_cohort_filter()))

        return json.dumps(
            {
                "name": self.name,
                "cohort_filter_list": cohort_list_serialized
            }
        )
