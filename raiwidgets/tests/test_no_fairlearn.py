# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
import mock
from raiwidgets import FairnessDashboard
from raiwidgets.fairness_metric_calculation import \
    MODULE_NOT_INSTALLED_ERROR_MESSAGE


@mock.patch("importlib.import_module")
def test_no_fairlearn(importlib_mock):
    importlib_mock.side_effect = \
        ModuleNotFoundError("No module named 'fairlearn.metrics'")

    with pytest.raises(Exception) as exc:
        FairnessDashboard(
            sensitive_features=["a", "b"],
            sensitive_feature_names=["a", "b"],
            y_true=[0, 1],
            y_pred=[0, 1])

    assert MODULE_NOT_INSTALLED_ERROR_MESSAGE.format('fairlearn.metrics') \
        in exc.value.args[0]
