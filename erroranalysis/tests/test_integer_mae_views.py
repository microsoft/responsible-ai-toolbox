# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest

from erroranalysis._internal.constants import (ARG, COLUMN, METHOD, PRED_Y,
                                               TRUE_Y, Metrics, ModelTask,
                                               RootKeys)
from erroranalysis._internal.metrics import metric_to_func
from erroranalysis._internal.surrogate_error_tree import compute_metrics_local
from erroranalysis.analyzer import ModelAnalyzer, PredictionsAnalyzer
from raiutils.cohort import CohortFilterMethods

CASES = []
for dtype in (np.int8, np.int16, np.int32, np.int64,
              np.uint8, np.uint16, np.uint32, np.uint64):
    bounds = np.iinfo(dtype)
    CASES.append(pytest.param(np.array([bounds.min, bounds.max], dtype),
                              np.array([bounds.max, bounds.min], dtype),
                              id=np.dtype(dtype).name))
CASES.extend([
    pytest.param(np.array([2**63], np.uint64),
                 np.array([2**63 - 1], np.int64), id='mixed-adjacent'),
    pytest.param(np.array([2**63 - 1], np.int64),
                 np.array([2**63], np.uint64), id='mixed-adjacent-reversed'),
    pytest.param(np.array([2**63 - 1], np.int64),
                 np.array([2**63 - 2], np.int64), id='signed-adjacent'),
    pytest.param(np.array([-2**63], np.int64), np.array([0], np.int64),
                 id='abs-int64-min'),
    pytest.param(np.array([2**62] * 4, np.int64), np.zeros(4, np.int64),
                 id='sum-beyond-int64'),
    pytest.param(np.array([1.25, -2.5]), np.array([0.5, -1.0]),
                 id='fractional-control'),
])


def expected_errors(predictions, labels):
    # Independent Python arithmetic; no production helper in the oracle.
    cast = int if np.issubdtype(predictions.dtype, np.integer) else float
    return [abs(cast(p) - cast(y)) for p, y in zip(predictions, labels)]


class IndexedModel:
    def __init__(self, predictions):
        self.predictions = predictions

    def predict(self, dataset):
        rows = np.asarray(dataset)[:, 2].astype(int)
        return self.predictions[rows]


def make_analyzer(kind, predictions, labels):
    size = len(labels)
    predictions = np.tile(predictions, 4)
    labels = np.tile(labels, 4)
    dataset = pd.DataFrame({
        'first': np.repeat([0, 0, 1, 1], size),
        'second': np.repeat([0, 1, 0, 1], size),
        'row_id': np.arange(4 * size),
    })
    names = list(dataset.columns)
    source = (predictions if kind == 'predictions'
              else IndexedModel(predictions))
    analyzer_type = (PredictionsAnalyzer if kind == 'predictions'
                     else ModelAnalyzer)
    return analyzer_type(source, dataset, labels, names, ['first', 'second'],
                         model_task=ModelTask.REGRESSION,
                         metric=Metrics.MEAN_ABSOLUTE_ERROR)


@pytest.mark.parametrize('predictions,labels', CASES)
@pytest.mark.parametrize('kind', ['predictions', 'model'])
@pytest.mark.parametrize('features', [['first', None], ['first', 'second']])
def test_integer_mae_public_heatmaps(predictions, labels, kind, features):
    errors = expected_errors(predictions, labels)
    expected = sum(errors) / len(errors)
    analyzer = make_analyzer(kind, predictions, labels)
    heatmap = analyzer.compute_matrix(features, [], [])
    cells = [cell for row in heatmap['matrix'] for cell in row]
    assert len(cells) == (2 if features[1] is None else 4)
    assert sum(cell['count'] for cell in cells) == 4 * len(labels)
    for cell in cells:
        assert cell['metricValue'] == expected


@pytest.mark.parametrize('predictions,labels', CASES)
@pytest.mark.parametrize('kind', ['predictions', 'model'])
def test_integer_mae_public_root_stats(predictions, labels, kind):
    errors = expected_errors(predictions, labels)
    analyzer = make_analyzer(kind, predictions, labels)
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == (
        sum(errors) / len(errors))


@pytest.mark.parametrize('predictions,labels', CASES)
def test_integer_mae_tree_metric_and_total(predictions, labels):
    errors = expected_errors(predictions, labels)
    frame = pd.DataFrame({PRED_Y: predictions, TRUE_Y: labels})
    metric, _, total = compute_metrics_local(
        frame, Metrics.MEAN_ABSOLUTE_ERROR, len(labels), None)
    assert metric == sum(errors) / len(errors)
    assert total == sum(errors)


@pytest.mark.parametrize('labels,predictions', [
    ([], []), ([1, 2], [1]), ([float('nan')], [0.0])])
def test_mae_retains_invalid_input_errors(labels, predictions):
    with pytest.raises(ValueError):
        metric_to_func[Metrics.MEAN_ABSOLUTE_ERROR](labels, predictions)


@pytest.mark.parametrize('kind', ['predictions', 'model'])
@pytest.mark.parametrize('features', [['first', None], ['first', 'second']])
@pytest.mark.parametrize('retained', [0, 1, 2])
def test_filtered_integer_mae_heatmaps(kind, features, retained):
    predictions = np.array([2**63, 2**63 + 2], np.uint64)
    labels = np.array([2**63 - 1, 2**63 - 1], np.int64)
    analyzer = make_analyzer(kind, predictions, labels)
    # Categorical filters use category indexes; use a numeric column to select
    # an empty cohort instead of supplying an invalid third category index.
    column = 'first' if retained < 2 else 'row_id'
    value = retained if retained < 2 else -1
    filters = [{ARG: [value], COLUMN: column,
                METHOD: CohortFilterMethods.METHOD_EQUAL}]
    heatmap = analyzer.compute_matrix(features, filters, [])
    cells = [cell for row in heatmap['matrix'] for cell in row]
    assert sum(cell['count'] for cell in cells) == (4 if retained < 2 else 0)
    for cell in cells:
        assert cell['metricValue'] == (2.0 if cell['count'] else 0.0)


def test_multioutput_mae_keeps_existing_behavior():
    # Integer fast path is deliberately single-output; preserve existing shape
    # handling rather than broadcasting or inventing an output aggregation.
    metric = metric_to_func[Metrics.MEAN_ABSOLUTE_ERROR]
    assert metric([[1.5, 2.5]], [[0.5, 0.5]]) == 1.5
