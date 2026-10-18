# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.cohort_filter import FilterDataWithCohortFilters
from erroranalysis._internal.constants import ModelTask, RootKeys
from erroranalysis.analyzer import ModelAnalyzer, PredictionsAnalyzer


@pytest.mark.parametrize("nested_in", ["filters", "composite_filters"])
@pytest.mark.parametrize("task, column, truth, predictions, expected_value", [
    (ModelTask.CLASSIFICATION, "Classification outcome", [0, 0, 1, 1],
     [0, 1, 0, 1], 1),
    (ModelTask.REGRESSION, "Regression error", [0., 1., 2., 3.],
     [0., 3., 2., 3.], 2),
])
def test_nested_derived_cohort_columns(
        nested_in, task, column, truth, predictions, expected_value):
    atom = {"column": column, "method": "equal", "arg": [expected_value]}
    nested = [{"operation": "and", "compositeFilters": [
        {"operation": "or", "compositeFilters": [atom]},
        {"column": "row", "method": "greater", "arg": [0]},
    ]}]
    cohort = FilterDataWithCohortFilters(
        None, pd.DataFrame({"row": [0, 1, 2, 3]}), ["row"], [], [],
        np.array(truth), np.array(predictions), task,
        [0, 1] if task == ModelTask.CLASSIFICATION else None)
    args = {"filters": [], "composite_filters": []}
    args[nested_in] = nested

    actual = cohort.filter_data_from_cohort(
        **args, include_original_columns_only=True)

    assert actual.to_dict("list") == {"row": [1]}


@pytest.mark.parametrize("truth, predictions", [
    ([0, 1, 0, 1], [1, 1, 0, 0]),
    (["no", "yes", "no", "yes"], ["yes", "yes", "no", "no"]),
])
def test_classification_list_residuals_and_root_stats(truth, predictions):
    analyzer = PredictionsAnalyzer(
        predictions, pd.DataFrame({"row": range(4)}), truth, ["row"], [],
        model_task=ModelTask.CLASSIFICATION)

    np.testing.assert_array_equal(
        analyzer.get_diff(), [True, False, False, True])
    assert analyzer.get_diff().dtype == np.dtype(bool)
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 50


@pytest.mark.parametrize("analyzer_type", [PredictionsAnalyzer, ModelAnalyzer])
@pytest.mark.parametrize("dtype", [np.uint8, np.uint16, np.uint32, np.uint64])
def test_unsigned_regression_residuals_are_signed(analyzer_type, dtype):
    truth = np.array([2, 3], dtype=dtype)
    predictions = np.array([1, 4], dtype=dtype)

    class FixedModel:
        def predict(self, data):
            return predictions.copy()

    value = FixedModel() if analyzer_type is ModelAnalyzer else predictions
    analyzer = analyzer_type(
        value, pd.DataFrame({"row": [0, 1]}), truth, ["row"], [],
        model_task=ModelTask.REGRESSION)

    np.testing.assert_array_equal(analyzer.get_diff(), [-1, 1])


def test_uint64_regression_residuals_preserve_integer_precision():
    truth = np.array([2**63 + 2, 2**64 - 1], dtype=np.uint64)
    predictions = np.array([2**63 + 1, 0], dtype=np.uint64)
    analyzer = PredictionsAnalyzer(
        predictions, pd.DataFrame({"row": [0, 1]}), truth, ["row"], [],
        model_task=ModelTask.REGRESSION)

    assert analyzer.get_diff().tolist() == [-1, -(2**64 - 1)]


@pytest.mark.parametrize("dtype", [np.uint8, np.uint16, np.uint32, np.uint64])
def test_unsigned_regression_cohort_errors_in_both_directions(dtype):
    cohort = FilterDataWithCohortFilters(
        None, pd.DataFrame({"row": [0, 1, 2]}), ["row"], [], [],
        np.array([2, 3, 1], dtype=dtype),
        np.array([1, 4, 1], dtype=dtype), ModelTask.REGRESSION)
    filters = [{"column": "Regression error", "method": "equal", "arg": [1]}]

    actual = cohort.filter_data_from_cohort(filters, [], True)

    assert actual["row"].tolist() == [0, 1]


def test_unsigned_regression_cohort_preserves_uint64_precision():
    truth = np.array([2**63 + 2, 2**64 - 1], dtype=np.uint64)
    predictions = np.array([2**63 + 1, 0], dtype=np.uint64)
    cohort = FilterDataWithCohortFilters(
        None, pd.DataFrame({"row": [0, 1]}), ["row"], [], [],
        truth, predictions, ModelTask.REGRESSION)
    filters = [{"column": "Regression error", "method": "less", "arg": [2]}]

    errors = cohort._compute_regression_error_data(truth, predictions)
    actual = cohort.filter_data_from_cohort(filters, [], True)

    assert errors == [1, 2**64 - 1]
    assert actual["row"].tolist() == [0]
