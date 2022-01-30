# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import pytest

from responsibleai.exceptions import UserConfigValidationException
from raiwidgets.cohort import CohortFilter, CohortFilterMethods, Cohort, \
    cohort_filter_json_converter


class TestCohortFilter:
    def test_cohort_filter_validate_method(self):
        with pytest.raises(
                UserConfigValidationException,
                match="Got unexpected value random for method. "
                      "Expected either of greater or "
                      "greater and equal or "
                      "less or less and equal or "
                      "equal or includes or "
                      "excludes or in the range of."):
            CohortFilter(method="random", arg=[], column="random")

    def test_cohort_filter_validate_column(self):
        with pytest.raises(
                UserConfigValidationException,
                match="Got unexpected type <class 'int'> for column. "
                      "Expected string type."):
            CohortFilter(method=CohortFilterMethods.GreaterThan,
                         arg=[], column=1)

    def test_cohort_filter_serialization(self):
        cohort_filter_1 = \
            CohortFilter(method=CohortFilterMethods.LessThan,
                         arg=[65], column='age')
        json_str = json.dumps(cohort_filter_1,
                              default=cohort_filter_json_converter)
        assert CohortFilterMethods.LessThan in json_str
        assert '[65]' in json_str
        assert 'age' in json_str


class TestCohort:
    def test_cohort_serialization(self):
        cohort_filter_1 = \
            CohortFilter(method=CohortFilterMethods.LessThan,
                         arg=[65], column='age')
        cohort_1 = Cohort(name="Cohort New")
        cohort_1.add_cohort_filter(cohort_filter_1)
        json_str = json.dumps(cohort_1,
                              default=cohort_filter_json_converter)

        assert 'Cohort New' in json_str
        assert CohortFilterMethods.LessThan in json_str
        assert '[65]' in json_str
        assert 'age' in json_str


class TestCohortList:
    def test_cohort_list_serialization(self):
        cohort_filter_1 = \
            CohortFilter(method=CohortFilterMethods.LessThan,
                         arg=[65], column='age')
        cohort_1 = Cohort(name="Cohort New")
        cohort_1.add_cohort_filter(cohort_filter_1)

        cohort_2 = Cohort(name="Cohort Old")
        cohort_2.add_cohort_filter(cohort_filter_1)

        cohort_list = [cohort_1, cohort_2]
        json_str = json.dumps(cohort_list,
                              default=cohort_filter_json_converter)

        assert 'Cohort Old' in json_str
        assert 'Cohort New' in json_str
        assert CohortFilterMethods.LessThan in json_str
        assert '[65]' in json_str
        assert 'age' in json_str

    def test_empty_cohort_list_serialization(self):
        json_str = json.dumps(None, default=cohort_filter_json_converter)
        assert 'null' in json_str
