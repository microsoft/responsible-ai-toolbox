# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.constants import Metrics, ModelTask
from erroranalysis.analyzer import PredictionsAnalyzer


def make_two_feature_analyzer(classes, metric, true_y, pred_y):
    # Repeat the same observations in each of four independent feature cells.
    cell_size = len(true_y)
    feature_names = ["first_feature", "second_feature"]
    dataset = pd.DataFrame({
        feature_names[0]: np.repeat([0, 0, 1, 1], cell_size),
        feature_names[1]: np.repeat([0, 1, 0, 1], cell_size),
    })
    return PredictionsAnalyzer(
        np.tile(pred_y, 4), dataset, np.tile(true_y, 4), feature_names,
        feature_names, model_task=ModelTask.CLASSIFICATION,
        metric=metric, classes=classes)


@pytest.mark.parametrize("classes", [[1, 0], ["yes", "no"]],
                         ids=["reversed-numeric", "reversed-strings"])
@pytest.mark.parametrize("metric, expected", [
    (Metrics.FALSE_NEGATIVE_RATE, 3 / 5),
    (Metrics.FALSE_POSITIVE_RATE, 1 / 6),
    (Metrics.SELECTION_RATE, 3 / 11),
])
def test_two_feature_binary_heatmap_respects_class_order(
        classes, metric, expected):
    negative, positive = classes
    # In each cell: TN=5, FP=1, FN=3, TP=2.
    true_y = np.array([negative] * 6 + [positive] * 5)
    pred_y = np.array([negative] * 5 + [positive] +
                      [negative] * 3 + [positive] * 2)
    analyzer = make_two_feature_analyzer(classes, metric, true_y, pred_y)

    heatmap = analyzer.compute_matrix(
        ["first_feature", "second_feature"], None, None)

    assert len(heatmap["matrix"]) == 2
    for row in heatmap["matrix"]:
        assert len(row) == 2
        for cell in row:
            assert cell["count"] == 11
            assert cell["metricValue"] == pytest.approx(expected)


@pytest.mark.parametrize("classes", [[1, 0], ["yes", "no"]],
                         ids=["reversed-numeric", "reversed-strings"])
@pytest.mark.parametrize("metric, class_index, expected", [
    (Metrics.FALSE_NEGATIVE_RATE, 1, 0),
    (Metrics.FALSE_POSITIVE_RATE, 0, 0),
    (Metrics.SELECTION_RATE, 0, 0),
    (Metrics.SELECTION_RATE, 1, 1),
])
def test_two_feature_binary_heatmap_retains_absent_declared_class(
        classes, metric, class_index, expected):
    # These rates have defined denominators for the retained true class.
    labels = np.array([classes[class_index]] * 4)
    analyzer = make_two_feature_analyzer(
        classes, metric, labels, labels.copy())

    heatmap = analyzer.compute_matrix(
        ["first_feature", "second_feature"], None, None)

    assert len(heatmap["matrix"]) == 2
    for row in heatmap["matrix"]:
        assert len(row) == 2
        for cell in row:
            assert cell["count"] == 4
            assert cell["metricValue"] == pytest.approx(expected)
