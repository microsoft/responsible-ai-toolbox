# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from raiwidgets import ResponsibleAIDashboard
from raiwidgets._cohort import Cohort, CohortFilter, CohortFilterMethods
from responsibleai._interfaces import (CausalData, CounterfactualData, Dataset,
                                       ErrorAnalysisData, ModelExplanationData)


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

    def test_responsibleai_adult(self, tmpdir, create_rai_insights_object):
        ri = create_rai_insights_object

        widget = ResponsibleAIDashboard(ri)
        self.validate_rai_dashboard_data(widget)

        save_dir = tmpdir.mkdir('save-dir')
        ri.save(save_dir)
        ri_copy = ri.load(save_dir)

        widget_copy = ResponsibleAIDashboard(ri_copy)
        self.validate_rai_dashboard_data(widget_copy)
