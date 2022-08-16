# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from common_utils import CheckResponsibleAIDashboardInputTestResult

from raiwidgets.responsibleai_dashboard_input import \
    ResponsibleAIDashboardInput


class TestResponsibleAIDashboardInputClassificationPredict(
    CheckResponsibleAIDashboardInputTestResult
):
    def test_rai_dashboard_input_adult_on_predict_success(
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
        assert (flask_server_prediction_output['data'] == knn_prediction).all()
        self.check_success_criteria(flask_server_prediction_output)

    def test_rai_dashboard_input_adult_on_predict_failure(
            self, create_rai_insights_object_classification):
        ri = create_rai_insights_object_classification
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        test_pred_data = test_data.head(1).values
        flask_server_prediction_output = dashboard_input.on_predict(
            test_pred_data)

        self.check_failure_criteria(
            flask_server_prediction_output,
            "Model threw exception while predicting...")


class TestResponsibleAIDashboardInputRegressionPredict(
    CheckResponsibleAIDashboardInputTestResult
):
    def test_rai_dashboard_input_housing_on_predict_success(
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
        assert (flask_server_prediction_output['data'] == rf_prediction).all()
        self.check_success_criteria(flask_server_prediction_output)


class TestResponsibleAIDashboardInputMultiClassClassification(
    CheckResponsibleAIDashboardInputTestResult
):
    def test_rai_dashboard_input_iris_on_predict_success(
            self, create_rai_insights_object_multiclass_classification):
        ri = create_rai_insights_object_multiclass_classification
        rf = ri.model
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        test_pred_data = test_data.head(1).drop("target", axis=1).values
        flask_server_prediction_output = dashboard_input.on_predict(
            test_pred_data)
        rf_prediction = rf.predict_proba(test_pred_data)

        assert rf_prediction is not None
        assert (flask_server_prediction_output['data'] == rf_prediction).all()
        self.check_success_criteria(flask_server_prediction_output)
