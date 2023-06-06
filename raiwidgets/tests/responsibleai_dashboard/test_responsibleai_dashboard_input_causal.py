# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from raiwidgets.responsibleai_dashboard_input import \
    ResponsibleAIDashboardInput

from .common_utils import CheckResponsibleAIDashboardInputTestResult


@pytest.mark.parametrize("with_model", [True, False])
class TestResponsibleAIDashboardInputRegressionCausal(
    CheckResponsibleAIDashboardInputTestResult
):
    def test_rai_dashboard_input_housing_causal_whatif_success(
            self, create_rai_insights_object_regression_with_model,
            create_rai_insights_object_regression_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_regression_with_model
        else:
            ri = create_rai_insights_object_regression_with_predictions
        id = ri.causal.get()[0].id
        causal_whatif_test_data = ri.test.head(1).drop(
            "target", axis=1).to_dict(orient='records')
        treatment_feature = 'AveRooms'
        current_treatment_value = [causal_whatif_test_data[0][
            treatment_feature]]
        current_outcome = [ri.test.head(1)["target"].values[0]]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        post_data = [id, causal_whatif_test_data,
                     treatment_feature, current_treatment_value,
                     current_outcome]
        flask_server_prediction_output = dashboard_input.causal_whatif(
            post_data)

        self.check_success_criteria(flask_server_prediction_output)

    def test_rai_dashboard_input_housing_causal_whatif_failure(
            self, create_rai_insights_object_regression_with_model,
            create_rai_insights_object_regression_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_regression_with_model
        else:
            ri = create_rai_insights_object_regression_with_predictions
        id = "some_id"
        causal_whatif_test_data = ri.test.head(1).drop(
            "target", axis=1).to_dict(orient='records')
        treatment_feature = 'AveRooms'
        current_treatment_value = [causal_whatif_test_data[0][
            treatment_feature]]
        current_outcome = [ri.test.head(1)["target"].values[0]]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        post_data = [id, causal_whatif_test_data,
                     treatment_feature, current_treatment_value,
                     current_outcome]
        flask_server_prediction_output = dashboard_input.causal_whatif(
            post_data)

        self.check_failure_criteria(
            flask_server_prediction_output,
            "Failed to generate causal what-if,")

    @pytest.mark.parametrize('filters', [
        [],
        [{'arg': [30],
          'column': 'HouseAge',
          'method': 'less and equal'}]
    ])
    def test_rai_dashboard_input_housing_causal_global_effects_success(
            self, create_rai_insights_object_regression_with_model,
            create_rai_insights_object_regression_with_predictions,
            with_model, filters):
        if with_model:
            ri = create_rai_insights_object_regression_with_model
        else:
            ri = create_rai_insights_object_regression_with_predictions
        dashboard_input = ResponsibleAIDashboardInput(ri)

        id = ri.causal.get()[0].id
        post_data = [id, filters, []]

        flask_server_prediction_output = \
            dashboard_input.get_global_causal_effects(
                post_data)

        self.check_success_criteria(flask_server_prediction_output)

    def test_rai_dashboard_input_housing_causal_global_effects_failure(
            self, create_rai_insights_object_regression_with_model,
            create_rai_insights_object_regression_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_regression_with_model
        else:
            ri = create_rai_insights_object_regression_with_predictions
        dashboard_input = ResponsibleAIDashboardInput(ri)

        id = "some_id_that_does_not_exist"
        post_data = [id, [], []]

        flask_server_prediction_output = \
            dashboard_input.get_global_causal_effects(
                post_data)

        self.check_failure_criteria(
            flask_server_prediction_output,
            "Failed to generate global causal effects for cohort,")

    @pytest.mark.parametrize('filters', [
        [],
        [{'arg': [30],
          'column': 'HouseAge',
          'method': 'less and equal'}]
    ])
    def test_rai_dashboard_input_housing_causal_global_policy_success(
            self, create_rai_insights_object_regression_with_model,
            create_rai_insights_object_regression_with_predictions,
            with_model, filters):
        if with_model:
            ri = create_rai_insights_object_regression_with_model
        else:
            ri = create_rai_insights_object_regression_with_predictions
        dashboard_input = ResponsibleAIDashboardInput(ri)

        id = ri.causal.get()[0].id
        post_data = [id, filters, []]

        flask_server_prediction_output = \
            dashboard_input.get_global_causal_policy(
                post_data)

        self.check_success_criteria(flask_server_prediction_output)

    def test_rai_dashboard_input_housing_causal_global_policy_failure(
            self, create_rai_insights_object_regression_with_model,
            create_rai_insights_object_regression_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_regression_with_model
        else:
            ri = create_rai_insights_object_regression_with_predictions
        dashboard_input = ResponsibleAIDashboardInput(ri)

        id = "some_id_that_does_not_exist"
        post_data = [id, [], []]

        flask_server_prediction_output = \
            dashboard_input.get_global_causal_policy(
                post_data)

        self.check_failure_criteria(
            flask_server_prediction_output,
            "Failed to generate global causal policy for cohort,")
