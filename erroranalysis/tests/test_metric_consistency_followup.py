# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import datetime as dt
from decimal import Decimal
from fractions import Fraction
from zoneinfo import ZoneInfo

import numpy as np
import pandas as pd
import pytest
from scipy import sparse

from erroranalysis._internal.cohort_filter import (FilterDataWithCohortFilters,
                                                   filter_from_cohort)
from erroranalysis._internal.constants import (ARG, COLUMN, METHOD, TRUE_Y,
                                               Metrics, ModelTask, RootKeys)
from erroranalysis._internal.metrics import get_ordered_classes, metric_to_func
from erroranalysis.analyzer import ModelAnalyzer, PredictionsAnalyzer
from raiutils.cohort import CohortFilterMethods


class FixedPredictionModel:
    def __init__(self, predictions):
        self.predictions = predictions

    def predict(self, dataset):
        return self.predictions[:len(dataset)].copy()


class GroupPredictionModel:
    def predict(self, dataset):
        groups = np.asarray(dataset)[:, 0]
        return np.where(groups == 0, 0, 56).astype(np.uint8)


class NumpyIndexingModel:
    def predict(self, dataset):
        return dataset[:, 0] % 2


class MixedTypeModel:
    def predict(self, dataset):
        values = np.asarray(dataset, dtype=object)
        if not isinstance(values[0, 0], (int, np.integer)):
            raise ValueError("Numeric categories were converted to strings")
        return (values[:, 0].astype(int) % 2).astype(int)


class RejectFullDatasetModel:
    def __init__(self):
        self.prediction_sizes = []

    def predict(self, dataset):
        values = np.asarray(dataset)[:, 0]
        if 999 in values:
            raise ValueError("Excluded row should not be predicted")
        self.prediction_sizes.append(len(values))
        return (values % 2).astype(int)


class RejectFullDatasetConstantModel(RejectFullDatasetModel):
    def predict(self, dataset):
        values = np.asarray(dataset)[:, 0]
        if 999 in values:
            raise ValueError("Excluded row should not be predicted")
        self.prediction_sizes.append(len(values))
        return np.zeros(len(values), dtype=int)


class OutOfVocabularyModel:
    classes_ = np.array([0, 1])

    def predict(self, dataset):
        values = np.asarray(dataset)
        return np.where(np.isin(values[:, 1], [2, 7]), 2, 0)


class BinaryMetadataModel:
    classes_ = np.array([0, 1])

    def predict(self, dataset):
        return np.zeros(len(dataset), dtype=int)


class ReverseBinaryMetadataModel(BinaryMetadataModel):
    classes_ = np.array([1, 0])


class StringMetadataModel(BinaryMetadataModel):
    classes_ = np.array(["no", "yes"])


class MulticlassMetadataModel:
    classes_ = np.array([0, 1, 2])

    def predict(self, dataset):
        rows = np.asarray(dataset)[:, 0]
        return np.where(rows < 2, 0, np.where(rows % 2 == 0, 1, 2))


class ColumnPredictionModel:
    def predict(self, dataset):
        return (np.asarray(dataset)[:, 0] % 2).astype(int)[:, None]


class CountingPredictionModel:
    def __init__(self, predictions):
        self.predictions = np.asarray(predictions)
        self.calls = 0

    def predict(self, dataset):
        self.calls += 1
        return self.predictions[:len(dataset)]


def make_analyzer(kind, predictions, dataset, labels, metric, classes=None):
    analyzer_type = (PredictionsAnalyzer if kind == "predictions"
                     else ModelAnalyzer)
    source = predictions if kind == "predictions" else FixedPredictionModel(
        predictions)
    return analyzer_type(
        source,
        dataset,
        labels,
        list(dataset.columns),
        [],
        model_task=(ModelTask.CLASSIFICATION if classes is not None
                    else ModelTask.REGRESSION),
        metric=metric,
        classes=classes,
    )


@pytest.mark.parametrize("kind", ["predictions", "model"])
def test_unsigned_regression_tree_trains_on_exact_residuals(kind):
    labels = np.array([200] * 20 + [0] * 20, dtype=np.uint8)
    predictions = np.array([0] * 20 + [56] * 20, dtype=np.uint8)
    dataset = pd.DataFrame({"group": [0] * 20 + [1] * 20})
    if kind == "predictions":
        analyzer = PredictionsAnalyzer(
            predictions, dataset, labels, ["group"], [],
            model_task=ModelTask.REGRESSION,
            metric=Metrics.MEAN_ABSOLUTE_ERROR)
    else:
        analyzer = ModelAnalyzer(
            GroupPredictionModel(), dataset, labels, ["group"], [],
            model_task=ModelTask.REGRESSION,
            metric=Metrics.MEAN_ABSOLUTE_ERROR)

    tree = analyzer.compute_error_tree(
        ["group"], None, None, max_depth=1, num_leaves=2,
        min_child_samples=1)

    assert len(tree) == 3
    assert sorted(node["metricValue"] for node in tree[1:]) == [56, 200]


@pytest.mark.parametrize("kind", ["predictions", "model"])
@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_filtered_binary_views_resolve_encoded_class_vocabulary(kind, view):
    labels = np.array([0] * 20 + [1] * 20)
    predictions = np.array([0] * 40)
    dataset = pd.DataFrame({"feature": [0] * 20 + [1] * 20})
    analyzer = make_analyzer(
        kind, predictions, dataset, labels, Metrics.SELECTION_RATE,
        classes=["negative", "positive"])
    filters = [{
        ARG: [0],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    if view == "heatmap":
        heatmap = analyzer.compute_matrix(
            ["feature", None], filters, None)
        assert heatmap["matrix"][0][0]["metricValue"] == 0
    else:
        tree = analyzer.compute_error_tree(
            ["feature"], filters, None, min_child_samples=1)
        assert tree[0]["metricValue"] == 0


@pytest.mark.parametrize("kind", ["predictions", "model"])
def test_nullable_integer_mae_remains_exact(kind):
    labels = pd.Series([2**63 - 2, 2**63 - 3], dtype="Int64")
    predictions = pd.Series([2**63 - 1, 2**63 - 2], dtype="Int64")
    dataset = pd.DataFrame({"feature": [0, 1]})
    analyzer = make_analyzer(
        kind, predictions, dataset, labels, Metrics.MEAN_ABSOLUTE_ERROR)

    root = analyzer.compute_root_stats()
    heatmap = analyzer.compute_matrix(["feature", None], None, None)

    assert root[RootKeys.METRIC_VALUE] == 1
    assert all(cell["metricValue"] == 1 for cell in heatmap["matrix"][0])


@pytest.mark.parametrize("kind", ["predictions", "model"])
def test_large_python_integer_list_residuals_remain_exact(kind):
    labels = [2**63 - 1, -2]
    predictions = [2**63, -1]
    dataset = pd.DataFrame({"feature": [0, 1]})
    analyzer = make_analyzer(
        kind, predictions, dataset, labels, Metrics.MEAN_ABSOLUTE_ERROR)

    residuals = analyzer.get_diff()
    root = analyzer.compute_root_stats()
    heatmap = analyzer.compute_matrix(["feature", None], None, None)

    assert residuals.tolist() == [1, 1]
    assert root[RootKeys.METRIC_VALUE] == 1
    assert all(cell["metricValue"] == 1 for cell in heatmap["matrix"][0])


@pytest.mark.parametrize("dtype,labels,predictions,expected", [
    (object, [np.uint8(200)], [np.uint8(0)], 200),
    (object, [np.int8(0)], [np.int8(-128)], 128),
])
def test_numpy_integer_scalars_in_object_arrays_remain_exact(
        dtype, labels, predictions, expected):
    dataset = pd.DataFrame({"feature": [0]})
    analyzer = PredictionsAnalyzer(
        np.array(predictions, dtype=dtype),
        dataset,
        np.array(labels, dtype=dtype),
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_ABSOLUTE_ERROR,
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == expected


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_column_vector_targets_retain_full_binary_vocabulary(view):
    predictions = np.array([0, 1, 0, 1])
    labels = predictions[:, None]
    dataset = pd.DataFrame({"feature": [0, 0, 1, 1]})
    analyzer = PredictionsAnalyzer(
        predictions,
        dataset,
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=[0, 1],
    )

    if view == "heatmap":
        analyzer.compute_matrix(["feature", None], None, None)
    else:
        analyzer.compute_error_tree(
            ["feature"], None, None, min_child_samples=1)


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_list_dataset_uses_normalized_full_model_input(view):
    dataset = [[0], [1], [2], [3]]
    labels = [0, 1, 0, 1]
    analyzer = ModelAnalyzer(
        NumpyIndexingModel(),
        dataset,
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=[0, 1],
    )

    if view == "heatmap":
        analyzer.compute_matrix(["feature", None], None, None)
    else:
        analyzer.compute_error_tree(
            ["feature"], None, None, min_child_samples=1)


@pytest.mark.parametrize("kind", ["predictions", "model"])
@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_excluded_out_of_vocabulary_predictions_do_not_affect_view(
        kind, view):
    labels = np.array([0] * 8 + [1] * 8)
    predictions = np.array([0] * 7 + [2] + [0] * 8)
    dataset = pd.DataFrame({
        "feature": [0] * 8 + [1] * 8,
        "row_id": np.arange(16),
    })
    analyzer_type = (PredictionsAnalyzer if kind == "predictions"
                     else ModelAnalyzer)
    source = predictions if kind == "predictions" else OutOfVocabularyModel()
    analyzer = analyzer_type(
        source,
        dataset,
        labels,
        ["feature", "row_id"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=[1, 0],
    )
    filters = [{
        ARG: [1],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    if view == "heatmap":
        heatmap = analyzer.compute_matrix(
            ["feature", None], filters, None)
        assert heatmap["matrix"][0][0]["metricValue"] == 1
    else:
        tree = analyzer.compute_error_tree(
            ["feature"], filters, None, min_child_samples=1)
        assert tree[0]["metricValue"] == 1


@pytest.mark.parametrize("kind", ["predictions", "model"])
@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_included_out_of_vocabulary_predictions_are_rejected(kind, view):
    dataset = pd.DataFrame({
        "feature": [0, 0, 1, 1],
        "row_id": np.arange(4),
    })
    labels = np.array([0, 1, 0, 1])
    predictions = np.array([0, 1, 2, 0])
    analyzer_type = (PredictionsAnalyzer if kind == "predictions"
                     else ModelAnalyzer)
    source = predictions if kind == "predictions" else OutOfVocabularyModel()
    analyzer = analyzer_type(
        source,
        dataset,
        labels,
        ["feature", "row_id"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=[1, 0],
    )

    with pytest.raises(ValueError, match="resolved classes"):
        if view == "heatmap":
            analyzer.compute_matrix(["feature", None], None, None)
        else:
            analyzer.compute_error_tree(
                ["feature"], None, None, min_child_samples=1)


@pytest.mark.parametrize("view", ["root", "heatmap", "tree"])
@pytest.mark.parametrize("metric", [
    Metrics.PRECISION_SCORE,
    Metrics.RECALL_SCORE,
    Metrics.F1_SCORE,
])
@pytest.mark.parametrize("classes", [None, [1], [1, 2, 3]])
def test_singleton_positive_class_preserves_sklearn_metric_behavior(
        metric, view, classes):
    analyzer = PredictionsAnalyzer(
        np.ones(4, dtype=int),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        np.ones(4, dtype=int),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
        classes=classes,
    )

    if view == "root":
        assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 1
    elif view == "heatmap":
        heatmap = analyzer.compute_matrix(
            ["feature", None], None, None)
        assert all(
            cell["metricValue"] == 1 for cell in heatmap["matrix"][0])
    else:
        tree = analyzer.compute_error_tree(
            ["feature"], None, None, min_child_samples=1)
        assert tree[0]["metricValue"] == 1


@pytest.mark.parametrize("kind", ["predictions", "model"])
@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_one_class_targets_retain_vocabulary_from_selected_predictions(
        kind, view):
    dataset = pd.DataFrame({"feature": [0] * 20 + [1] * 20})
    labels = np.zeros(40, dtype=int)
    predictions = np.array([0] * 20 + [1] * 20)
    analyzer = make_analyzer(
        kind, predictions, dataset, labels, Metrics.SELECTION_RATE)

    if view == "heatmap":
        heatmap = analyzer.compute_matrix(
            ["feature", None], None, None)
        assert sorted(
            cell["metricValue"] for cell in heatmap["matrix"][0]) == [0, 1]
    else:
        tree = analyzer.compute_error_tree(
            ["feature"], None, None, max_depth=1, num_leaves=2,
            min_child_samples=1)
        assert sorted(node["metricValue"] for node in tree) == [0, 0.5, 1]


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_excluded_out_of_vocabulary_targets_do_not_affect_view(view):
    analyzer = PredictionsAnalyzer(
        [0, 1, 0],
        pd.DataFrame({"feature": [0, 1, 999]}),
        [0, 1, 2],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=[0, 1],
    )
    filters = [{
        ARG: [0, 1],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_RANGE,
    }]

    if view == "heatmap":
        analyzer.compute_matrix(["feature", None], filters, None)
    else:
        analyzer.compute_error_tree(
            ["feature"], filters, None, min_child_samples=1)


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_mixed_type_list_dataset_preserves_values_during_prediction(view):
    dataset = [[0, "a"], [1, "b"], [0, "c"], [1, "d"]]
    analyzer = ModelAnalyzer(
        MixedTypeModel(),
        dataset,
        [0, 1, 0, 1],
        ["numeric", "text"],
        ["text"],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=["negative", "positive"],
    )

    if view == "heatmap":
        analyzer.compute_matrix(["numeric", None], None, None)
    else:
        analyzer.compute_error_tree(
            ["numeric"], None, None, min_child_samples=1)


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_declared_classes_avoid_predicting_excluded_invalid_rows(view):
    dataset = pd.DataFrame({"feature": [0, 1, 999]})
    model = RejectFullDatasetModel()
    analyzer = ModelAnalyzer(
        model,
        dataset,
        [0, 1, 0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=["negative", "positive"],
    )
    filters = [{
        ARG: [0, 1],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_RANGE,
    }]

    if view == "heatmap":
        analyzer.compute_matrix(["feature", None], filters, None)
    else:
        analyzer.compute_error_tree(
            ["feature"], filters, None, min_child_samples=1)

    assert model.prediction_sizes
    assert max(model.prediction_sizes) == 2


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_singleton_display_names_do_not_predict_excluded_rows(view):
    dataset = pd.DataFrame({"feature": [0, 1, 999]})
    model = RejectFullDatasetConstantModel()
    analyzer = ModelAnalyzer(
        model,
        dataset,
        [0, 0, 0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=["negative", "positive"],
    )
    filters = [{
        ARG: [0, 1],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_RANGE,
    }]

    with pytest.raises(ValueError, match="exactly two classes"):
        if view == "heatmap":
            analyzer.compute_matrix(["feature", None], filters, None)
        else:
            analyzer.compute_error_tree(
                ["feature"], filters, None, min_child_samples=1)

    assert model.prediction_sizes
    assert max(model.prediction_sizes) == 2


def test_mixed_incomparable_labels_keep_stable_first_seen_order():
    assert get_ordered_classes(None, [1, "a"], ["b", 1]) == [1, "a", "b"]


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_mixed_incomparable_binary_labels_are_rejected(view):
    analyzer = PredictionsAnalyzer(
        np.array([0, "a", 0, "a"], dtype=object),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        np.array([0, "a", 0, "a"], dtype=object),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )

    with pytest.raises(ValueError, match="mutually comparable"):
        if view == "heatmap":
            analyzer.compute_matrix(["feature", None], None, None)
        else:
            analyzer.compute_error_tree(
                ["feature"], None, None, min_child_samples=1)


def test_mixed_incomparable_binary_outcome_is_rejected():
    analyzer = PredictionsAnalyzer(
        [1, "a", "a", 1],
        pd.DataFrame({"row": [0, 1, 2, 3]}),
        [1, "a", 1, "a"],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )
    filters = [{
        ARG: [0],
        COLUMN: "Classification outcome",
        METHOD: CohortFilterMethods.METHOD_INCLUDES,
    }]

    with pytest.raises(ValueError, match="mutually comparable"):
        filter_from_cohort(
            analyzer, filters, None, include_original_columns_only=True)


def test_mixed_multiclass_outcome_preserves_value_types():
    analyzer = PredictionsAnalyzer(
        [1, "a", "b", 1],
        pd.DataFrame({"row": [0, 1, 2, 3]}),
        [1, "a", 1, "b"],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )
    filters = [{
        ARG: [0],
        COLUMN: "Classification outcome",
        METHOD: CohortFilterMethods.METHOD_INCLUDES,
    }]

    filtered = filter_from_cohort(
        analyzer, filters, None, include_original_columns_only=True)

    assert filtered["row"].tolist() == [0, 1]


def test_outcome_filter_preserves_declared_order_with_oov_prediction():
    analyzer = PredictionsAnalyzer(
        [0, 1, 2, 1],
        pd.DataFrame({"row": [0, 1, 2, 3]}),
        [0, 1, 0, 1],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
        classes=[1, 0],
    )
    filters = [{
        ARG: [0],
        COLUMN: "Classification outcome",
        METHOD: CohortFilterMethods.METHOD_INCLUDES,
    }]

    filtered = filter_from_cohort(
        analyzer, filters, None, include_original_columns_only=True)

    assert filtered["row"].tolist() == [1, 3]


def test_datetime_binary_labels_preserve_dtype():
    labels = np.array(
        ["2025-01-01", "2025-01-02", "2025-01-01", "2025-01-02"],
        dtype="datetime64[ns]")
    analyzer = PredictionsAnalyzer(
        labels.copy(),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0.5
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert all(
        cell["metricValue"] == 0.5 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 0.5


def test_datetime_declared_class_order_is_preserved_across_units():
    jan1 = np.datetime64("2025-01-01", "ns")
    jan2 = np.datetime64("2025-01-02", "ns")
    analyzer = PredictionsAnalyzer(
        np.array([jan2, jan2, jan2, jan2]),
        pd.DataFrame({"row": [0, 1, 2, 3]}),
        np.array([jan1, jan1, jan1, jan2]),
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=[
            pd.Timestamp("2025-01-02"),
            np.datetime64("2025-01-01", "D"),
        ],
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0
    filtered = filter_from_cohort(
        analyzer,
        [{
            ARG: [0],
            COLUMN: "Classification outcome",
            METHOD: CohortFilterMethods.METHOD_INCLUDES,
        }],
        None,
        include_original_columns_only=True,
    )
    assert filtered["row"].tolist() == [3]


def test_nanosecond_temporal_labels_remain_distinct():
    one_ns = pd.Timestamp(1)
    two_ns = pd.Timestamp(2)
    analyzer = PredictionsAnalyzer(
        [two_ns, one_ns, two_ns, one_ns],
        pd.DataFrame({"row": [0, 1, 2, 3]}),
        [two_ns, two_ns, one_ns, one_ns],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
        classes=[two_ns, one_ns],
    )

    filtered = filter_from_cohort(
        analyzer,
        [{
            ARG: [0],
            COLUMN: "Classification outcome",
            METHOD: CohortFilterMethods.METHOD_INCLUDES,
        }],
        None,
        include_original_columns_only=True,
    )

    assert filtered["row"].tolist() == [0]


def test_out_of_pandas_range_numpy_datetimes_remain_supported():
    labels = np.array(
        ["3000-01-01", "3000-01-02"], dtype="datetime64[D]")

    assert metric_to_func[Metrics.SELECTION_RATE](
        labels, labels, classes=labels) == 0.5


def test_nanosecond_temporal_heatmap_preserves_rates():
    first = pd.Timestamp(1)
    second = pd.Timestamp(2)
    analyzer = PredictionsAnalyzer(
        pd.Series([first, second, second, first]),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        pd.Series([first, second, first, second]),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=[first, second],
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)

    assert all(
        cell["metricValue"] == 0.5 for cell in heatmap["matrix"][0])


def test_large_python_integer_labels_are_not_rounded():
    large = 2**63 + 1
    analyzer = PredictionsAnalyzer(
        [-1, large, -1, large],
        pd.DataFrame({"row": [0, 1, 2, 3]}),
        [-1, large, -1, large],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
        classes=[-1, large],
    )

    filtered = filter_from_cohort(
        analyzer,
        [{
            ARG: [0],
            COLUMN: "Classification outcome",
            METHOD: CohortFilterMethods.METHOD_INCLUDES,
        }],
        None,
        include_original_columns_only=True,
    )

    assert filtered["row"].tolist() == [0, 2]


@pytest.mark.parametrize("metric,expected", [
    (Metrics.PRECISION_SCORE, 0.5),
    (Metrics.RECALL_SCORE, 1),
    (Metrics.F1_SCORE, 2 / 3),
])
@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_filtered_binary_prf_preserves_full_multiclass_vocabulary(
        metric, expected, view):
    analyzer = PredictionsAnalyzer(
        [0, 1, 1, 1, 1],
        pd.DataFrame({"feature": [0, 1, 1, 1, 1]}),
        [0, 1, 2, 1, 2],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
    )
    filters = [{
        ARG: [1],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    if view == "heatmap":
        heatmap = analyzer.compute_matrix(
            ["feature", None], filters, None)
        assert heatmap["matrix"][0][0]["metricValue"] == expected
    else:
        tree = analyzer.compute_error_tree(
            ["feature"], filters, None, min_child_samples=1)
        assert tree[0]["metricValue"] == expected


@pytest.mark.parametrize("kind", ["predictions", "model"])
@pytest.mark.parametrize("metric,expected", [
    (Metrics.PRECISION_SCORE, 1),
    (Metrics.RECALL_SCORE, 0.5),
    (Metrics.F1_SCORE, 2 / 3),
])
@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_filtered_prf_uses_inferred_binary_class_order(
        kind, metric, expected, view):
    dataset = pd.DataFrame({"row": np.arange(6), "group": np.zeros(6)})
    labels = np.ones(6, dtype=int)
    predictions = np.array([0, 0, 1, 2, 1, 2])
    analyzer_type = (PredictionsAnalyzer if kind == "predictions"
                     else ModelAnalyzer)
    source = (predictions if kind == "predictions"
              else MulticlassMetadataModel())
    analyzer = analyzer_type(
        source,
        dataset,
        labels,
        ["row", "group"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
    )
    filters = [{
        ARG: [2, 5],
        COLUMN: "row",
        METHOD: CohortFilterMethods.METHOD_RANGE,
    }]
    expected = 0

    if view == "heatmap":
        heatmap = analyzer.compute_matrix(["group", None], filters, None)
        assert heatmap["matrix"][0][0]["metricValue"] == expected
    else:
        tree = analyzer.compute_error_tree(
            ["group"], filters, None, min_child_samples=1)
        assert tree[0]["metricValue"] == expected


@pytest.mark.parametrize("metric,expected", [
    (Metrics.SELECTION_RATE, 0),
    (Metrics.FALSE_POSITIVE_RATE, 0),
    (Metrics.FALSE_NEGATIVE_RATE, np.nan),
])
@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_filtered_singleton_binary_rates_use_absent_positive_class(
        metric, expected, view):
    analyzer = PredictionsAnalyzer(
        [0, 0, 1, 1],
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        [0, 0, 0, 0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
    )
    filters = [{
        ARG: [0],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    if view == "heatmap":
        value = analyzer.compute_matrix(
            ["feature", None], filters, None)["matrix"][0][0]["metricValue"]
    else:
        value = analyzer.compute_error_tree(
            ["feature"], filters, None, min_child_samples=1
        )[0]["metricValue"]

    if np.isnan(expected) and view == "tree":
        assert np.isnan(value)
    else:
        assert value == (0 if np.isnan(expected) else expected)


def test_classification_column_vectors_do_not_broadcast_root_error():
    labels = np.array([0, 1, 0, 1])[:, None]
    predictions = np.array([0, 1, 0, 1])
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().shape == (4,)
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_classification_column_predictions_are_normalized(view):
    analyzer = ModelAnalyzer(
        ColumnPredictionModel(),
        pd.DataFrame({"feature": [0, 1, 2, 3]}),
        [0, 1, 0, 1],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    if view == "heatmap":
        heatmap = analyzer.compute_matrix(["feature", None], None, None)
        assert all(cell["falseCount"] == 0 for cell in heatmap["matrix"][0])
    else:
        tree = analyzer.compute_error_tree(
            ["feature"], None, None, min_child_samples=1)
        assert tree[0]["metricValue"] == 0


@pytest.mark.parametrize("metric,expected", [
    (Metrics.FALSE_NEGATIVE_RATE, 0.5),
    (Metrics.FALSE_POSITIVE_RATE, 0.5),
    (Metrics.SELECTION_RATE, 0.5),
])
def test_binary_rates_allow_omitted_classes(metric, expected):
    labels = [0, 0, 1, 1]
    predictions = [0, 1, 0, 1]

    assert metric_to_func[metric](labels, predictions) == expected


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_missing_labels_outside_cohort_do_not_change_binary_vocabulary(view):
    analyzer = PredictionsAnalyzer(
        [0, 1, 0],
        pd.DataFrame({"feature": [0, 1, 999]}),
        pd.Series([0, 1, pd.NA], dtype="Int64"),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=np.array([0, 1]),
    )
    filters = [{
        ARG: [0, 1],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_RANGE,
    }]

    if view == "heatmap":
        analyzer.compute_matrix(["feature", None], filters, None)
    else:
        analyzer.compute_error_tree(
            ["feature"], filters, None, min_child_samples=1)


def test_error_rate_tree_preserves_missing_label_behavior():
    labels = np.array([0, 1, np.nan, 0])
    predictions = np.array([0, 1, 0, 0])
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    analyzer.compute_root_stats()
    analyzer.compute_matrix(["feature", None], None, None)
    analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)


@pytest.mark.parametrize("dtype", [
    np.int8, np.uint8, np.int16, np.uint16, np.int32, np.uint32,
    np.int64, np.uint64,
])
@pytest.mark.parametrize("metric", [
    Metrics.MEAN_SQUARED_ERROR,
    Metrics.MEDIAN_ABSOLUTE_ERROR,
])
def test_integer_metrics_do_not_overflow_at_dtype_boundaries(dtype, metric):
    info = np.iinfo(dtype)
    labels = np.array([info.min, info.max], dtype=dtype)
    predictions = np.array([info.max, info.min], dtype=dtype)
    difference = int(info.max) - int(info.min)
    expected = float(
        difference**2 if metric == Metrics.MEAN_SQUARED_ERROR else difference)

    assert metric_to_func[metric](labels, predictions) == expected


@pytest.mark.parametrize("metric,expected", [
    (Metrics.MEAN_SQUARED_ERROR, 65025),
    (Metrics.MEDIAN_ABSOLUTE_ERROR, 255),
])
def test_public_integer_metrics_use_exact_residuals(metric, expected):
    analyzer = PredictionsAnalyzer(
        np.array([255, 0], dtype=np.uint8),
        pd.DataFrame({"feature": [0, 1]}),
        np.array([0, 255], dtype=np.uint8),
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=metric,
    )

    root = analyzer.compute_root_stats()
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert root[RootKeys.METRIC_VALUE] == expected
    assert all(
        cell["metricValue"] == expected for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == expected


@pytest.mark.parametrize("metric,expected", [
    (Metrics.MEAN_ABSOLUTE_ERROR, 255),
    (Metrics.MEAN_SQUARED_ERROR, 65025),
    (Metrics.MEDIAN_ABSOLUTE_ERROR, 255),
])
def test_column_vector_integer_metrics_use_exact_residuals(metric, expected):
    labels = np.array([0, 255], dtype=np.uint8)[:, None]
    predictions = np.array([255, 0], dtype=np.uint8)[:, None]
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=metric,
    )

    root = analyzer.compute_root_stats()
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert analyzer.get_diff().shape == (2,)
    assert analyzer.get_diff().tolist() == [255, -255]
    assert root[RootKeys.METRIC_VALUE] == expected
    assert all(
        cell["metricValue"] == expected for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == expected


def test_sparse_integer_metrics_use_exact_residuals():
    analyzer = PredictionsAnalyzer(
        pd.Series([255, 0], dtype="Sparse[uint8]"),
        pd.DataFrame({"feature": [0, 1]}),
        pd.Series([0, 255], dtype="Sparse[uint8]"),
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_SQUARED_ERROR,
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 65025


@pytest.mark.parametrize("dtype", [
    "Sparse[Int8]", "Sparse[UInt8]", "Sparse[Int64]", "Sparse[UInt64]",
])
def test_sparse_nullable_integer_metrics_remain_exact(dtype):
    predictions = pd.Series([2, 1], dtype=dtype)
    labels = pd.Series([1, 0], dtype=dtype)
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_ABSOLUTE_ERROR,
    )

    assert analyzer.get_diff().tolist() == [1, 1]
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 1


def test_sparse_float_metrics_preserve_fractional_residuals():
    predictions = pd.Series([0.5, 1.5, 2.25, 3], dtype="Sparse[float32]")
    labels = np.array([0, 1, 2, 3], dtype=np.int32)
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 1, 0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_ABSOLUTE_ERROR,
    )

    assert analyzer.get_diff().tolist() == [0.5, 0.5, 0.25, 0]
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0.3125


def test_arrow_uint64_metrics_preserve_adjacent_values():
    pytest.importorskip("pyarrow")
    predictions = pd.Series(
        np.array([2**64 - 1, 1], dtype=np.uint64),
        dtype="uint64[pyarrow]")
    labels = pd.Series(
        np.array([2**64 - 2, 0], dtype=np.uint64),
        dtype="uint64[pyarrow]")
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_ABSOLUTE_ERROR,
    )

    assert analyzer.get_diff().tolist() == [1, 1]
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 1
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    assert all(cell["metricValue"] == 1 for cell in heatmap["matrix"][0])


def test_arrow_duration_labels_preserve_nanoseconds():
    pa = pytest.importorskip("pyarrow")
    dtype = pd.ArrowDtype(pa.duration("ns"))
    labels = pd.Series(
        [pd.Timedelta(1, "ns"), pd.Timedelta(2, "ns"),
         pd.Timedelta(1, "ns"), pd.Timedelta(2, "ns")],
        dtype=dtype)
    predictions = pd.Series(
        [pd.Timedelta(2, "ns"), pd.Timedelta(1, "ns"),
         pd.Timedelta(2, "ns"), pd.Timedelta(1, "ns")],
        dtype=dtype)
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, True, True, True]
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 100


def test_equal_arrow_temporal_labels_match_python_containers():
    pa = pytest.importorskip("pyarrow")
    values = [pd.Timestamp("2025-01-01") + pd.Timedelta(i, "us")
              for i in range(4)]
    labels = pd.Series(values, dtype=pd.ArrowDtype(pa.timestamp("ns")))
    analyzer = PredictionsAnalyzer(
        values.copy(),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert all(cell["falseCount"] == 0 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 0


@pytest.mark.parametrize("container", ["arrow", "sparse"])
def test_non_dataframe_features_preserve_uint64_targets(container):
    if container == "arrow":
        pytest.importorskip("pyarrow")
        dtype = "uint64[pyarrow]"
    else:
        dtype = "Sparse[uint64]"
    predictions = pd.Series(
        np.array([2**64 - 1, 1], dtype=np.uint64), dtype=dtype)
    labels = pd.Series(
        np.array([2**64 - 2, 0], dtype=np.uint64), dtype=dtype)
    analyzer = PredictionsAnalyzer(
        predictions,
        [[0], [1]],
        labels,
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_ABSOLUTE_ERROR,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert all(cell["metricValue"] == 1 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 1


def test_root_stats_use_model_class_metadata_for_singleton_data():
    analyzer = ModelAnalyzer(
        BinaryMetadataModel(),
        pd.DataFrame({"feature": [0, 1, 2, 3]}),
        [0, 0, 0, 0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )

    root = analyzer.compute_root_stats()
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert root[RootKeys.METRIC_VALUE] == 0
    assert all(cell["metricValue"] == 0 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 0


def test_large_integer_labels_do_not_match_rounded_float_predictions():
    integer = 2**53 + 1
    analyzer = PredictionsAnalyzer(
        np.full(4, float(2**53)),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        pd.Series([integer] * 4, dtype="Int64"),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True] * 4
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 100
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    assert sum(cell["falseCount"] for cell in heatmap["matrix"][0]) == 4


def test_out_of_range_temporal_values_do_not_compare_equal_after_overflow():
    far_future = np.datetime64("3000-01-01", "D").astype(object)
    wrapped = pd.Timestamp("1830-11-23 00:50:52.580896768")
    analyzer = PredictionsAnalyzer(
        [far_future, far_future],
        pd.DataFrame({"feature": [0, 1]}),
        [wrapped, wrapped],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, True]
    assert len(get_ordered_classes(
        None, [far_future], [wrapped])) == 2


def test_high_cardinality_temporal_classes_are_deduplicated():
    labels = np.arange(2000).astype("datetime64[D]")

    assert len(get_ordered_classes(None, labels, labels)) == 2000


def test_empty_string_label_cohort_returns_empty_heatmap():
    analyzer = PredictionsAnalyzer(
        np.array(["x", "y"], dtype=object),
        pd.DataFrame({"feature": [0, 1]}),
        np.array(["x", "y"], dtype=object),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )
    filters = [{
        ARG: [99],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    assert analyzer.compute_matrix(
        ["feature", None], filters, None)["matrix"] == [[]]


def test_raw_arrow_timestamp_labels_match_numpy_labels():
    pa = pytest.importorskip("pyarrow")
    labels = np.array(
        ["2025-01-01", "2025-01-02", "2025-01-01", "2025-01-02"],
        dtype="datetime64[ns]")
    analyzer = PredictionsAnalyzer(
        pa.array(labels),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False] * 4
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0


def test_outcome_filter_uses_model_class_order():
    analyzer = ModelAnalyzer(
        ReverseBinaryMetadataModel(),
        pd.DataFrame({"row": [0, 1, 2, 3]}),
        [0, 0, 0, 0],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )
    filters = [{
        ARG: [3],
        COLUMN: "Classification outcome",
        METHOD: CohortFilterMethods.METHOD_INCLUDES,
    }]

    filtered = filter_from_cohort(
        analyzer, filters, None, include_original_columns_only=True)

    assert filtered["row"].tolist() == [0, 1, 2, 3]


@pytest.mark.parametrize("metric", [
    Metrics.ACCURACY_SCORE,
    Metrics.PRECISION_SCORE,
    Metrics.RECALL_SCORE,
    Metrics.F1_SCORE,
])
def test_temporal_labels_work_for_all_binary_classification_metrics(metric):
    first = np.datetime64("2025-01-01", "ns")
    second = np.datetime64("2025-01-02", "ns")
    analyzer = PredictionsAnalyzer(
        [second, second, second, first],
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        [first, second, second, first],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
        classes=[first, second],
    )

    expected = {
        Metrics.ACCURACY_SCORE: 0.75,
        Metrics.PRECISION_SCORE: 2 / 3,
        Metrics.RECALL_SCORE: 1,
        Metrics.F1_SCORE: 0.8,
    }[metric]
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == expected
    analyzer.compute_matrix(["feature", None], None, None)
    analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)


def test_binary_rates_encode_out_of_range_integer_labels():
    large = 2**63 + 5
    labels = [-1, large, -1, large]
    predictions = [large, large, large, -1]

    assert metric_to_func[Metrics.SELECTION_RATE](
        labels, predictions, classes=[-1, large]) == 0.75


@pytest.mark.parametrize("metric", [
    Metrics.ACCURACY_SCORE,
    Metrics.MICRO_F1_SCORE,
    Metrics.MACRO_F1_SCORE,
])
def test_display_name_classes_work_for_nonbinary_metrics(metric):
    analyzer = PredictionsAnalyzer(
        [0, 1, 0, 1],
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        [0, 1, 0, 1],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
        classes=["negative", "positive"],
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 1
    assert analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)[0]["metricValue"] == 1


def test_numpy_and_python_boolean_labels_are_equivalent():
    analyzer = PredictionsAnalyzer(
        np.array([False, True, False, True]),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        pd.Series([False, True, False, True], dtype="boolean"),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ACCURACY_SCORE,
        classes=[False, True],
    )

    assert analyzer.get_diff().tolist() == [False] * 4
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 1


@pytest.mark.parametrize("metric", [
    Metrics.PRECISION_SCORE,
    Metrics.RECALL_SCORE,
    Metrics.F1_SCORE,
])
def test_missing_default_positive_label_is_not_invented(metric):
    analyzer = PredictionsAnalyzer(
        [2, 2, 2, 2],
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        [2, 2, 2, 2],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
        classes=[0, 2, 3],
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    assert all(
        cell["metricValue"] == 0 for cell in heatmap["matrix"][0])
    assert analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)[0]["metricValue"] == 0


def test_timezone_equivalent_labels_compare_equal():
    utc = pd.Timestamp("2025-01-01", tz="UTC")
    paris = utc.tz_convert("Europe/Paris")
    analyzer = PredictionsAnalyzer(
        [paris, paris],
        pd.DataFrame({"feature": [0, 1]}),
        [utc, utc],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False, False]


def test_exact_rational_and_integer_labels_compare_equal():
    value = 2**53 + 1
    analyzer = PredictionsAnalyzer(
        [Fraction(value), Fraction(value)],
        pd.DataFrame({"feature": [0, 1]}),
        [value, value],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False, False]


def test_scaled_timedelta_units_compare_by_duration():
    predictions = np.array([1, 2], dtype="timedelta64[2D]")
    labels = np.array([2, 4], dtype="timedelta64[D]")
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ACCURACY_SCORE,
    )

    assert analyzer.get_diff().tolist() == [False, False]
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 1


def test_same_kind_temporal_arrays_do_not_compare_after_overflow():
    future = np.array(["3000-01-01"], dtype="datetime64[D]")
    wrapped = future.astype("datetime64[ns]")

    analyzer = PredictionsAnalyzer(
        wrapped,
        pd.DataFrame({"feature": [0]}),
        future,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True]


def test_missing_labels_have_consistent_error_and_outcome_semantics():
    analyzer = PredictionsAnalyzer(
        [np.nan, np.nan, 0, 1],
        pd.DataFrame({"row": [0, 1, 2, 3]}),
        [np.nan, 0, 0, 1],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
        classes=[0, 1],
    )

    assert analyzer.get_diff().tolist() == [False, True, False, False]
    filtered = filter_from_cohort(
        analyzer,
        [{
            ARG: [3],
            COLUMN: "Classification outcome",
            METHOD: CohortFilterMethods.METHOD_INCLUDES,
        }],
        None,
        include_original_columns_only=True,
    )
    assert filtered["row"].tolist() == [0, 3]


def test_decimal_and_integer_labels_compare_equal():
    analyzer = PredictionsAnalyzer(
        [0, 1, 0, 1],
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        [Decimal(0), Decimal(1), Decimal(0), Decimal(1)],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False] * 4


def test_dst_fold_values_remain_distinct_during_factorization():
    timezone = ZoneInfo("America/New_York")
    first = dt.datetime(2025, 11, 2, 1, 30, tzinfo=timezone, fold=0)
    second = first.replace(fold=1)
    analyzer = PredictionsAnalyzer(
        [first, second],
        pd.DataFrame({"feature": [0, 1]}),
        [pd.Timestamp(first), pd.Timestamp(second)],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False, False]
    assert len(get_ordered_classes(None, [first, second], [])) == 2


@pytest.mark.parametrize("value", [
    dt.datetime(
        1, 1, 1, tzinfo=dt.timezone(dt.timedelta(hours=1))),
    dt.datetime(
        9999, 12, 31, 23, 59,
        tzinfo=dt.timezone(dt.timedelta(hours=-1))),
])
def test_timezone_boundary_datetimes_do_not_overflow(value):
    analyzer = PredictionsAnalyzer(
        [value],
        pd.DataFrame({"feature": [0]}),
        [value],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False]


def test_generic_zero_timedelta_matches_fixed_unit_zero():
    analyzer = PredictionsAnalyzer(
        [np.timedelta64(0)],
        pd.DataFrame({"feature": [0]}),
        np.zeros(1, dtype="timedelta64[ns]"),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False]


def test_whole_minute_numpy_and_arrow_timestamps_match():
    pa = pytest.importorskip("pyarrow")
    values = [
        dt.datetime(2020, 1, 1, 10, 30),
        dt.datetime(2020, 1, 1, 11),
    ]
    analyzer = PredictionsAnalyzer(
        np.array(values, dtype="datetime64[s]"),
        pd.DataFrame({"feature": [0, 1]}),
        pa.array(values, type=pa.timestamp("s")),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False, False]


def test_missing_classification_labels_work_in_error_tree():
    analyzer = PredictionsAnalyzer(
        [np.nan, 1, np.nan, 1],
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        [np.nan, 1, 1, np.nan],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=[np.nan, 1],
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0.5
    assert analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)[0]["metricValue"] == 0.5


def test_raw_arrow_time64_preserves_nanoseconds():
    pa = pytest.importorskip("pyarrow")
    analyzer = PredictionsAnalyzer(
        pa.array([1, 2], type=pa.time64("ns")),
        pd.DataFrame({"feature": [0, 1]}),
        pa.array([2, 1], type=pa.time64("ns")),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, True]


def test_raw_arrow_integer_nulls_preserve_missing_regression_values():
    pa = pytest.importorskip("pyarrow")
    analyzer = PredictionsAnalyzer(
        pa.array([1, None], type=pa.int64()),
        pd.DataFrame({"feature": [0, 1]}),
        [1, 2],
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_ABSOLUTE_ERROR,
    )

    residuals = analyzer.get_diff()
    assert residuals[0] == 0
    assert np.isnan(residuals[1])


def test_raw_arrow_integer_nulls_preserve_large_values():
    pa = pytest.importorskip("pyarrow")
    large = 2**53 + 1
    classification = PredictionsAnalyzer(
        pa.array([large, None], type=pa.int64()),
        pd.DataFrame({"feature": [0, 1]}),
        [large, 0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )
    regression = PredictionsAnalyzer(
        pa.array([2**64 - 1, None], type=pa.uint64()),
        pd.DataFrame({"feature": [0, 1]}),
        [2**64 - 2, 0],
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_ABSOLUTE_ERROR,
    )

    assert classification.get_diff().tolist() == [False, True]
    residuals = regression.get_diff()
    assert residuals[0] == 1
    assert np.isnan(residuals[1])


def test_aware_time_labels_compare_by_instant():
    utc = dt.time(10, tzinfo=dt.timezone.utc)
    equivalent = dt.time(
        11, tzinfo=dt.timezone(dt.timedelta(hours=1)))
    different = dt.time(
        10, tzinfo=dt.timezone(dt.timedelta(hours=1)))

    assert PredictionsAnalyzer(
        [utc],
        pd.DataFrame({"feature": [0]}),
        [equivalent],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    ).get_diff().tolist() == [False]
    assert PredictionsAnalyzer(
        [utc],
        pd.DataFrame({"feature": [0]}),
        [different],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    ).get_diff().tolist() == [True]


@pytest.mark.parametrize("unit", ["s", "ms"])
def test_raw_arrow_time32_labels(unit):
    pa = pytest.importorskip("pyarrow")
    analyzer = PredictionsAnalyzer(
        pa.array([1, 2], type=pa.time32(unit)),
        pd.DataFrame({"feature": [0, 1]}),
        pa.array([2, 1], type=pa.time32(unit)),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, True]


@pytest.mark.parametrize("arrow_type,values", [
    ("timestamp", [253402300800, 253402300801]),
    ("duration", [2**62, 2**62 + 1]),
])
def test_raw_arrow_temporal_values_avoid_python_range_limits(
        arrow_type, values):
    pa = pytest.importorskip("pyarrow")
    data_type = (
        pa.timestamp("s") if arrow_type == "timestamp"
        else pa.duration("ms"))
    labels = pa.array(values, type=data_type)
    analyzer = PredictionsAnalyzer(
        labels,
        pd.DataFrame({"feature": [0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False, False]


@pytest.mark.parametrize("timezone", [
    ZoneInfo("America/New_York"),
    pytest.param(
        pytest.importorskip("dateutil.tz").gettz("America/New_York"),
        id="dateutil"),
])
def test_pandas_series_preserves_dst_fold_instants(timezone):
    first = pd.Timestamp(
        dt.datetime(2025, 11, 2, 1, 30, tzinfo=timezone, fold=0))
    second = pd.Timestamp(
        dt.datetime(2025, 11, 2, 1, 30, tzinfo=timezone, fold=1))
    analyzer = PredictionsAnalyzer(
        pd.Series([first, second]),
        pd.DataFrame({"feature": [0, 1]}),
        pd.Series([second, first]),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, True]


def test_inferred_arrow_temporal_class_order_is_row_invariant():
    pa = pytest.importorskip("pyarrow")
    early = dt.date(2025, 1, 1)
    late = dt.date(2025, 6, 1)
    labels = [late, early, late, early]
    predictions = [early, early, late, early]

    def selection_rate_for_order(order):
        order = list(order)
        analyzer = PredictionsAnalyzer(
            pa.array([predictions[index] for index in order],
                     type=pa.date32()),
            pd.DataFrame({"feature": range(4)}),
            pa.array([labels[index] for index in order], type=pa.date32()),
            ["feature"],
            [],
            model_task=ModelTask.CLASSIFICATION,
            metric=Metrics.SELECTION_RATE,
        )
        return analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]

    assert selection_rate_for_order(range(4)) == \
        selection_rate_for_order(reversed(range(4)))


def test_arrow_temporal_boundary_is_not_conflated_with_missing():
    pa = pytest.importorskip("pyarrow")
    analyzer = PredictionsAnalyzer(
        np.full(4, np.datetime64("NaT"), dtype="datetime64[ns]"),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        pa.array([-2**63] * 4, type=pa.timestamp("ns")),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 100
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)
    assert sum(cell["falseCount"] for cell in heatmap["matrix"][0]) == 4
    assert tree[0]["error"] == 4


def test_negative_year_leap_days_have_distinct_keys():
    predictions = np.array(["-0400-02-29"], dtype="datetime64[D]")
    labels = np.array(["-0400-03-01"], dtype="datetime64[D]")
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True]


def test_zero_imaginary_complex_labels_match_real_labels():
    analyzer = PredictionsAnalyzer(
        np.array([0, 1], dtype=complex),
        pd.DataFrame({"feature": [0, 1]}),
        [0, 1],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False, False]


def test_root_class_resolution_reuses_existing_model_predictions():
    model = CountingPredictionModel([0, 1, 0, 1])
    analyzer = ModelAnalyzer(
        model,
        pd.DataFrame({"feature": [0, 1, 2, 3]}),
        [0, 1, 0, 1],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.F1_SCORE,
    )
    calls_after_initialization = model.calls

    analyzer.compute_root_stats()

    assert model.calls == calls_after_initialization + 1


def test_aware_arrow_timestamps_match_aware_python_labels():
    pa = pytest.importorskip("pyarrow")
    instant = pd.Timestamp("2025-01-01", tz="UTC")
    analyzer = PredictionsAnalyzer(
        pa.array([instant], type=pa.timestamp("ns", tz="UTC")),
        pd.DataFrame({"feature": [0]}),
        [instant.tz_convert("Europe/Paris")],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False]


def test_infinite_labels_do_not_recurse():
    analyzer = PredictionsAnalyzer(
        [0, np.inf, -np.inf],
        pd.DataFrame({"feature": [0, 1, 2]}),
        np.array([0, np.inf, -np.inf], dtype=object),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False, False, False]
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0


def test_inferred_dst_fold_class_order_is_row_invariant():
    timezone = ZoneInfo("America/New_York")
    early = dt.datetime(
        2025, 11, 2, 1, 30, tzinfo=timezone, fold=0)
    late = early.replace(fold=1)
    labels = [early, late, early, late]
    predictions = [late, late, late, early]

    def selection_rate_for_order(order):
        order = list(order)
        analyzer = PredictionsAnalyzer(
            [predictions[index] for index in order],
            pd.DataFrame({"feature": range(4)}),
            [labels[index] for index in order],
            ["feature"],
            [],
            model_task=ModelTask.CLASSIFICATION,
            metric=Metrics.SELECTION_RATE,
        )
        return analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]

    assert selection_rate_for_order(range(4)) == \
        selection_rate_for_order(reversed(range(4)))


def test_filtered_prf_ignores_excluded_prediction_only_classes():
    analyzer = PredictionsAnalyzer(
        [2, 3, 2, 3, 1],
        pd.DataFrame({
            "feature": [0, 0, 0, 0, 1],
            "row": [0, 1, 2, 3, 4],
        }),
        [2, 3, 2, 3, 2],
        ["feature", "row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.PRECISION_SCORE,
    )
    filters = [{
        ARG: [0],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    heatmap = analyzer.compute_matrix(["feature", None], filters, None)
    tree = analyzer.compute_error_tree(
        ["row"], filters, None, min_child_samples=1)

    assert all(
        cell["metricValue"] == 1 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 1


@pytest.mark.parametrize("excluded_prediction", [0, 1, 2, 3])
def test_filtered_singleton_prf_ignores_excluded_predictions(
        excluded_prediction):
    analyzer = PredictionsAnalyzer(
        [2, 2, 2, excluded_prediction],
        pd.DataFrame({"feature": [0, 0, 0, 1]}),
        [2, 2, 2, 2],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.PRECISION_SCORE,
    )
    filters = [{
        ARG: [0],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    heatmap = analyzer.compute_matrix(["feature", None], filters, None)
    tree = analyzer.compute_error_tree(
        ["feature"], filters, None, min_child_samples=1)

    assert heatmap["matrix"][0][0]["metricValue"] == 0
    assert tree[0]["metricValue"] == 0


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_inferred_singleton_classes_do_not_predict_excluded_rows(view):
    model = RejectFullDatasetConstantModel()
    analyzer = ModelAnalyzer(
        model,
        pd.DataFrame({"feature": [0, 0, 999]}),
        [0, 0, 0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.PRECISION_SCORE,
    )
    filters = [{
        ARG: [0],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    if view == "heatmap":
        result = analyzer.compute_matrix(
            ["feature", None], filters, None)
        assert result["matrix"][0][0]["metricValue"] == 0
    else:
        result = analyzer.compute_error_tree(
            ["feature"], filters, None, min_child_samples=1)
        assert result[0]["metricValue"] == 0

    assert model.prediction_sizes
    assert max(model.prediction_sizes) == 2


@pytest.mark.parametrize("metric,expected", [
    (Metrics.PRECISION_SCORE, 0),
    (Metrics.RECALL_SCORE, 0),
    (Metrics.F1_SCORE, 0),
])
def test_singleton_negative_class_preserves_absent_positive_behavior(
        metric, expected):
    analyzer = PredictionsAnalyzer(
        [0, 0, 0, 0],
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        [0, 0, 0, 0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == expected
    assert all(
        cell["metricValue"] == expected for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == expected


@pytest.mark.parametrize("labels,predictions", [
    ([0] * 6, [0, 1, 0, 0, 1, 0]),
    (["no"] * 6, ["no", "yes", "no", "no", "yes", "no"]),
])
@pytest.mark.parametrize("metric", [
    Metrics.PRECISION_SCORE,
    Metrics.RECALL_SCORE,
    Metrics.F1_SCORE,
])
def test_singleton_negative_true_class_does_not_flip_positive_label(
        labels, predictions, metric):
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 0, 0, 1, 1, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0
    assert all(
        cell["metricValue"] == 0 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 0


def test_filtered_prf_includes_selected_prediction_only_classes():
    analyzer = PredictionsAnalyzer(
        [0, 1, 2, 1, 2],
        pd.DataFrame({
            "group": [0, 1, 1, 1, 1],
            "row": [0, 1, 2, 3, 4],
        }),
        [0, 1, 1, 1, 1],
        ["group", "row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.F1_SCORE,
    )
    filters = [{
        ARG: [1],
        COLUMN: "group",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    heatmap = analyzer.compute_matrix(["group", None], filters, None)
    tree = analyzer.compute_error_tree(
        ["row"], filters, None, min_child_samples=1)

    assert heatmap["matrix"][0][0]["metricValue"] == 2 / 3
    assert tree[0]["metricValue"] == 2 / 3


def test_decimal_and_float_infinities_compare_equal():
    analyzer = PredictionsAnalyzer(
        [float("inf"), float("-inf")],
        pd.DataFrame({"feature": [0, 1]}),
        [Decimal("Infinity"), Decimal("-Infinity")],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False, False]


@pytest.mark.parametrize("labels", [
    [b"no", b"yes", b"no", b"yes"],
    np.array([b"no", b"yes", b"no", b"yes"]),
    pd.Series(np.array([b"no", b"yes", b"no", b"yes"])),
])
def test_bytes_labels_work_in_metric_heatmaps(labels):
    analyzer = PredictionsAnalyzer(
        labels,
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ACCURACY_SCORE,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)

    assert all(
        cell["metricValue"] == 1 for cell in heatmap["matrix"][0])


def test_object_detection_cohort_preserves_ragged_targets():
    targets = [[{"label": 1}], [{"label": 1}, {"label": 2}]]
    cohort_filter = FilterDataWithCohortFilters(
        None,
        pd.DataFrame({"feature": [0, 1]}),
        ["feature"],
        [],
        [],
        targets,
        targets,
        ModelTask.OBJECT_DETECTION,
    )

    filtered = cohort_filter.filter_data_from_cohort([], None)

    assert len(filtered) == 2


@pytest.mark.parametrize("metric,expected", [
    (Metrics.ACCURACY_SCORE, 1 / 3),
    (Metrics.MICRO_F1_SCORE, 0.75),
    (Metrics.MACRO_F1_SCORE, 0.75),
])
def test_multilabel_metrics_preserve_indicator_matrix(metric, expected):
    analyzer = PredictionsAnalyzer(
        np.array([[1, 1], [1, 1], [0, 0]]),
        pd.DataFrame({"feature": [0, 1, 2]}),
        np.array([[1, 0], [1, 1], [0, 1]]),
        ["feature"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=metric,
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == expected
    assert analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)[0]["metricValue"] == \
        expected


def test_display_names_preserve_full_multiclass_prf_vocabulary():
    analyzer = PredictionsAnalyzer(
        [0, 1, 1, 1, 1],
        pd.DataFrame({"group": [0, 1, 1, 1, 1]}),
        [0, 1, 2, 1, 2],
        ["group"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.F1_SCORE,
        classes=["zero", "one", "two"],
    )
    filters = [{
        ARG: [1],
        COLUMN: "group",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    heatmap = analyzer.compute_matrix(["group", None], filters, None)
    tree = analyzer.compute_error_tree(
        ["group"], filters, None, min_child_samples=1)

    assert heatmap["matrix"][0][0]["metricValue"] == 2 / 3
    assert tree[0]["metricValue"] == 2 / 3


def test_mixed_numeric_lists_preserve_large_integer_identity():
    analyzer = PredictionsAnalyzer(
        [float(2**53), 0.0],
        pd.DataFrame({"feature": [0, 1]}),
        [2**53 + 1, 0.0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, False]


def test_two_label_multilabel_outcomes_use_correct_incorrect_codes():
    analyzer = PredictionsAnalyzer(
        ["", "can", "carton", "can"],
        pd.DataFrame({"row": [0, 1, 2, 3]}),
        ["", "carton", "carton", "can,carton"],
        ["row"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
        classes=["can", "carton"],
    )
    filters = [{
        ARG: [1],
        COLUMN: "Classification outcome",
        METHOD: CohortFilterMethods.METHOD_INCLUDES,
    }]

    filtered = filter_from_cohort(
        analyzer, filters, None, include_original_columns_only=True)

    assert filtered["row"].tolist() == [1, 3]


@pytest.mark.parametrize("container", ["dataframe", "column_array"])
def test_object_detection_cohort_flattens_single_output_containers(container):
    targets = [[{"label": 1}], [{"label": 1}, {"label": 2}]]
    if container == "dataframe":
        targets = pd.DataFrame({"label": targets})
    else:
        values = np.empty((2, 1), dtype=object)
        values[:, 0] = targets
        targets = values
    cohort_filter = FilterDataWithCohortFilters(
        None,
        pd.DataFrame({"feature": [0, 1]}),
        ["feature"],
        [],
        [],
        targets,
        targets,
        ModelTask.OBJECT_DETECTION,
    )

    filtered = cohort_filter.filter_data_from_cohort([], None)

    assert filtered[TRUE_Y].iloc[0] == [{"label": 1}]


def test_outcome_inference_includes_prediction_only_binary_class():
    analyzer = PredictionsAnalyzer(
        [0, 1],
        pd.DataFrame({"row": [0, 1]}),
        [1, 1],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    false_negative = filter_from_cohort(
        analyzer,
        [{
            ARG: [2],
            COLUMN: "Classification outcome",
            METHOD: CohortFilterMethods.METHOD_INCLUDES,
        }],
        None,
        include_original_columns_only=True,
    )
    true_positive = filter_from_cohort(
        analyzer,
        [{
            ARG: [3],
            COLUMN: "Classification outcome",
            METHOD: CohortFilterMethods.METHOD_INCLUDES,
        }],
        None,
        include_original_columns_only=True,
    )

    assert false_negative["row"].tolist() == [0]
    assert true_positive["row"].tolist() == [1]


def test_display_classes_use_compatible_model_classes_for_outcomes():
    model = FixedPredictionModel(np.ones(2, dtype=int))
    model.classes_ = np.array([0, 1])
    analyzer = ModelAnalyzer(
        model,
        pd.DataFrame({"row": [0, 1]}),
        [1, 1],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
        classes=["negative", "positive"],
    )

    filtered = filter_from_cohort(
        analyzer,
        [{
            ARG: [3],
            COLUMN: "Classification outcome",
            METHOD: CohortFilterMethods.METHOD_INCLUDES,
        }],
        None,
        include_original_columns_only=True,
    )

    assert filtered["row"].tolist() == [0, 1]


@pytest.mark.parametrize("labels,predictions,expected_false_positive", [
    ([1, 1], [1, 2], [1]),
    ([np.nan, 1], [1, 1], [0]),
])
def test_outcome_model_class_fallback_matches_observed_vocabulary(
        labels, predictions, expected_false_positive):
    model = FixedPredictionModel(np.asarray(predictions, dtype=object))
    model.classes_ = np.array([0, 1])
    analyzer = ModelAnalyzer(
        model,
        pd.DataFrame({"row": [0, 1]}),
        labels,
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.FALSE_POSITIVE_RATE,
        classes=["negative", "positive"],
    )

    filtered = filter_from_cohort(
        analyzer,
        [{
            ARG: [1],
            COLUMN: "Classification outcome",
            METHOD: CohortFilterMethods.METHOD_INCLUDES,
        }],
        None,
        include_original_columns_only=True,
    )

    assert filtered["row"].tolist() == expected_false_positive


def test_outcome_does_not_adopt_multiclass_model_for_binary_observations():
    model = FixedPredictionModel(np.array([1, 1]))
    model.classes_ = np.array([0, 1, 2])
    analyzer = ModelAnalyzer(
        model,
        pd.DataFrame({"row": [0, 1]}),
        [0, 1],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=["negative", "positive"],
    )

    true_positive = filter_from_cohort(
        analyzer,
        [{
            ARG: [3],
            COLUMN: "Classification outcome",
            METHOD: CohortFilterMethods.METHOD_INCLUDES,
        }],
        None,
        include_original_columns_only=True,
    )

    assert true_positive["row"].tolist() == [1]


def test_outcome_rejects_model_order_with_oov_prediction():
    model = FixedPredictionModel(np.array([0, 2]))
    model.classes_ = np.array([1, 0])
    analyzer = ModelAnalyzer(
        model,
        pd.DataFrame({"row": [0, 1]}),
        [0, 0],
        ["row"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )

    false_positive = filter_from_cohort(
        analyzer,
        [{
            ARG: [1],
            COLUMN: "Classification outcome",
            METHOD: CohortFilterMethods.METHOD_INCLUDES,
        }],
        None,
        include_original_columns_only=True,
    )

    assert false_positive["row"].tolist() == [1]


def test_display_classes_preserve_compatible_model_class_order():
    analyzer = ModelAnalyzer(
        ReverseBinaryMetadataModel(),
        pd.DataFrame({"feature": [0, 1]}),
        [0, 1],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=["negative", "positive"],
    )

    root = analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert root == 1
    assert all(
        cell["metricValue"] == 1 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 1


def test_incompatible_model_classes_do_not_leak_into_inferred_classes():
    analyzer = ModelAnalyzer(
        StringMetadataModel(),
        pd.DataFrame({"feature": [0, 1]}),
        [0, 0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )

    root = analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert root == 0
    assert all(
        cell["metricValue"] == 0 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 0


@pytest.mark.parametrize("view", ["heatmap", "tree"])
def test_sparse_model_multilabel_predictions_preserve_dimensions(view):
    predictions = sparse.csr_matrix([[1, 0], [0, 1], [1, 1]])
    analyzer = ModelAnalyzer(
        FixedPredictionModel(predictions),
        pd.DataFrame({"feature": [0, 0, 1]}),
        predictions.copy(),
        ["feature"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=Metrics.ACCURACY_SCORE,
    )

    if view == "heatmap":
        heatmap = analyzer.compute_matrix(["feature", None], None, None)
        assert all(
            cell["metricValue"] == 1 for cell in heatmap["matrix"][0])
    else:
        tree = analyzer.compute_error_tree(
            ["feature"], None, None, min_child_samples=1)
        assert tree[0]["metricValue"] == 1


def test_inferred_missing_class_is_preserved_across_views():
    labels = [np.nan, 1]
    analyzer = PredictionsAnalyzer(
        labels.copy(),
        pd.DataFrame({"feature": [0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )

    root = analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert root == 0.5
    assert sorted([
        cell["metricValue"] for cell in heatmap["matrix"][0]
    ]) == [0, 1]
    assert tree[0]["metricValue"] == 0.5


@pytest.mark.parametrize("missing_label", [None, pd.NA, pd.NaT])
def test_nonfloat_inferred_missing_classes_work_across_views(missing_label):
    labels = [missing_label, 1]
    analyzer = PredictionsAnalyzer(
        labels.copy(),
        pd.DataFrame({"feature": [0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )

    root = analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert root == 0.5
    assert sorted([
        cell["metricValue"] for cell in heatmap["matrix"][0]
    ]) == [0, 1]
    assert tree[0]["metricValue"] == 0.5


def test_selected_missing_class_is_not_replaced_by_full_true_vocabulary():
    analyzer = PredictionsAnalyzer(
        [0, 1, np.nan, 1],
        pd.DataFrame({"selected": [0, 0, 1, 1]}),
        [0, 1, np.nan, 1],
        ["selected"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )
    filters = [{
        ARG: [1],
        COLUMN: "selected",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    heatmap = analyzer.compute_matrix(["selected", None], filters, None)
    tree = analyzer.compute_error_tree(
        ["selected"], filters, None, min_child_samples=1)

    assert heatmap["matrix"][0][0]["metricValue"] == 0.5
    assert tree[0]["metricValue"] == 0.5


def test_mixed_unit_temporal_lists_preserve_original_scalars():
    far_future = np.datetime64("3000-01-01", "D")
    wrapped = far_future.astype("datetime64[ns]")
    present = np.datetime64("2025-01-01", "ns")
    analyzer = PredictionsAnalyzer(
        [far_future, present],
        pd.DataFrame({"feature": [0, 1]}),
        [wrapped, present],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, False]


def test_mixed_unit_timedelta_lists_preserve_original_scalars():
    far_future = np.timedelta64(10**8, "D")
    wrapped = far_future.astype("timedelta64[ns]")
    one_ns = np.timedelta64(1, "ns")
    analyzer = PredictionsAnalyzer(
        [far_future, one_ns],
        pd.DataFrame({"feature": [0, 1]}),
        [wrapped, one_ns],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, False]


@pytest.mark.parametrize("unit", ["ps", "D"])
def test_temporal_arrays_remain_exact_in_cohort_views(unit):
    if unit == "ps":
        labels = np.array([1, 2], dtype="datetime64[ps]")
        predictions = np.array([1, 1], dtype="datetime64[ps]")
    else:
        labels = np.array(["3000-01-01", "2025-01-01"], dtype="datetime64[D]")
        predictions = labels.astype("datetime64[ns]")
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 50
    assert sum(
        cell["falseCount"] for cell in heatmap["matrix"][0]) == 1
    assert tree[0]["metricValue"] == 0.5


@pytest.mark.parametrize("missing_label", [np.nan, pd.NA])
def test_excluded_missing_labels_do_not_change_inferred_cohort_classes(
        missing_label):
    analyzer = PredictionsAnalyzer(
        [0, 0, 1, 0],
        pd.DataFrame({"feature": [0, 0, 1, 999]}),
        [0, 0, 1, missing_label],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )
    filters = [{
        ARG: [0],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    heatmap = analyzer.compute_matrix(["feature", None], filters, None)
    tree = analyzer.compute_error_tree(
        ["feature"], filters, None, min_child_samples=1)

    assert heatmap["matrix"][0][0]["metricValue"] == 0
    assert tree[0]["metricValue"] == 0


def test_partial_model_class_overlap_uses_complete_inferred_vocabulary():
    model = FixedPredictionModel(np.ones(2, dtype=int))
    model.classes_ = np.array([0, 2])
    analyzer = ModelAnalyzer(
        model,
        pd.DataFrame({"feature": [0, 1]}),
        [0, 1],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
        classes=["negative", "positive"],
    )

    root = analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert root == 1
    assert all(
        cell["metricValue"] == 1 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 1


@pytest.mark.parametrize("metric", [
    Metrics.PRECISION_SCORE,
    Metrics.RECALL_SCORE,
    Metrics.F1_SCORE,
])
def test_multiclass_model_metadata_does_not_override_binary_data(metric):
    model = FixedPredictionModel(np.array([0, 2, 0, 2]))
    model.classes_ = np.array([0, 1, 2])
    analyzer = ModelAnalyzer(
        model,
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        [0, 2, 0, 2],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
        classes=["zero", "one", "two"],
    )

    root = analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert root == 1
    assert all(
        cell["metricValue"] == 1 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 1


@pytest.mark.parametrize("labels", [
    [0, 0, 2],
    [0, 1, 2],
])
def test_excluded_labels_do_not_veto_selected_model_class_order(labels):
    model = FixedPredictionModel(np.array([0, 0, 2]))
    model.classes_ = np.array([1, 0])
    analyzer = ModelAnalyzer(
        model,
        pd.DataFrame({"feature": [0, 0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )
    filters = [{
        ARG: [0],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    heatmap = analyzer.compute_matrix(["feature", None], filters, None)
    tree = analyzer.compute_error_tree(
        ["feature"], filters, None, min_child_samples=1)

    assert heatmap["matrix"][0][0]["metricValue"] == 1
    assert tree[0]["metricValue"] == 1


@pytest.mark.parametrize("metric,expected", [
    (Metrics.ACCURACY_SCORE, 1 / 3),
    (Metrics.MICRO_F1_SCORE, 0.75),
    (Metrics.MACRO_F1_SCORE, 0.75),
])
def test_sparse_multilabel_predictions_preserve_sklearn_semantics(
        metric, expected):
    analyzer = PredictionsAnalyzer(
        sparse.csr_matrix([[1, 1], [1, 1], [0, 0]]),
        pd.DataFrame({"feature": [0, 1, 2]}),
        np.array([[1, 0], [1, 1], [0, 1]]),
        ["feature"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=metric,
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == expected


def test_multilabel_list_rows_work_in_heatmap_and_tree():
    analyzer = PredictionsAnalyzer(
        [[1, 0], [0, 1], [0, 1], [1, 0]],
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        [[1, 0], [1, 1], [0, 1], [0, 0]],
        ["feature"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert [cell["falseCount"] for cell in heatmap["matrix"][0]] == [1, 1]
    assert tree[0]["metricValue"] == 0.5


@pytest.mark.parametrize("metric", [
    Metrics.SELECTION_RATE,
    Metrics.FALSE_POSITIVE_RATE,
    Metrics.FALSE_NEGATIVE_RATE,
])
def test_empty_cohort_retains_declared_binary_classes(metric):
    analyzer = PredictionsAnalyzer(
        [0, 0],
        pd.DataFrame({"feature": [0, 1]}),
        [0, 0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
        classes=[0, 1],
    )
    filters = [{
        ARG: [999],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    assert analyzer.compute_matrix(
        ["feature", None], filters, None)["matrix"] == [[]]


@pytest.mark.parametrize("metric", [
    Metrics.PRECISION_SCORE,
    Metrics.RECALL_SCORE,
    Metrics.F1_SCORE,
])
def test_inferred_incomparable_binary_prf_is_rejected(metric):
    analyzer = PredictionsAnalyzer(
        np.array([0, 0, 0, "a"], dtype=object),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        np.array([0, 0, "a", "a"], dtype=object),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=metric,
    )

    with pytest.raises(ValueError, match="mutually comparable"):
        analyzer.compute_root_stats()


def test_mixed_numeric_class_order_is_row_invariant():
    labels = [
        np.int64(2**53 + 1), np.float64(2**53),
        np.int64(2**53 + 1), np.float64(2**53),
    ]
    predictions = [float(2**53)] * 4

    def selection_rate_for_order(order):
        order = list(order)
        analyzer = PredictionsAnalyzer(
            [predictions[index] for index in order],
            pd.DataFrame({"feature": range(4)}),
            [labels[index] for index in order],
            ["feature"],
            [],
            model_task=ModelTask.CLASSIFICATION,
            metric=Metrics.SELECTION_RATE,
        )
        return analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]

    assert selection_rate_for_order(range(4)) == \
        selection_rate_for_order(reversed(range(4)))


def test_heatmap_preserves_mixed_numeric_label_identity():
    large = 2**53 + 1
    analyzer = PredictionsAnalyzer(
        [float(2**53), 0.0],
        pd.DataFrame({"feature": [0, 0]}),
        [large, 0.0],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ACCURACY_SCORE,
        classes=[0.0, float(2**53), large],
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)

    assert heatmap["matrix"][0][0]["metricValue"] == 0.5


def test_arrow_time64_root_metrics_use_safe_normalization():
    pa = pytest.importorskip("pyarrow")
    analyzer = PredictionsAnalyzer(
        pa.array([1, 2, 1, 2], type=pa.time64("ns")),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        pa.array([2, 1, 1, 2], type=pa.time64("ns")),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ACCURACY_SCORE,
    )

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0.5


def test_mixed_dtype_multioutput_diff_is_per_sample():
    analyzer = PredictionsAnalyzer(
        np.array([[1, 1], [1, 1], [0, 0]], dtype=bool),
        pd.DataFrame({"feature": [0, 1, 2]}),
        np.array([[1, 0], [1, 1], [0, 1]], dtype=int),
        ["feature"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, False, True]
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == \
        pytest.approx(200 / 3)


@pytest.mark.parametrize("view", ["heatmap", "outcome"])
def test_incomparable_binary_labels_are_rejected_consistently(view):
    analyzer = PredictionsAnalyzer(
        np.array([0, "a", "a", 0], dtype=object),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        np.array([0, "a", 0, "a"], dtype=object),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.PRECISION_SCORE,
    )

    with pytest.raises(ValueError, match="mutually comparable"):
        if view == "heatmap":
            analyzer.compute_matrix(["feature", None], None, None)
        else:
            filter_from_cohort(
                analyzer,
                [{
                    ARG: [0],
                    COLUMN: "Classification outcome",
                    METHOD: CohortFilterMethods.METHOD_INCLUDES,
                }],
                None,
            )


def test_arrow_backed_pandas_time64_preserves_nanoseconds():
    pa = pytest.importorskip("pyarrow")
    labels = pa.array([1, 2, 1, 2], type=pa.time64("ns"))
    predictions = pd.Series(pd.arrays.ArrowExtensionArray(labels))
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False] * 4


def test_scalar_object_labels_are_not_treated_as_multioutput():
    labels = pd.Series(["negative", "positive"] * 1000, dtype=object)
    analyzer = PredictionsAnalyzer(
        labels.copy(),
        pd.DataFrame({"feature": np.arange(len(labels)) % 2}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert not analyzer.get_diff().any()


def test_empty_two_label_multilabel_cells_have_full_confusion_vectors():
    analyzer = PredictionsAnalyzer(
        [[1, 0], [1, 1], [0, 1]],
        pd.DataFrame({
            "feature1": [0, 0, 1],
            "feature2": [0, 1, 0],
        }),
        [[1, 0], [1, 1], [0, 1]],
        ["feature1", "feature2"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=Metrics.ACCURACY_SCORE,
    )

    heatmap = analyzer.compute_matrix(
        ["feature1", "feature2"], None, None)
    empty_cells = [
        cell for row in heatmap["matrix"] for cell in row
        if cell["count"] == 0
    ]

    assert empty_cells
    assert all(len(cell["tp"]) == 2 for cell in empty_cells)


@pytest.mark.parametrize("container", [
    lambda values: pd.Series(values),
    lambda values: pd.CategoricalIndex(values),
    lambda values: values,
])
def test_categorical_large_integer_labels_remain_exact_after_filtering(
        container):
    large = 2**64 - 1
    labels = container(pd.Categorical(
        [large, large - 1, None],
        categories=np.array([large - 1, large], dtype=np.uint64),
    ))
    analyzer = PredictionsAnalyzer(
        [large, large - 1, 0],
        pd.DataFrame({"feature": [0, 0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )
    filters = [{
        ARG: [0],
        COLUMN: "feature",
        METHOD: CohortFilterMethods.METHOD_EQUAL,
    }]

    heatmap = analyzer.compute_matrix(["feature", None], filters, None)
    tree = analyzer.compute_error_tree(
        ["feature"], filters, None, min_child_samples=1)

    assert heatmap["matrix"][0][0]["falseCount"] == 0
    assert tree[0]["metricValue"] == 0


def test_categorical_arrow_time64_labels_preserve_nanoseconds():
    pa = pytest.importorskip("pyarrow")
    values = pd.arrays.ArrowExtensionArray(
        pa.array([1, 1001], type=pa.time64("ns")))
    predictions = pd.Series(values)
    labels = pd.Series(pd.Categorical.from_codes(
        [0, 1], categories=pd.Index(values)))
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 0]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert not analyzer.get_diff().any()
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0
    assert heatmap["matrix"][0][0]["falseCount"] == 0
    assert tree[0]["metricValue"] == 0


@pytest.mark.parametrize("values", [
    pd.to_datetime(["2020-01-01", "2020-01-02"]),
    pd.to_timedelta([1, 2], unit="ns"),
])
def test_categorical_numpy_temporal_labels_preserve_scalar_types(values):
    predictions = pd.Series(values)
    labels = pd.Series(pd.Categorical(values))
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 0]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert not analyzer.get_diff().any()
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 0


@pytest.mark.parametrize("arrow_type,values", [
    ("time64", [1, 1001]),
    ("timestamp", [2**40, 2**40 + 1]),
])
def test_dictionary_encoded_arrow_temporals_preserve_exact_values(
        arrow_type, values):
    pa = pytest.importorskip("pyarrow")
    value_type = (pa.time64("ns") if arrow_type == "time64"
                  else pa.timestamp("s"))
    plain = pa.array(values, type=pa.int64()).cast(value_type)
    dictionary = plain.dictionary_encode()
    analyzer = PredictionsAnalyzer(
        plain,
        pd.DataFrame({"feature": [0, 0]}),
        dictionary,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert not analyzer.get_diff().any()


def test_missing_categorical_regression_targets_produce_nan_residuals():
    analyzer = PredictionsAnalyzer(
        np.array([2.0, 2.0, 2.0]),
        pd.DataFrame({"row": [0, 1, 2]}),
        pd.Categorical([1, None, 3]),
        ["row"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_ABSOLUTE_ERROR,
    )

    residuals = analyzer.get_diff()

    assert residuals[[0, 2]].tolist() == [1, -1]
    assert np.isnan(residuals[1])


def test_large_integer_lists_with_nan_preserve_label_identity():
    large = 2**63 + 5
    analyzer = PredictionsAnalyzer(
        [large, 0, large + 2],
        pd.DataFrame({"feature": [0, 0, 1]}),
        [large, np.nan, large],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False, True, True]


def test_large_integer_lists_with_nan_do_not_collapse_distinct_values():
    analyzer = PredictionsAnalyzer(
        [2**63 + 5, np.nan],
        pd.DataFrame({"feature": [0, 1]}),
        [2**63 + 7, np.nan],
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, False]


def test_unrelated_model_classes_fall_back_to_observed_labels():
    model = FixedPredictionModel(np.array([0, 1, 0, 1]))
    model.classes_ = np.array(["no", "yes"])
    analyzer = ModelAnalyzer(
        model,
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        np.array([0, 1, 0, 1]),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )

    root = analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert root == 0.5
    assert all(
        cell["metricValue"] == 0.5 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 0.5


def test_mixed_non_ascii_bytes_and_strings_work_in_cohort_views():
    labels = [b"\xff", "a"]
    analyzer = PredictionsAnalyzer(
        labels.copy(),
        pd.DataFrame({"feature": [0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert all(cell["falseCount"] == 0 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 0


def test_dst_fold_metrics_remain_consistent_across_views():
    timezone = ZoneInfo("America/New_York")
    early = dt.datetime(
        2025, 11, 2, 1, 30, tzinfo=timezone, fold=0)
    late = early.replace(fold=1)
    analyzer = PredictionsAnalyzer(
        pd.Series([late, late, late, early]),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        pd.Series([early, late, late, early]),
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.SELECTION_RATE,
    )

    root = analyzer.compute_root_stats()[RootKeys.METRIC_VALUE]
    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert root == 0.75
    assert sorted([
        cell["metricValue"] for cell in heatmap["matrix"][0]
    ]) == [0.5, 1]
    assert tree[0]["metricValue"] == root


def test_nested_multioutput_rows_preserve_mixed_scalar_types():
    analyzer = PredictionsAnalyzer(
        pd.Series([["1", "a"], [2, "b"]]),
        pd.DataFrame({"feature": [0, 1]}),
        pd.Series([[1, "a"], [2, "b"]]),
        ["feature"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, False]
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 50


def test_mixed_numeric_multilabel_lists_work_across_views():
    labels = [[1, 0.0], [0, 1.0], [1, 1.0]]
    predictions = [[1, 0], [0, 1.0], [1, 0.0]]
    analyzer = PredictionsAnalyzer(
        predictions,
        pd.DataFrame({"feature": [0, 0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=Metrics.ACCURACY_SCORE,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == \
        pytest.approx(2 / 3)
    assert sorted([
        cell["metricValue"] for cell in heatmap["matrix"][0]
    ]) == [0, 1]
    assert tree[0]["metricValue"] == pytest.approx(2 / 3)


@pytest.mark.parametrize("dtype,values", [
    ("string", ["a", "b"]),
    ("boolean", [False, True]),
    ("Float64", [0.0, 1.0]),
    ("Int64", [0, 1]),
])
def test_numpy_backed_extension_labels_do_not_require_arrow_path(
        dtype, values):
    labels = pd.Series(values, dtype=dtype)
    analyzer = PredictionsAnalyzer(
        labels.copy(),
        pd.DataFrame({"feature": [0, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [False, False]


def test_model_multioutput_predictions_work_in_heatmap_and_tree():
    predictions = np.array([[1, 1], [0, 1], [0, 1], [1, 0]])
    labels = np.array([[1, 0], [1, 1], [0, 1], [0, 0]])
    analyzer = ModelAnalyzer(
        FixedPredictionModel(predictions),
        pd.DataFrame({"feature": [0, 0, 1, 1]}),
        labels,
        ["feature"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=Metrics.ACCURACY_SCORE,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert sorted([
        cell["metricValue"] for cell in heatmap["matrix"][0]
    ]) == [0, 0.5]
    assert tree[0]["metricValue"] == 0.25


def test_multioutput_integer_rows_preserve_unrepresentable_ranges():
    analyzer = PredictionsAnalyzer(
        pd.Series([[2**63, -1], [2**63 + 2, 0]]),
        pd.DataFrame({"feature": [0, 1]}),
        pd.Series([[2**63 + 1, -1], [2**63 + 2, 0]]),
        ["feature"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=Metrics.ERROR_RATE,
    )

    assert analyzer.get_diff().tolist() == [True, False]
    assert analyzer.compute_root_stats()[RootKeys.METRIC_VALUE] == 50


@pytest.mark.parametrize("container", ["raw", "series"])
def test_arrow_float_nulls_preserve_missing_regression_residuals(container):
    pa = pytest.importorskip("pyarrow")
    labels = pa.array([1.0, None, 3.0], type=pa.float64())
    if container == "series":
        labels = pd.Series(pd.arrays.ArrowExtensionArray(labels))
    analyzer = PredictionsAnalyzer(
        np.array([2.0, 2.0, 2.0]),
        pd.DataFrame({"row": [0, 1, 2]}),
        labels,
        ["row"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_ABSOLUTE_ERROR,
    )

    residuals = analyzer.get_diff()

    assert residuals[[0, 2]].tolist() == [1, -1]
    assert np.isnan(residuals[1])


def test_object_column_regression_predictions_work_in_views():
    analyzer = ModelAnalyzer(
        FixedPredictionModel(np.array([[2], [3]], dtype=object)),
        pd.DataFrame({"feature": [0, 1]}),
        np.array([1, 2]),
        ["feature"],
        [],
        model_task=ModelTask.REGRESSION,
        metric=Metrics.MEAN_SQUARED_ERROR,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert all(
        cell["metricValue"] == 1 for cell in heatmap["matrix"][0])
    assert tree[0]["metricValue"] == 1


def test_missing_binary_class_order_is_row_invariant():
    def outcome_rows(labels, predictions, code):
        analyzer = PredictionsAnalyzer(
            predictions,
            pd.DataFrame({"row": range(len(labels))}),
            labels,
            ["row"],
            [],
            model_task=ModelTask.CLASSIFICATION,
            metric=Metrics.ERROR_RATE,
        )
        return filter_from_cohort(
            analyzer,
            [{
                ARG: [code],
                COLUMN: "Classification outcome",
                METHOD: CohortFilterMethods.METHOD_INCLUDES,
            }],
            None,
            include_original_columns_only=True,
        )["row"].tolist()

    labels = [np.nan, 0]
    predictions = [0, 0]
    original = {
        code: outcome_rows(labels, predictions, code)
        for code in range(4)
    }
    reversed_rows = {
        code: outcome_rows(
            list(reversed(labels)), list(reversed(predictions)), code)
        for code in range(4)
    }

    assert {
        code: [1 - row for row in rows]
        for code, rows in original.items()
    } == reversed_rows


def test_sparse_multilabel_predictions_work_in_views():
    analyzer = PredictionsAnalyzer(
        sparse.csr_matrix([[1, 1], [1, 1], [0, 0]]),
        pd.DataFrame({"feature": [0, 0, 1]}),
        np.array([[1, 0], [1, 1], [0, 1]]),
        ["feature"],
        [],
        model_task=ModelTask.MULTILABEL_IMAGE_CLASSIFICATION,
        metric=Metrics.ACCURACY_SCORE,
    )

    heatmap = analyzer.compute_matrix(["feature", None], None, None)
    tree = analyzer.compute_error_tree(
        ["feature"], None, None, min_child_samples=1)

    assert sorted(
        cell["metricValue"] for cell in heatmap["matrix"][0]
    ) == [0, 0.5]
    assert tree[0]["metricValue"] == pytest.approx(1 / 3)
