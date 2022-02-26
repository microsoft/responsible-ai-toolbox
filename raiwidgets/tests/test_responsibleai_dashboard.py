# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

import pytest

from raiwidgets import ResponsibleAIDashboard
from raiwidgets._cohort import Cohort, CohortFilter, CohortFilterMethods
from responsibleai._interfaces import (CausalData, CounterfactualData, Dataset,
                                       ErrorAnalysisData, ModelExplanationData)
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.serialization_utilities import serialize_json_safe


class TestResponsibleAIDashboard:

    def validate_rai_dashboard_data(self, rai_widget):
        assert isinstance(
            rai_widget.input.dashboard_input.dataset,
            Dataset)
        assert isinstance(
            rai_widget.input.dashboard_input.modelExplanationData[0],
            ModelExplanationData)
        assert isinstance(
            rai_widget.input.dashboard_input.errorAnalysisData[0],
            ErrorAnalysisData)
        assert isinstance(
            rai_widget.input.dashboard_input.causalAnalysisData[0],
            CausalData)
        assert isinstance(
            rai_widget.input.dashboard_input.counterfactualData[0],
            CounterfactualData)

        if len(rai_widget.input.dashboard_input.cohortData) != 0:
            assert isinstance(rai_widget.input.dashboard_input.cohortData[0],
                              Cohort)

        # Make sure the dashboard input can be serialized
        json.dumps(rai_widget.input.dashboard_input,
                   default=serialize_json_safe)

    def test_responsibleai_adult(self, tmpdir, create_rai_insights_object):
        ri = create_rai_insights_object

        widget = ResponsibleAIDashboard(ri)
        self.validate_rai_dashboard_data(widget)

        save_dir = tmpdir.mkdir('save-dir')
        ri.save(save_dir)
        ri_copy = ri.load(save_dir)

        widget_copy = ResponsibleAIDashboard(ri_copy)
        self.validate_rai_dashboard_data(widget_copy)

    def test_responsibleai_adult_with_pre_defined_cohorts(
            self, create_rai_insights_object):
        ri = create_rai_insights_object

        cohort_filter_continuous_1 = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[65],
            column='Age')
        cohort_filter_continuous_2 = CohortFilter(
            method=CohortFilterMethods.METHOD_GREATER,
            arg=[40],
            column='Hours per week')

        user_cohort_continuous = Cohort(name='Cohort Continuous')
        user_cohort_continuous.add_cohort_filter(cohort_filter_continuous_1)
        user_cohort_continuous.add_cohort_filter(cohort_filter_continuous_2)

        cohort_filter_categorical = CohortFilter(
            method=CohortFilterMethods.METHOD_INCLUDES,
            arg=[2, 6, 4],
            column='Marital Status')

        user_cohort_categorical = Cohort(name='Cohort Categorical')
        user_cohort_categorical.add_cohort_filter(cohort_filter_categorical)

        cohort_filter_index = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[20],
            column='Index')

        user_cohort_index = Cohort(name='Cohort Index')
        user_cohort_index.add_cohort_filter(cohort_filter_index)

        widget = ResponsibleAIDashboard(
            ri,
            cohort_list=[user_cohort_continuous,
                         user_cohort_categorical,
                         user_cohort_index])

        self.validate_rai_dashboard_data(widget)

    def test_responsibleai_adult_with_ill_defined_cohorts(
            self, create_rai_insights_object):
        ri = create_rai_insights_object

        cohort_filter_continuous_1 = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[65],
            column='Age')
        cohort_filter_continuous_2 = CohortFilter(
            method=CohortFilterMethods.METHOD_GREATER,
            arg=[40],
            column='Hours per week')

        user_cohort_continuous = Cohort(name='Cohort Continuous')
        user_cohort_continuous.add_cohort_filter(cohort_filter_continuous_1)
        user_cohort_continuous.add_cohort_filter(cohort_filter_continuous_2)

        with pytest.raises(
                UserConfigValidationException,
                match="cohort_list parameter should be a list."):
            ResponsibleAIDashboard(ri, cohort_list={})

        with pytest.raises(
                UserConfigValidationException,
                match="All entries in cohort_list should be of type Cohort."):
            ResponsibleAIDashboard(
                ri, cohort_list=[user_cohort_continuous, {}])

    def test_responsibleai_adult_duplicate_cohort_names(
            self, create_rai_insights_object):
        ri = create_rai_insights_object

        cohort_filter_continuous_1 = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[65],
            column='Age')
        cohort_filter_continuous_2 = CohortFilter(
            method=CohortFilterMethods.METHOD_GREATER,
            arg=[40],
            column='Hours per week')

        user_cohort_continuous = Cohort(name='Cohort Continuous')
        user_cohort_continuous.add_cohort_filter(cohort_filter_continuous_1)
        user_cohort_continuous.add_cohort_filter(cohort_filter_continuous_2)

        with pytest.raises(
                UserConfigValidationException,
                match="Found cohorts with duplicate names. "
                      "All pre-defined cohorts need to have distinct names."):
            ResponsibleAIDashboard(ri, cohort_list=[
                user_cohort_continuous, user_cohort_continuous])
