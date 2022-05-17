# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from unittest.mock import patch

from raiwidgets.responsibleai_dashboard_input import \
    ResponsibleAIDashboardInput


class TestResponsibleAIDashboardInput:
    def test_model_analysis_adult(
            self, create_rai_insights_object_classification):
        ri = create_rai_insights_object_classification
        knn = ri.model
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        with patch.object(knn, "predict_proba") as predict_mock:
            test_pred_data = test_data.head(1).drop("Income", axis=1).values
            dashboard_input.on_predict(
                test_pred_data)

            assert (predict_mock.call_args[0]
                    [0].values == test_pred_data).all()
