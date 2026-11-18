# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Tests for supported NumPy major versions."""

import numpy as np
import pandas as pd
import pytest
from fairlearn.metrics import MetricFrame, selection_rate
from fairlearn.reductions import DemographicParity, GridSearch
from lightgbm import Dataset
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

from erroranalysis._internal.matrix_filter import bin_data
from raiutils.exceptions import UserConfigValidationException
from raiwidgets.fairness_metric_calculation import (false_positive_rate_wilson,
                                                    precision_wilson)
from responsibleai import RAIInsights
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

    assert precision_wilson(y_true, y_pred) == pytest.approx(
        (0.2077, 0.9385))
    assert false_positive_rate_wilson(y_true, y_pred) == pytest.approx(
        (0.0945, 0.9055))


def test_fairlearn_metric_frame_supports_pandas():
    """Verify the dashboard's Fairlearn version works with Pandas."""
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
    assert metric_frame.overall['selection_rate_bounds'] == pytest.approx(
        (0.2077, 0.9385))


def test_fairlearn_grid_search_supports_pandas():
    """Verify Fairlearn reductions do not use removed Pandas APIs."""
    features = np.array([
        [0.0], [0.2], [0.8], [1.0], [1.2], [1.8], [2.0], [2.2]
    ])
    labels = np.array([0, 0, 0, 1, 0, 1, 1, 1])
    sensitive_features = pd.Series(
        ['a', 'a', 'b', 'b', 'a', 'a', 'b', 'b'])
    mitigator = GridSearch(
        LogisticRegression(solver='liblinear'),
        constraints=DemographicParity(),
        grid_size=3)

    mitigator.fit(
        features, labels, sensitive_features=sensitive_features)

    assert len(mitigator.predictors_) > 0


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


def test_insights_managers_compute_and_roundtrip(tmp_path):
    """Exercise DiCE, explanations and error analysis on each stack."""
    data = load_iris()
    features = pd.DataFrame(data.data[:100], columns=data.feature_names)
    labels = data.target[:100]
    train, test, y_train, y_test = train_test_split(
        features, labels, test_size=4, stratify=labels, random_state=0)
    model = RandomForestClassifier(n_estimators=10, random_state=0)
    model.fit(train, y_train)
    train = train.assign(target=y_train)
    test = test.assign(target=y_test)
    insights = RAIInsights(
        model, train, test, 'target', 'classification')
    insights.counterfactual.add(
        total_CFs=1, desired_class='opposite', feature_importance=False)
    insights.explainer.add()
    insights.error_analysis.add()

    insights.compute()

    counterfactuals = insights.counterfactual.get()[0]
    assert len(counterfactuals.cf_examples_list) == len(test)
    for example in counterfactuals.cf_examples_list:
        assert len(example.final_cfs_df) == 1
        assert (example.final_cfs_df['target'].iloc[0] !=
                example.test_instance_df['target'].iloc[0])
    assert len(insights.explainer.get()) == 1
    assert len(insights.error_analysis.get()) == 1

    save_dir = tmp_path / 'insights'
    insights.save(save_dir)
    restored = RAIInsights.load(save_dir)

    restored_examples = restored.counterfactual.get()[0].cf_examples_list
    assert len(restored_examples) == len(counterfactuals.cf_examples_list)
    for before, after in zip(
            counterfactuals.cf_examples_list, restored_examples):
        serialized = (before.final_cfs_df_sparse
                      if before.final_cfs_df_sparse is not None
                      else before.final_cfs_df)
        pd.testing.assert_frame_equal(
            serialized, after.final_cfs_df, check_dtype=False)
    assert len(restored.explainer.get()) == 1
    assert len(restored.error_analysis.get()) == 1


def test_causal_analysis_compute_and_roundtrip(tmp_path):
    """Exercise EconML and Statsmodels without downloading a dataset."""
    rng = np.random.RandomState(0)
    data = pd.DataFrame(rng.normal(size=(240, 3)),
                        columns=['treatment', 'feature1', 'feature2'])
    data['target'] = (3 * data['treatment'] + data['feature1'] +
                      rng.normal(scale=0.1, size=len(data)))
    insights = RAIInsights(
        None, data.iloc[:200], data.iloc[200:],
        'target', 'regression')
    insights.causal.add(
        ['treatment'], nuisance_model='automl', n_jobs=1, random_state=0)

    insights.compute()

    result = insights.causal.get()[0]
    assert result.global_effects is not None
    assert result.local_effects is not None
    assert len(result.policies) == 1

    save_dir = tmp_path / 'causal'
    insights.save(save_dir)
    restored = RAIInsights.load(save_dir)
    restored_result = restored.causal.get()[0]
    assert restored_result.id == result.id
    assert restored_result.causal_analysis is not None
    pd.testing.assert_frame_equal(
        restored_result.global_effects, result.global_effects)
