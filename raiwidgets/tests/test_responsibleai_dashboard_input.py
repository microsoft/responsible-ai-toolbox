# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from raiwidgets.responsibleai_dashboard_input import \
    ResponsibleAIDashboardInput
from raiwidgets.interfaces import WidgetRequestResponseConstants


class TestResponsibleAIDashboardInputClassification:
    def test_model_analysis_adult_on_predict_success(
            self, create_rai_insights_object_classification):
        ri = create_rai_insights_object_classification
        knn = ri.model
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        test_pred_data = test_data.head(1).drop("Income", axis=1).values
        flask_server_prediction_output = dashboard_input.on_predict(
            test_pred_data)
        knn_prediction = knn.predict_proba(test_pred_data)

        assert knn_prediction is not None
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert (flask_server_prediction_output['data'] == knn_prediction).all()

    def test_model_analysis_adult_on_predict_failure(
            self, create_rai_insights_object_classification):
        ri = create_rai_insights_object_classification
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        test_pred_data = test_data.head(1).values
        flask_server_prediction_output = dashboard_input.on_predict(
            test_pred_data)

        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.error in \
            flask_server_prediction_output
        assert "Model threw exception while predicting..." in \
            flask_server_prediction_output[
                WidgetRequestResponseConstants.error]
        assert len(
            flask_server_prediction_output[
                WidgetRequestResponseConstants.data]) == 0

    def test_model_analysis_adult_importances_success(
            self, create_rai_insights_object_classification):
        ri = create_rai_insights_object_classification

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.importances()
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert WidgetRequestResponseConstants.error not in \
            flask_server_prediction_output

    def test_model_analysis_adult_matrix_success(
            self, create_rai_insights_object_classification):
        ri = create_rai_insights_object_classification
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
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert WidgetRequestResponseConstants.error not in \
            flask_server_prediction_output

    def test_model_analysis_adult_matrix_failure(
            self, create_rai_insights_object_classification):
        ri = create_rai_insights_object_classification
        features = ['Age', 'Workclass']
        filters = []
        composite_filters = []
        quantile_binning = False
        num_bins = 8
        metric = "Error Rate"
        post_data = [features, filters, composite_filters,
                     quantile_binning, num_bins, metric]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.matrix(post_data)
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.error in \
            flask_server_prediction_output
        assert "Failed to generate json matrix representation," in \
            flask_server_prediction_output[
                WidgetRequestResponseConstants.error]
        assert len(
            flask_server_prediction_output[
                WidgetRequestResponseConstants.data]) == 0

    def test_model_analysis_adult_debug_ml_success(
            self, create_rai_insights_object_classification):
        ri = create_rai_insights_object_classification

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
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert WidgetRequestResponseConstants.error not in \
            flask_server_prediction_output

    def test_model_analysis_adult_debug_ml_failure(
            self, create_rai_insights_object_classification):
        ri = create_rai_insights_object_classification

        features = ri.test.drop("Income", axis=1).columns.tolist()
        filters = []
        composite_filters = []
        max_depth = 3
        num_leaves = 3
        min_child_samples = 8
        metric = "Error Rate"
        post_data = [features, filters, composite_filters,
                     max_depth, num_leaves, min_child_samples, metric]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.debug_ml(post_data)
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.error in \
            flask_server_prediction_output
        assert "Failed to generate json tree representation," in \
            flask_server_prediction_output[
                WidgetRequestResponseConstants.error]
        assert len(
            flask_server_prediction_output[
                WidgetRequestResponseConstants.data]) == 0


class TestResponsibleAIDashboardInputRegression:
    def test_model_analysis_housing_on_predict_success(
            self, create_rai_insights_object_regression):
        ri = create_rai_insights_object_regression
        rf = ri.model
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        test_pred_data = test_data.head(1).drop("target", axis=1).values
        flask_server_prediction_output = dashboard_input.on_predict(
            test_pred_data)
        rf_prediction = rf.predict(test_pred_data)

        assert rf_prediction is not None
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert (flask_server_prediction_output['data'] == rf_prediction).all()

    def test_model_analysis_housing_causal_whatif_success(
            self, create_rai_insights_object_regression):
        ri = create_rai_insights_object_regression
        id = ri.causal.get()[0].id
        causal_whatif_test_data = ri.test.head(1).drop(
            "target", axis=1).to_dict(orient='records')
        treatment_feature = 'AveRooms'
        current_treatment_value = [causal_whatif_test_data[0][
            treatment_feature]]
        current_outcome = [ri.test.head(1)["target"].values[0]]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        post_data = (id, causal_whatif_test_data,
                     treatment_feature, current_treatment_value,
                     current_outcome)
        flask_server_prediction_output = dashboard_input.causal_whatif(
            post_data)
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert WidgetRequestResponseConstants.error not in \
            flask_server_prediction_output

    def test_model_analysis_housing_causal_whatif_failure(
            self, create_rai_insights_object_regression):
        ri = create_rai_insights_object_regression
        id = "some_id"
        causal_whatif_test_data = ri.test.head(1).drop(
            "target", axis=1).to_dict(orient='records')
        treatment_feature = 'AveRooms'
        current_treatment_value = [causal_whatif_test_data[0][
            treatment_feature]]
        current_outcome = [ri.test.head(1)["target"].values[0]]

        dashboard_input = ResponsibleAIDashboardInput(ri)
        post_data = (id, causal_whatif_test_data,
                     treatment_feature, current_treatment_value,
                     current_outcome)
        flask_server_prediction_output = dashboard_input.causal_whatif(
            post_data)
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert len(
            flask_server_prediction_output[
                WidgetRequestResponseConstants.data]) == 0
        assert WidgetRequestResponseConstants.error in \
            flask_server_prediction_output
        assert "Failed to generate causal what-if," in \
            flask_server_prediction_output[
                WidgetRequestResponseConstants.error]
