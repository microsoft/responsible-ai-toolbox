# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from raiwidgets.responsibleai_dashboard_input import \
    ResponsibleAIDashboardInput

from .common_utils import CheckResponsibleAIDashboardInputTestResult


@pytest.mark.parametrize("with_model", [True, False])
class TestResponsibleAIDashboardInputClassificationPredict(
    CheckResponsibleAIDashboardInputTestResult
):
    def test_rai_dashboard_input_adult_on_predict_success(
            self, create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
        knn = ri.model
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        test_pred_data_df = test_data.head(1).drop("Income", axis=1)
        flask_server_prediction_output = dashboard_input.on_predict(
            test_pred_data_df.values)
        knn_prediction = knn.predict_proba(test_pred_data_df)

        assert knn_prediction is not None
        assert (flask_server_prediction_output['data'] == knn_prediction).all()
        self.check_success_criteria(flask_server_prediction_output)

    def test_rai_dashboard_input_adult_on_predict_failure(
            self, create_rai_insights_object_classification_with_model,
            create_rai_insights_object_classification_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_classification_with_model
        else:
            ri = create_rai_insights_object_classification_with_predictions
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        test_pred_data = test_data.head(1).values
        flask_server_prediction_output = dashboard_input.on_predict(
            test_pred_data)

        self.check_failure_criteria(
            flask_server_prediction_output,
            "Model threw exception while predicting...")


@pytest.mark.parametrize("with_model", [True, False])
class TestResponsibleAIDashboardInputRegressionPredict(
    CheckResponsibleAIDashboardInputTestResult
):
    def test_rai_dashboard_input_housing_on_predict_success(
            self, create_rai_insights_object_regression_with_model,
            create_rai_insights_object_regression_with_predictions,
            with_model):
        if with_model:
            ri = create_rai_insights_object_regression_with_model
        else:
            ri = create_rai_insights_object_regression_with_predictions
        rf = ri.model
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        test_pred_data_df = test_data.head(1).drop("target", axis=1)
        flask_server_prediction_output = dashboard_input.on_predict(
            test_pred_data_df.values)
        rf_prediction = rf.predict(test_pred_data_df)

        assert rf_prediction is not None
        assert (flask_server_prediction_output['data'] == rf_prediction).all()
        self.check_success_criteria(flask_server_prediction_output)


@pytest.mark.parametrize("with_model", [True, False])
class TestResponsibleAIDashboardInputMultiClassClassification(
    CheckResponsibleAIDashboardInputTestResult
):
    def test_rai_dashboard_input_iris_on_predict_success(
            self,
            create_rai_insights_object_multiclass_with_model,
            create_rai_insights_object_multiclass_with_predictions,
            with_model):
        if with_model:
            ri = \
                create_rai_insights_object_multiclass_with_model
        else:
            ri = \
                create_rai_insights_object_multiclass_with_predictions
        rf = ri.model
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        test_pred_data_df = test_data.head(1).drop("target", axis=1)
        flask_server_prediction_output = dashboard_input.on_predict(
            test_pred_data_df.values)
        rf_prediction = rf.predict_proba(test_pred_data_df)

        assert rf_prediction is not None
        assert (flask_server_prediction_output['data'] == rf_prediction).all()
        self.check_success_criteria(flask_server_prediction_output)
