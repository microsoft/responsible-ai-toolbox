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
@pytest.mark.parametrize("labels", [[0, 1], ["negative", "positive"]],
                         ids=["numeric", "strings"])
@pytest.mark.parametrize("explicit_classes", [False, True])
@pytest.mark.parametrize("two_features", [False, True])
@pytest.mark.parametrize("correct_class_index", [0, 1])
@pytest.mark.parametrize("metric", [
    Metrics.FALSE_NEGATIVE_RATE,
    Metrics.FALSE_POSITIVE_RATE,
    Metrics.SELECTION_RATE,
    Metrics.PRECISION_SCORE,
    Metrics.RECALL_SCORE,
    Metrics.F1_SCORE,
])
def test_binary_heatmap_retains_classes_before_cohort_filter(
        analyzer_type, labels, explicit_classes, two_features,
        correct_class_index, metric):
    correct_label = labels[correct_class_index]
    wrong_label = labels[1 - correct_class_index]
    true_y = np.array([correct_label] * 8 + [wrong_label] * 8)
    pred_y = np.full(16, correct_label)
    dataset = pd.DataFrame({
        "cohort": [0] * 8 + [1] * 8,
        "first": [0, 0, 0, 0, 1, 1, 1, 1] * 2,
        "second": [0, 0, 1, 1, 0, 0, 1, 1] * 2,
    })

    class ConstantModel:
        def predict(self, data):
            return np.full(len(data), correct_label)

    predictions_or_model = (ConstantModel() if analyzer_type is ModelAnalyzer
                            else pred_y)
    kwargs = {"classes": labels} if explicit_classes else {}
    analyzer = analyzer_type(
        predictions_or_model, dataset, true_y, list(dataset.columns), [],
        model_task=ModelTask.CLASSIFICATION, metric=metric, **kwargs)
    filters = [{ARG: [0], COLUMN: "cohort",
                METHOD: CohortFilterMethods.METHOD_EQUAL}]

    heatmap = analyzer.compute_matrix(
        ["first", "second" if two_features else None], filters, None)

    if metric in (Metrics.FALSE_NEGATIVE_RATE, Metrics.FALSE_POSITIVE_RATE):
        # Heatmap presentation converts undefined rates to zero.
        expected = 0
    else:
        expected = correct_class_index
    cells = [cell for row in heatmap["matrix"] for cell in row]
    assert len(cells) == (4 if two_features else 2)
    for cell in cells:
        assert cell["count"] == (2 if two_features else 4)
        np.testing.assert_allclose(
            cell["metricValue"], expected, equal_nan=True)
