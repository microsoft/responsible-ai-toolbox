# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.constants import Metrics, ModelTask, RootKeys
from erroranalysis.analyzer import ModelAnalyzer, PredictionsAnalyzer


class FixedPredictionModel:
    def __init__(self, predictions):
        self.predictions = predictions

    def predict(self, dataset):
        return self.predictions.copy()


@pytest.mark.parametrize("analyzer_type", [ModelAnalyzer, PredictionsAnalyzer])
@pytest.mark.parametrize("metric, expected", [
    (Metrics.PRECISION_SCORE, 2 / 3),
    (Metrics.RECALL_SCORE, 1),
    (Metrics.MACRO_PRECISION_SCORE, 5 / 6),
    (Metrics.MACRO_RECALL_SCORE, 7 / 8),
])
def test_classification_root_stats_use_true_labels_first(
        analyzer_type, metric, expected):
    # Three true negatives, one false positive, and two true positives.
    true_y = np.array([0, 0, 0, 0, 1, 1])
    pred_y = np.array([0, 0, 0, 1, 1, 1])
    dataset = pd.DataFrame({"feature": range(len(true_y))})
    model_or_predictions = (FixedPredictionModel(pred_y)
                            if analyzer_type is ModelAnalyzer else pred_y)
    analyzer = analyzer_type(
        model_or_predictions, dataset, true_y, ["feature"], [],
        model_task=ModelTask.CLASSIFICATION, metric=metric)

    root_stats = analyzer.compute_root_stats()

    assert root_stats[RootKeys.METRIC_VALUE] == pytest.approx(expected)
    assert root_stats[RootKeys.TOTAL_SIZE] == len(true_y)


@pytest.mark.parametrize("analyzer_type", [ModelAnalyzer, PredictionsAnalyzer])
@pytest.mark.parametrize("metric, expected", [
    # Squared residuals sum to 5; squared deviations of true labels sum to 2.
    (Metrics.R2_SCORE, -1.5),
    (Metrics.MEAN_PREDICTION, 2),
])
def test_regression_root_stats_use_true_labels_first(
        analyzer_type, metric, expected):
    true_y = np.array([0, 1, 2])
    pred_y = np.array([0, 2, 4])
    dataset = pd.DataFrame({"feature": range(len(true_y))})
    model_or_predictions = (FixedPredictionModel(pred_y)
                            if analyzer_type is ModelAnalyzer else pred_y)
    analyzer = analyzer_type(
        model_or_predictions, dataset, true_y, ["feature"], [],
        model_task=ModelTask.REGRESSION, metric=metric)

    root_stats = analyzer.compute_root_stats()

    assert root_stats[RootKeys.METRIC_VALUE] == pytest.approx(expected)
    assert root_stats[RootKeys.TOTAL_SIZE] == len(true_y)


@pytest.mark.parametrize("analyzer_type", [ModelAnalyzer, PredictionsAnalyzer])
@pytest.mark.parametrize("classes", [[0, 1], [1, 0], ["no", "yes"]],
                         ids=["numeric", "reversed-numeric", "strings"])
@pytest.mark.parametrize("metric, expected", [
    (Metrics.PRECISION_SCORE, 2 / 3),
    (Metrics.RECALL_SCORE, 2 / 5),
    (Metrics.F1_SCORE, 1 / 2),
    (Metrics.FALSE_NEGATIVE_RATE, 3 / 5),
    (Metrics.FALSE_POSITIVE_RATE, 1 / 6),
    (Metrics.SELECTION_RATE, 3 / 11),
])
def test_binary_root_stats_respect_class_order(
        analyzer_type, classes, metric, expected):
    # As in the tree/heatmap metrics, classes[1] is the positive class.
    negative, positive = classes
    # Five TN, one FP, three FN, and two TP, regardless of label values.
    true_y = np.array([negative] * 6 + [positive] * 5)
    pred_y = np.array([negative] * 5 + [positive] +
                      [negative] * 3 + [positive] * 2)
    dataset = pd.DataFrame({"feature": range(len(true_y))})
    model_or_predictions = (FixedPredictionModel(pred_y)
                            if analyzer_type is ModelAnalyzer else pred_y)
    analyzer = analyzer_type(
        model_or_predictions, dataset, true_y, ["feature"], [],
        model_task=ModelTask.CLASSIFICATION, metric=metric, classes=classes)

    root_stats = analyzer.compute_root_stats()

    assert root_stats[RootKeys.METRIC_VALUE] == pytest.approx(expected)
    assert root_stats[RootKeys.TOTAL_SIZE] == len(true_y)
