# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.cohort_filter import FilterDataWithCohortFilters
from erroranalysis._internal.constants import PRED_Y, TRUE_Y, ModelTask
from erroranalysis._internal.surrogate_error_tree import \
    get_regression_metric_data
from erroranalysis._internal.utils import compute_regression_residuals
from erroranalysis.analyzer import ModelAnalyzer, PredictionsAnalyzer


class FixedModel:
    def __init__(self, predictions):
        self.predictions = predictions

    def predict(self, dataset):
        return self.predictions.copy()


CASES = []
for dtype in (np.int8, np.int16, np.int32, np.int64,
              np.uint8, np.uint16, np.uint32, np.uint64):
    bounds = np.iinfo(dtype)
    CASES.append((np.array([bounds.min, bounds.max, bounds.min], dtype),
                  np.array([bounds.max, bounds.min, 0], dtype)))
CASES.extend([
    (np.array([2**63, 2**64 - 1], np.uint64),
     np.array([2**63 - 1, -2**63], np.int64)),
    (np.array([2**63 - 1, -2**63], np.int64),
     np.array([2**63, 2**64 - 1], np.uint64)),
    (np.array([2**62] * 4, np.int64), np.zeros(4, np.int64)),
])


@pytest.mark.parametrize('predictions,labels', CASES)
def test_integer_residuals_agree_across_analyzers_cohorts_and_tree(
        predictions, labels):
    expected = [int(p) - int(y) for p, y in zip(predictions, labels)]
    expected_absolute = [abs(value) for value in expected]
    dataset = pd.DataFrame({'feature': range(len(labels))})
    analyzers = [
        PredictionsAnalyzer(predictions, dataset, labels, ['feature'], [],
                            model_task=ModelTask.REGRESSION),
        ModelAnalyzer(FixedModel(predictions), dataset, labels,
                      ['feature'], [], model_task=ModelTask.REGRESSION),
    ]
    residuals = compute_regression_residuals(predictions, labels)
    assert residuals.tolist() == expected
    for analyzer in analyzers:
        assert analyzer.get_diff().tolist() == expected
        assert np.abs(analyzer.get_diff()).tolist() == expected_absolute
    cohort = FilterDataWithCohortFilters._compute_regression_error_data(
        None, labels, predictions)
    assert cohort == expected_absolute
    frame = pd.DataFrame({PRED_Y: predictions, TRUE_Y: labels})
    pred_y, true_y, total_error = get_regression_metric_data(frame)
    assert pred_y.tolist() == predictions.tolist()
    assert true_y.tolist() == labels.tolist()
    assert total_error == sum(expected_absolute)


def test_float_residuals_and_total_keep_fractional_values():
    predictions = np.array([1.25, -2.5])
    labels = np.array([0.5, -1.0])
    np.testing.assert_array_equal(
        compute_regression_residuals(predictions, labels), [0.75, -1.5])
    frame = pd.DataFrame({PRED_Y: predictions, TRUE_Y: labels})
    assert get_regression_metric_data(frame)[2] == 2.25
