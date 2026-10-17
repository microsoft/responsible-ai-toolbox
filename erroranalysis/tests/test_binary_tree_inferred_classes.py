# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.constants import (ARG, COLUMN, METHOD, Metrics,
                                               ModelTask)
from erroranalysis.analyzer import ModelAnalyzer, PredictionsAnalyzer
from raiutils.cohort import CohortFilterMethods


@pytest.fixture(params=[PredictionsAnalyzer, ModelAnalyzer])
def analyzer_type(request):
    return request.param


def make_inferred_class_analyzer(
        labels, metric, correct_class_index, analyzer_type):
    correct_label = labels[correct_class_index]
    wrong_label = labels[1 - correct_class_index]
    true_y = np.array([correct_label] * 20 + [wrong_label] * 20)
    pred_y = np.array([correct_label] * 40)
    dataset = pd.DataFrame({"feature": [0] * 20 + [1] * 20})

    class ConstantModel:
        def predict(self, data):
            return np.full(len(data), correct_label)

    predictions_or_model = (ConstantModel() if analyzer_type is ModelAnalyzer
                            else pred_y)
    # Intentionally omit classes: the complete scored data has both labels.
    return analyzer_type(
        predictions_or_model, dataset, true_y, ["feature"], [],
        model_task=ModelTask.CLASSIFICATION, metric=metric)


@pytest.mark.parametrize("labels", [[0, 1], ["negative", "positive"]],
                         ids=["numeric", "strings"])
@pytest.mark.parametrize("correct_class_index", [0, 1])
@pytest.mark.parametrize("metric", [
    Metrics.FALSE_NEGATIVE_RATE,
    Metrics.FALSE_POSITIVE_RATE,
    Metrics.SELECTION_RATE,
    Metrics.PRECISION_SCORE,
    Metrics.RECALL_SCORE,
    Metrics.F1_SCORE,
])
def test_binary_tree_infers_classes_before_single_class_leaves(
        labels, correct_class_index, metric, analyzer_type):
    analyzer = make_inferred_class_analyzer(
        labels, metric, correct_class_index, analyzer_type)

    tree = analyzer.compute_error_tree(
        ["feature"], None, None, max_depth=1, num_leaves=2,
        min_child_samples=1)

    assert len(tree) == 3
    root, *children = tree
    assert root["size"] == 40
    assert root["error"] == 20
    assert root["success"] == 20
    assert all(child["size"] == 20 for child in children)
    correct_leaf = next(child for child in children if child["error"] == 0)
    incorrect_leaf = next(child for child in children if child["error"] == 20)

    if metric == Metrics.FALSE_NEGATIVE_RATE:
        expected_root = 1 - correct_class_index
        expected_correct = np.nan if correct_class_index == 0 else 0
        expected_incorrect = 1 if correct_class_index == 0 else np.nan
    elif metric == Metrics.FALSE_POSITIVE_RATE:
        expected_root = correct_class_index
        expected_correct = 0 if correct_class_index == 0 else np.nan
        expected_incorrect = np.nan if correct_class_index == 0 else 1
    elif metric == Metrics.SELECTION_RATE:
        expected_root = correct_class_index
        expected_correct = correct_class_index
        expected_incorrect = correct_class_index
    else:
        root_scores = {Metrics.PRECISION_SCORE: 0.5,
                       Metrics.RECALL_SCORE: 1,
                       Metrics.F1_SCORE: 2 / 3}
        expected_root = root_scores[metric] * correct_class_index
        expected_correct = correct_class_index
        expected_incorrect = 0

    assert root["metricValue"] == pytest.approx(expected_root)
    np.testing.assert_allclose(
        [correct_leaf["metricValue"], incorrect_leaf["metricValue"]],
        [expected_correct, expected_incorrect], equal_nan=True)


@pytest.mark.parametrize("labels", [[0, 1], ["negative", "positive"]],
                         ids=["numeric", "strings"])
@pytest.mark.parametrize("metric, correct_class_index, expected", [
    (Metrics.FALSE_NEGATIVE_RATE, 1, 0),
    (Metrics.FALSE_POSITIVE_RATE, 0, 0),
    (Metrics.SELECTION_RATE, 0, 0),
    (Metrics.SELECTION_RATE, 1, 1),
    (Metrics.PRECISION_SCORE, 0, 0),
    (Metrics.PRECISION_SCORE, 1, 1),
    (Metrics.RECALL_SCORE, 0, 0),
    (Metrics.RECALL_SCORE, 1, 1),
    (Metrics.F1_SCORE, 0, 0),
    (Metrics.F1_SCORE, 1, 1),
])
def test_binary_tree_retains_inferred_classes_for_single_class_cohort(
        labels, metric, correct_class_index, expected, analyzer_type):
    analyzer = make_inferred_class_analyzer(
        labels, metric, correct_class_index, analyzer_type)
    filters = [{ARG: [0], COLUMN: "feature",
                METHOD: CohortFilterMethods.METHOD_EQUAL}]

    tree = analyzer.compute_error_tree(
        ["feature"], filters, None, min_child_samples=1)

    assert len(tree) == 1
    assert tree[0]["size"] == 20
    assert tree[0]["error"] == 0
    assert tree[0]["metricValue"] == pytest.approx(expected)
