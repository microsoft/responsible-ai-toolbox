# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Tests for supported NumPy major versions."""

import numpy as np
import pandas as pd
import pytest
from fairlearn.metrics import MetricFrame, selection_rate
from lightgbm import Dataset

from erroranalysis._internal.matrix_filter import bin_data
from raiutils.exceptions import UserConfigValidationException
from raiwidgets.fairness_metric_calculation import (false_positive_rate_wilson,
                                                    precision_wilson)
from responsibleai._data_validations import \
    _validate_unique_operation_on_categorical_columns


def test_numpy_major_version_is_supported():
    """Verify the compatibility test runs on a supported NumPy major."""
    assert int(np.__version__.split('.')[0]) in (1, 2)


def test_numpy_nan_is_supported_in_categorical_validation():
    """Verify categorical validation handles the stable np.nan alias."""
    train_data = pd.DataFrame({'category': ['a', np.nan], 'target': [0, 1]})
    test_data = pd.DataFrame({'category': ['a', 'b'], 'target': [0, 1]})

    with pytest.raises(UserConfigValidationException):
        _validate_unique_operation_on_categorical_columns(
            train_data=train_data,
            test_data=test_data,
            categorical_features=['category'])


def test_fairness_metrics_accept_numpy_arrays():
    """Verify fairness metrics produce stable results for NumPy arrays."""
    y_true = np.array([0, 0, 1, 1])
    y_pred = np.array([0, 1, 1, 1])

    assert precision_wilson(y_true, y_pred) == (0.2077, 0.9385)
    assert false_positive_rate_wilson(y_true, y_pred) == (0.0945, 0.9055)


def test_fairlearn_metric_frame_supports_pandas_2():
    """Verify the dashboard's Fairlearn version works with Pandas 2."""
    metric_frame = MetricFrame(
        metrics={
            'selection_rate': selection_rate,
            'selection_rate_bounds': precision_wilson
        },
        y_true=[0, 1, 0, 1],
        y_pred=[0, 1, 1, 1],
        sensitive_features=['a', 'a', 'b', 'b'])

    assert metric_frame.overall['selection_rate'] == 0.75
    assert metric_frame.by_group['selection_rate'].to_dict() == {
        'a': 0.5, 'b': 1.0}
    assert metric_frame.overall['selection_rate_bounds'] == (
        0.2077, 0.9385)


@pytest.mark.parametrize('labels', [
    [0, 0, 1, 1],
    pd.Series([0, 0, 1, 1], dtype='int64')
])
def test_lightgbm_dataset_accepts_array_like_labels(labels):
    """Verify LightGBM uses NumPy 2 compatible array conversion."""
    dataset = Dataset(
        np.array([[0.0], [1.0], [2.0], [3.0]]),
        label=labels)

    dataset.construct()
    assert dataset.num_data() == 4


def test_quantile_binning_uses_supported_categorical_api():
    """Verify quantile binning works across supported Pandas versions."""
    data = pd.DataFrame({'feature': np.arange(10, dtype=float)})

    binned = bin_data(
        data, feat='feature', bins=4, quantile_binning=True)

    assert isinstance(binned.dtype, pd.CategoricalDtype)
    assert len(binned.cat.categories) == 4
