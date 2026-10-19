# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd

from erroranalysis._internal.constants import ModelTask
from erroranalysis.analyzer import PredictionsAnalyzer


def test_prediction_analyzer_regression_accepts_lists():
    true_y = [2.0, -1.0, 3.0, 0.0]
    pred_y = [2.0, 4.0, 1.0, -0.5]
    dataset = pd.DataFrame({"feature": range(len(true_y))})
    analyzer = PredictionsAnalyzer(
        pred_y, dataset, true_y, ["feature"], [],
        model_task=ModelTask.REGRESSION)

    residuals = analyzer.get_diff()

    np.testing.assert_array_equal(residuals, [0.0, 5.0, -2.0, -0.5])
