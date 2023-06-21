# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json
import re

import pytest

from raiutils.cohort import Cohort, CohortFilter, CohortFilterMethods
from raiutils.data_processing import serialize_json_safe
from raiutils.exceptions import UserConfigValidationException
from raiwidgets import ResponsibleAIDashboard
from raiwidgets.dashboard import invalid_feature_flights_error
from responsibleai._interfaces import (CausalData, CounterfactualData, Dataset,
                                       ErrorAnalysisData, ModelExplanationData)


@pytest.mark.parametrize("with_model", [True, False])
class TestResponsibleAIDashboard:

    def validate_rai_dashboard_data(self, rai_widget, with_model=True):
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
        if with_model:
            assert isinstance(
                rai_widget.input.dashboard_input.counterfactualData[0],
                CounterfactualData)

        if len(rai_widget.input.dashboard_input.cohortData) != 0:
            assert isinstance(rai_widget.input.dashboard_input.cohortData[0],
                              Cohort)

        # Make sure the dashboard input can be serialized
        json.dumps(rai_widget.input.dashboard_input,
                   default=serialize_json_safe)

    def validate_widget_end_points(self, widget):
        end_point_list = [
            'predict',
            'tree',
            'matrix',
            'causal_whatif',
            'global_causal_effects',
            'global_causal_policy',
            'importances']
        widget_end_point_list = list(
            widget._service.app.view_functions.keys())

        for end_point in end_point_list:
            end_point_found = False
            for widget_end_point in widget_end_point_list:
                if re.search(end_point, widget_end_point):
                    end_point_found = True
                    break
            assert end_point_found

    def test_responsibleai_adult_save_and_load(
            self, tmpdir,
            create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
        widget = ResponsibleAIDashboard(ri)
        self.validate_rai_dashboard_data(widget, with_model=with_model)
        self.validate_widget_end_points(widget)

        save_dir = tmpdir.mkdir('save-dir')
        ri.save(save_dir)
        ri_copy = ri.load(save_dir)

        widget_copy = ResponsibleAIDashboard(ri_copy)
        self.validate_rai_dashboard_data(widget_copy, with_model=with_model)
        self.validate_widget_end_points(widget_copy)

    def test_responsibleai_housing_save_and_load(
            self, tmpdir,
            create_rai_insights_object_regression_with_model,
            create_rai_insights_object_regression_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_regression_with_model
        else:
            ri = create_rai_insights_object_regression_with_predictions

        widget = ResponsibleAIDashboard(ri)
        self.validate_rai_dashboard_data(widget, with_model=with_model)
        self.validate_widget_end_points(widget)

        save_dir = tmpdir.mkdir('save-dir')
        ri.save(save_dir)
        ri_copy = ri.load(save_dir)

        # There seems to be a bug when loading the model wrapper in
        # regression case.
        if with_model:
            widget_copy = ResponsibleAIDashboard(ri_copy)
            self.validate_rai_dashboard_data(
                widget_copy, with_model=with_model)
            self.validate_widget_end_points(widget_copy)

    def test_responsibleai_housing_with_pre_defined_cohorts(
            self,
            create_rai_insights_object_regression_with_model,
            create_rai_insights_object_regression_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_regression_with_model
        else:
            ri = create_rai_insights_object_regression_with_predictions

        cohort_filter_continuous_1 = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[30.5],
            column='HouseAge')
        cohort_filter_continuous_2 = CohortFilter(
            method=CohortFilterMethods.METHOD_GREATER,
            arg=[3.0],
            column='AveRooms')

        user_cohort_continuous = Cohort(name='Cohort Continuous')
        user_cohort_continuous.add_cohort_filter(cohort_filter_continuous_1)
        user_cohort_continuous.add_cohort_filter(cohort_filter_continuous_2)

        cohort_filter_index = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[20],
            column='Index')

        user_cohort_index = Cohort(name='Cohort Index')
        user_cohort_index.add_cohort_filter(cohort_filter_index)

        cohort_filter_predicted_y = CohortFilter(
            method=CohortFilterMethods.METHOD_LESS,
            arg=[5.0],
            column='Predicted Y')

        user_cohort_predicted_y = Cohort(name='Cohort Predicted Y')
        user_cohort_predicted_y.add_cohort_filter(cohort_filter_predicted_y)

        cohort_filter_true_y = CohortFilter(
            method=CohortFilterMethods.METHOD_GREATER,
            arg=[1.0],
            column='True Y')

        user_cohort_true_y = Cohort(name='Cohort True Y')
        user_cohort_true_y.add_cohort_filter(cohort_filter_true_y)

        widget = ResponsibleAIDashboard(
            ri,
            cohort_list=[user_cohort_continuous,
                         user_cohort_index,
                         user_cohort_predicted_y,
                         user_cohort_true_y])

        self.validate_rai_dashboard_data(widget, with_model=with_model)
        self.validate_widget_end_points(widget)

    def test_responsibleai_adult_with_pre_defined_cohorts(
            self,
            create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions

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

        self.validate_rai_dashboard_data(widget, with_model=with_model)
        self.validate_widget_end_points(widget)

    def test_responsibleai_adult_with_ill_defined_cohorts(
            self,
            create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
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
            self,
            create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
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

    @pytest.mark.parametrize("flights", [["f"], ["f1", "f2"]])
    def test_responsibleai_feature_flights_invalid_flights_list(
            self,
            create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model,
            flights):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
        with pytest.raises(
                ValueError,
                match=re.escape(invalid_feature_flights_error)):
            ResponsibleAIDashboard(ri, feature_flights=flights)

    @pytest.mark.parametrize("flights",
                             ["f", "aMuchLongerFlightName", "f1&f2"])
    def test_responsibleai_feature_flights_valid_flights(
            self,
            create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model,
            flights):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
        widget = ResponsibleAIDashboard(ri, feature_flights=flights)
        self.validate_rai_dashboard_data(widget, with_model=with_model)
        self.validate_widget_end_points(widget)
