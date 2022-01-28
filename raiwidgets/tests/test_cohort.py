# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from raiwidgets.cohort import CohortFilter, CohortFilterMethods, Cohort

class TestCohortFilter:
    def test_cohort_filter(self):
        cohort_filter_1 = \
            CohortFilter(method=CohortFilterMethods.LessThan,
                        arg=[65], column='age')
