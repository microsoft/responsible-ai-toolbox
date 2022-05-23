# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from unittest.mock import patch

from raiwidgets.responsibleai_dashboard_input import \
    ResponsibleAIDashboardInput
from raiwidgets.interfaces import WidgetRequestResponseConstants


class TestResponsibleAIDashboardInput:
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
        assert WidgetRequestResponseConstants.data in flask_server_prediction_output 
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
        assert WidgetRequestResponseConstants.error in flask_server_prediction_output
        assert "Model threw exception while predicting..." in flask_server_prediction_output[WidgetRequestResponseConstants.error]
        assert len(flask_server_prediction_output[WidgetRequestResponseConstants.data]) == 0

    def test_model_analysis_adult_importances(
            self, create_rai_insights_object_classification):
        ri = create_rai_insights_object_classification

        dashboard_input = ResponsibleAIDashboardInput(ri)
        flask_server_prediction_output = dashboard_input.importances()
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.data in flask_server_prediction_output 
