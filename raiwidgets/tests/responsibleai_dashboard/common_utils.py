# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import json

from raiwidgets.interfaces import WidgetRequestResponseConstants

TARGET = 'target'


class CheckResponsibleAIDashboardInputTestResult:
    def check_success_criteria(self, flask_server_prediction_output):
        assert flask_server_prediction_output is not None
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert WidgetRequestResponseConstants.error not in \
            flask_server_prediction_output

        json.dumps(flask_server_prediction_output[
            WidgetRequestResponseConstants.data])

    def check_failure_criteria(self, flask_server_prediction_output,
                               expected_error_message):
        assert WidgetRequestResponseConstants.data in \
            flask_server_prediction_output
        assert len(
            flask_server_prediction_output[
                WidgetRequestResponseConstants.data]) == 0
        assert WidgetRequestResponseConstants.error in \
            flask_server_prediction_output
        assert expected_error_message in \
            flask_server_prediction_output[
                WidgetRequestResponseConstants.error]
