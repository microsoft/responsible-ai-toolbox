# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.constants import ModelTask
from erroranalysis.analyzer import ModelAnalyzer, PredictionsAnalyzer


class FixedPredictionModel:
    def __init__(self, predictions):
        self.predictions = predictions

    def predict(self, dataset):
        return self.predictions.copy()


def make_analyzers(true_y, pred_y, model_task):
    dataset = pd.DataFrame({"feature": range(len(true_y))})
    model_analyzer = ModelAnalyzer(
        FixedPredictionModel(pred_y), dataset, true_y, ["feature"], [],
        model_task=model_task)
    predictions_analyzer = PredictionsAnalyzer(
        pred_y, dataset, true_y, ["feature"], [], model_task=model_task)
    return model_analyzer, predictions_analyzer


def test_regression_analyzers_return_signed_residuals():
    true_y = np.array([2.0, -1.0, 3.0, 0.0])
    pred_y = np.array([2.0, 4.0, 1.0, -0.5])
    expected = np.array([0.0, 5.0, -2.0, -0.5])
    analyzers = make_analyzers(true_y, pred_y, ModelTask.REGRESSION)

    for analyzer in analyzers:
        residuals = analyzer.get_diff()

        np.testing.assert_array_equal(residuals, expected)
        assert np.issubdtype(residuals.dtype, np.floating)


@pytest.mark.parametrize("true_y, pred_y", [
    (np.array([0, 1, 0, 1]), np.array([1, 1, 0, 0])),
    (np.array(["a", "b", "a", "b"]),
     np.array(["b", "b", "a", "a"])),
], ids=["numeric-labels", "string-labels"])
def test_classification_analyzers_return_error_indicators(true_y, pred_y):
    expected = np.array([True, False, False, True])
    analyzers = make_analyzers(true_y, pred_y, ModelTask.CLASSIFICATION)

    for analyzer in analyzers:
        errors = analyzer.get_diff()

        np.testing.assert_array_equal(errors, expected)
        assert errors.dtype == np.dtype(bool)
