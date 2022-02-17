# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import mock

from raiwidgets.responsibleai_dashboard_input import \
    ResponsibleAIDashboardInput


class TestResponsibleAIDashboardInput:
    def test_model_analysis_adult(self, create_rai_insights_object):
        ri = create_rai_insights_object
        knn = ri.model
        test_data = ri.test

        dashboard_input = ResponsibleAIDashboardInput(ri)
        with mock.patch.object(knn, "predict_proba") as predict_mock:
            test_pred_data = test_data.head(1).drop("Income", axis=1).values
            dashboard_input.on_predict(
                test_pred_data)

            assert (predict_mock.call_args[0]
                    [0].values == test_pred_data).all()
