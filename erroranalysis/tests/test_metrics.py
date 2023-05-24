# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pytest

from erroranalysis._internal.constants import (
    Metrics, binary_classification_metrics, multiclass_classification_metrics,
    regression_metrics)
from erroranalysis._internal.metrics import metric_to_func


class TestMetrics:
    @pytest.mark.parametrize('metric', binary_classification_metrics)
    def test_binary_classification_metrics(self, metric):
        y_true = np.array([1, 0, 1, 1, 0, 1])
        y_pred = np.array([0, 0, 1, 1, 0, 1])
        if metric == Metrics.ERROR_RATE:
            diff = y_true != y_pred
            metric_value = metric_to_func[metric](y_true, y_pred, diff)
        else:
            metric_value = metric_to_func[metric](y_true, y_pred)
        assert isinstance(metric_value, float)

    @pytest.mark.parametrize('metric', [Metrics.FALSE_NEGATIVE_RATE,
                                        Metrics.FALSE_POSITIVE_RATE,
                                        Metrics.SELECTION_RATE])
    def test_binary_classification_metrics_single_class(self, metric):
        y_true = np.array([0, 0, 0, 0, 0, 0])
        y_pred = np.array([0, 0, 0, 0, 0, 0])
        classes = [0, 1]
        with pytest.raises(ValueError):
            metric_to_func[metric](y_true, y_pred)
        assert isinstance(metric_to_func[metric](y_true, y_pred, classes),
                          float)

    @pytest.mark.parametrize('metric', regression_metrics)
    def test_regression_metrics(self, metric):
        y_true = np.array([1.1, 0.9, 1.3, 1.0, 1.4, 5.0])
        y_pred = np.array([0.1, 0.9, 1.1, 1.1, 1.0, 1.0])
        assert isinstance(metric_to_func[metric](y_true, y_pred), float)

    @pytest.mark.parametrize('metric', multiclass_classification_metrics)
    def test_multiclass_classification_metrics(self, metric):
        y_true = np.array([1, 0, 2, 1, 0, 1])
        y_pred = np.array([0, 0, 2, 1, 0, 1])
        if metric == Metrics.ERROR_RATE:
            diff = y_true != y_pred
            metric_value = metric_to_func[metric](y_true, y_pred, diff)
        else:
            metric_value = metric_to_func[metric](y_true, y_pred)
        assert isinstance(metric_value, float)
