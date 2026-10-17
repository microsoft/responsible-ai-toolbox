# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.constants import Metrics, ModelTask
from erroranalysis.analyzer import PredictionsAnalyzer


def make_binary_analyzer(classes, metric, varying_feature=False):
    negative, positive = classes
    # TN=5, FP=1, FN=3, TP=2.
    true_y = np.array([negative] * 6 + [positive] * 5)
    pred_y = np.array([negative] * 5 + [positive] +
                      [negative] * 3 + [positive] * 2)
    feature = (np.arange(len(true_y)) if varying_feature
               else np.zeros(len(true_y)))
    dataset = pd.DataFrame({"feature": feature})
    return PredictionsAnalyzer(
        pred_y, dataset, true_y, ["feature"], [],
        model_task=ModelTask.CLASSIFICATION, metric=metric, classes=classes)


@pytest.mark.parametrize("classes", [[0, 1], [1, 0], ["no", "yes"]],
                         ids=["numeric", "reversed-numeric", "strings"])
@pytest.mark.parametrize("metric, expected", [
    (Metrics.FALSE_NEGATIVE_RATE, 3 / 5),
    (Metrics.FALSE_POSITIVE_RATE, 1 / 6),
    (Metrics.SELECTION_RATE, 3 / 11),
])
def test_binary_error_tree_metrics_respect_class_order(
        classes, metric, expected):
    analyzer = make_binary_analyzer(classes, metric, varying_feature=True)

    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    # The root contains all observations, regardless of subsequent splits.
    assert tree[0]["size"] == 11
    assert tree[0]["metricValue"] == pytest.approx(expected)


@pytest.mark.parametrize("classes", [[0, 1], [1, 0], ["no", "yes"]],
                         ids=["numeric", "reversed-numeric", "strings"])
@pytest.mark.parametrize("metric, expected", [
    (Metrics.FALSE_NEGATIVE_RATE, 3 / 5),
    (Metrics.FALSE_POSITIVE_RATE, 1 / 6),
    (Metrics.SELECTION_RATE, 3 / 11),
])
def test_binary_heatmap_metrics_respect_class_order(classes, metric, expected):
    analyzer = make_binary_analyzer(classes, metric)

    heatmap = analyzer.compute_matrix(["feature", None], None, None)

    assert len(heatmap["matrix"]) == 1
    assert len(heatmap["matrix"][0]) == 1
    cell = heatmap["matrix"][0][0]
    assert cell["count"] == 11
    assert cell["metricValue"] == pytest.approx(expected)


@pytest.mark.parametrize("classes", [[0, 1], [1, 0], ["no", "yes"]],
                         ids=["numeric", "reversed-numeric", "strings"])
@pytest.mark.parametrize("metric, class_index, expected", [
    (Metrics.FALSE_NEGATIVE_RATE, 1, 0),
    (Metrics.FALSE_POSITIVE_RATE, 0, 0),
    (Metrics.SELECTION_RATE, 0, 0),
    (Metrics.SELECTION_RATE, 1, 1),
])
def test_binary_heatmap_single_class_retains_declared_classes(
        classes, metric, class_index, expected):
    # Each selected rate is defined for this true class. The absent class
    # remains in the declared class list so the confusion matrix stays 2x2.
    labels = np.array([classes[class_index]] * 4)
    dataset = pd.DataFrame({"feature": np.zeros(len(labels))})
    analyzer = PredictionsAnalyzer(
        labels.copy(), dataset, labels, ["feature"], [],
        model_task=ModelTask.CLASSIFICATION, metric=metric, classes=classes)

    heatmap = analyzer.compute_matrix(["feature", None], None, None)

    cell = heatmap["matrix"][0][0]
    assert cell["count"] == 4
    assert cell["metricValue"] == pytest.approx(expected)
