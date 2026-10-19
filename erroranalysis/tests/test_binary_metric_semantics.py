# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Check binary metric and cohort semantics against counted observations."""

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.cohort_filter import FilterDataWithCohortFilters
from erroranalysis._internal.constants import (ARG, COLUMN, METHOD,
                                               CohortFilterMethods, ModelTask)
from erroranalysis._internal.metrics import (false_negative_rate,
                                             false_positive_rate,
                                             selection_rate)


@pytest.mark.parametrize("classes", [
    [0, 1], [1, 0], ["negative", "positive"], ["positive", "negative"],
])
@pytest.mark.parametrize("metric, expected", [
    (false_negative_rate, 3 / 5),
    (false_positive_rate, 1 / 6),
    (selection_rate, 3 / 11),
])
def test_binary_metrics_use_second_class_as_positive(
        classes, metric, expected):
    negative, positive = classes
    # TN=5, FP=1, FN=3, TP=2. Neither errors nor class counts are symmetric.
    true_y = np.array([negative] * 6 + [positive] * 5)
    pred_y = np.array([negative] * 5 + [positive] +
                      [negative] * 3 + [positive] * 2)

    assert metric(true_y, pred_y, classes) == pytest.approx(expected)


@pytest.mark.parametrize("metric, expected", [
    (false_negative_rate, 3 / 5),
    (false_positive_rate, 1 / 6),
    (selection_rate, 3 / 11),
])
def test_binary_metrics_default_to_sorted_class_order(metric, expected):
    true_y = np.array([0] * 6 + [1] * 5)
    pred_y = np.array([0] * 5 + [1] + [0] * 3 + [1] * 2)

    assert metric(true_y, pred_y) == pytest.approx(expected)


@pytest.mark.parametrize("metric, expected", [
    (false_negative_rate, 1 / 6),
    (false_positive_rate, 3 / 5),
    (selection_rate, 8 / 11),
])
def test_binary_metrics_respect_reversed_declared_class_order(
        metric, expected):
    true_y = np.array([0] * 6 + [1] * 5)
    pred_y = np.array([0] * 5 + [1] + [0] * 3 + [1] * 2)

    assert metric(true_y, pred_y, [1, 0]) == pytest.approx(expected)


@pytest.mark.parametrize("true_label, pred_label, expected", [
    (0, 0, [np.nan, 0.0, 0.0]),
    (1, 1, [0.0, np.nan, 1.0]),
    (0, 1, [np.nan, 1.0, 1.0]),
    (1, 0, [1.0, np.nan, 0.0]),
])
def test_binary_metrics_single_class_subsets(true_label, pred_label, expected):
    true_y = np.full(4, true_label)
    pred_y = np.full(4, pred_label)

    # An absent true class has an undefined rate; retain NumPy's NaN behavior.
    with np.errstate(divide="ignore", invalid="ignore"):
        actual = [metric(true_y, pred_y, [0, 1]) for metric in
                  [false_negative_rate, false_positive_rate, selection_rate]]

    assert actual == pytest.approx(expected, nan_ok=True)


@pytest.mark.parametrize("classes", [[0, 1], [1, 0], ["no", "yes"]])
@pytest.mark.parametrize("outcome, expected_row", [
    (0, "true-negative"),
    (1, "false-positive"),
    (2, "false-negative"),
    (3, "true-positive"),
])
def test_binary_cohort_filters_select_requested_outcome(
        classes, outcome, expected_row):
    negative, positive = classes
    dataset = pd.DataFrame({"row": ["true-negative", "false-positive",
                                    "false-negative", "true-positive"]})
    cohort_filter = FilterDataWithCohortFilters(
        model=None,
        dataset=dataset,
        features=["row"],
        categorical_features=[],
        categories=[],
        true_y=np.array([negative, negative, positive, positive]),
        pred_y=np.array([negative, positive, negative, positive]),
        model_task=ModelTask.CLASSIFICATION,
        classes=classes)
    filters = [{COLUMN: "Classification outcome", ARG: [outcome],
                METHOD: CohortFilterMethods.METHOD_INCLUDES}]

    actual = cohort_filter.filter_data_from_cohort(
        filters, [], include_original_columns_only=True)

    assert actual["row"].tolist() == [expected_row]
