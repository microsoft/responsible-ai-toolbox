# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pytest
from pytest import approx

from raiwidgets.fairness_metric_calculation import (compute_wilson_bounds,
                                                    false_negative_rate_wilson,
                                                    false_positive_rate_wilson,
                                                    mae_standard_normal,
                                                    mse_standard_normal,
                                                    precision_wilson,
                                                    recall_wilson,
                                                    true_negative_rate_wilson)


@pytest.fixture()
def sample_binary_data():
    return np.array([0, 1, 1, 1, 0, 1, 0, 1, 0, 0]),\
        np.array([0, 1, 1, 1, 1, 1, 1, 0, 0, 0])


@pytest.fixture()
def sample_continuous_data():
    return np.array([25, 36, 12, 10, 52, 64, 34, 36, 11, 17]),\
        np.array([37, 29, 20, 2, 12, 75, 53, 64, 23, 29])


def test_compute_wilson_bounds():
    assert compute_wilson_bounds(0.5, 100) == (0.4038, 0.5962)
    assert compute_wilson_bounds(0.7, 100) == (0.6042, 0.7811)


def test_recall_wilson(sample_binary_data):
    y_true, y_pred = sample_binary_data
    assert recall_wilson(y_true, y_pred) == (0.3755, 0.9638)


def test_precision_wilson(sample_binary_data):
    y_true, y_pred = sample_binary_data
    assert precision_wilson(y_true, y_pred) == (0.3, 0.9032)


def test_false_positive_rate_wilson(sample_binary_data):
    y_true, y_pred = sample_binary_data
    assert false_positive_rate_wilson(y_true, y_pred) == (0.1176, 0.7693)


def test_true_negative_rate_wilson(sample_binary_data):
    y_true, y_pred = sample_binary_data
    assert true_negative_rate_wilson(y_true, y_pred) == (0.2307, 0.8824)


def test_false_negative_rate_wilson(sample_binary_data):
    y_true, y_pred = sample_binary_data
    assert false_negative_rate_wilson(y_true, y_pred) == (0.0362, 0.6245)


def test_mse_standard_normal_binary(sample_binary_data):
    y_true, y_pred = sample_binary_data
    mse = mse_standard_normal(y_true, y_pred)
    assert mse == approx((0.0160, 0.5840), rel=1e-3, abs=1e-3)


def test_mae_standard_normal_binary(sample_binary_data):
    y_true, y_pred = sample_binary_data
    mae = mae_standard_normal(y_true, y_pred)
    assert mae == approx((0.0160, 0.5840), rel=1e-3, abs=1e-3)


def test_mse_standard_normal_continuous(sample_continuous_data):
    y_true, y_pred = sample_continuous_data
    mse = mse_standard_normal(y_true, y_pred)
    assert mse == approx((57.7926, 637.2074), rel=1e-3, abs=1e-3)


def test_mae_standard_normal_continuous(sample_continuous_data):
    y_true, y_pred = sample_continuous_data
    mae = mae_standard_normal(y_true, y_pred)
    assert mae == approx((9.4708, 21.9292), rel=1e-3, abs=1e-3)
