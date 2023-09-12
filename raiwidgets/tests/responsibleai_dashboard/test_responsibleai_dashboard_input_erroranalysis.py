# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import pytest

from raiwidgets.interfaces import WidgetRequestResponseConstants
from raiwidgets.responsibleai_dashboard_input import \
    ResponsibleAIDashboardInput

from .common_utils import CheckResponsibleAIDashboardInputTestResult


@pytest.mark.parametrize("with_model", [True, False])
class TestResponsibleAIDashboardInputClassificationErrorAnalysis(
    CheckResponsibleAIDashboardInputTestResult
):
    def test_rai_dashboard_input_adult_matrix_success(
            self, create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
        features = ['Age', 'Workclass']
        filters = []
        composite_filters = []
        quantile_binning = False
        num_bins = 8
        metric = "Error rate"
        post_data = [features, filters, composite_filters,
                     quantile_binning, num_bins, metric]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.matrix(post_data)

        self.check_success_criteria(flask_server_prediction_output)

        empty_features = [None, None]
        post_data = [empty_features, filters, composite_filters,
                     quantile_binning, num_bins, metric]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.matrix(post_data)

        assert len(
            flask_server_prediction_output[
                WidgetRequestResponseConstants.data]) == 0
        self.check_success_criteria(flask_server_prediction_output)

    def test_rai_dashboard_input_adult_matrix_failure(
            self, create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
        features = ['Age', 'Workclass']
        filters = []
        composite_filters = []
        quantile_binning = False
        num_bins = 8
        # test invalid metric throws errors
        metric = "Error Rate"
        post_data = [features, filters, composite_filters,
                     quantile_binning, num_bins, metric]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.matrix(post_data)

        self.check_failure_criteria(
            flask_server_prediction_output,
            "Failed to generate json matrix representation,")

    def test_rai_dashboard_input_adult_matrix_invalid_features(
            self, create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
        # test invalid features throw errors
        invalid_features = ['Age', 'InvalidFeature']
        filters = []
        composite_filters = []
        quantile_binning = False
        num_bins = 8
        metric = "Error rate"
        post_data = [invalid_features, filters, composite_filters,
                     quantile_binning, num_bins, metric]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.matrix(post_data)

        self.check_failure_criteria(
            flask_server_prediction_output,
            "Failed to generate json matrix representation,")
        self.check_failure_criteria(
            flask_server_prediction_output,
            "not found in dataset. Existing features")

    def test_rai_dashboard_input_adult_debug_ml_success(
            self, create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions

        features = ri.test.drop("Income", axis=1).columns.tolist()
        filters = []
        composite_filters = []
        max_depth = 3
        num_leaves = 3
        min_child_samples = 8
        metric = "Error rate"
        post_data = [features, filters, composite_filters,
                     max_depth, num_leaves, min_child_samples, metric]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.debug_ml(post_data)

        self.check_success_criteria(flask_server_prediction_output)

    def test_rai_dashboard_input_adult_debug_ml_failure(
            self, create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
        features = ri.test.drop("Income", axis=1).columns.tolist()
        filters = []
        composite_filters = []
        max_depth = 3
        num_leaves = 3
        min_child_samples = 8
        # test invalid metric throws errors
        metric = "Error Rate"
        post_data = [features, filters, composite_filters,
                     max_depth, num_leaves, min_child_samples, metric]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.debug_ml(post_data)

        self.check_failure_criteria(
            flask_server_prediction_output,
            "Failed to generate json tree representation,")

    def test_rai_dashboard_input_adult_debug_ml_invalid_features(
            self, create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
        # test invalid features throw errors
        invalid_features = ['Age', 'InvalidFeature']
        filters = []
        composite_filters = []
        max_depth = 3
        num_leaves = 3
        min_child_samples = 8
        metric = "Error rate"
        post_data = [invalid_features, filters, composite_filters,
                     max_depth, num_leaves, min_child_samples, metric]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.debug_ml(post_data)

        self.check_failure_criteria(
            flask_server_prediction_output,
            "Failed to generate json tree representation,")
        self.check_failure_criteria(
            flask_server_prediction_output,
            "not found in dataset. Existing features")

    def test_rai_dashboard_input_adult_importances_success(
            self, create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.importances()

        self.check_success_criteria(flask_server_prediction_output)
