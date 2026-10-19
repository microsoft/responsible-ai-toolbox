# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.constants import (ARG, COLUMN, METHOD, Metrics,
                                               ModelTask)
from erroranalysis.analyzer import ModelAnalyzer, PredictionsAnalyzer
from raiutils.cohort import CohortFilterMethods


@pytest.mark.parametrize("analyzer_type", [PredictionsAnalyzer, ModelAnalyzer])
@pytest.mark.parametrize("filtered", [False, True])
def test_tree_mean_prediction_uses_predictions(analyzer_type, filtered):
    dataset = pd.DataFrame({"feature": np.arange(40)})
    true_y = dataset["feature"].to_numpy()
    pred_y = 2 * true_y - 3

    class LinearModel:
        def predict(self, data):
            return 2 * data["feature"].to_numpy() - 3

    predictions_or_model = (LinearModel() if analyzer_type is ModelAnalyzer
                            else pred_y)
    analyzer = analyzer_type(
        predictions_or_model, dataset, true_y, ["feature"], [],
        model_task=ModelTask.REGRESSION, metric=Metrics.MEAN_PREDICTION)
    filters = ([{ARG: [20], COLUMN: "feature",
                 METHOD: CohortFilterMethods.METHOD_LESS}]
               if filtered else None)

    tree = analyzer.compute_error_tree(
        ["feature"], filters, None, min_child_samples=1)

    # Predictions are -3, -1, ..., 75 (or ..., 35 for the filtered cohort).
    assert tree[0]["size"] == (20 if filtered else 40)
    assert tree[0]["metricValue"] == pytest.approx(16 if filtered else 36)
    expected_error = sum(abs(x - 3) for x in range(20 if filtered else 40))
    assert tree[0]["error"] == pytest.approx(expected_error)
