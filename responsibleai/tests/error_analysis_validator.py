# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import pytest

from erroranalysis._internal.matrix_filter import (
    CATEGORY1, CATEGORY2, COUNT, FALSE_COUNT, MATRIX, VALUES)
from responsibleai.exceptions import DuplicateManagerConfigException, \
    UserConfigValidationException
from responsibleai._internal.constants import (
    ErrorAnalysisManagerKeys as Keys)

SIZE = 'size'
PARENTID = 'parentId'
ERROR = 'error'
ID = 'id'
MIN_CHILD_SAMPLES = Keys.MIN_CHILD_SAMPLES
REPORTS = Keys.REPORTS
FILTER_FEATURES = Keys.FILTER_FEATURES


def setup_error_analysis(model_analysis, add_ea=True, max_depth=3):
    if add_ea:
        if model_analysis.model is None:
            with pytest.raises(UserConfigValidationException,
                               match='Model is required for error analysis'):
                model_analysis.error_analysis.add(max_depth=max_depth)
        else:
            model_analysis.error_analysis.add(max_depth=max_depth)
            with pytest.raises(DuplicateManagerConfigException):
                model_analysis.error_analysis.add(max_depth=max_depth)
    model_analysis.error_analysis.compute()


def validate_error_analysis(model_analysis, expected_reports=1):
    if model_analysis.model is None:
        return
    reports = model_analysis.error_analysis.get()
    assert isinstance(reports, list)
    assert len(reports) == expected_reports
    ea_info_list = model_analysis.error_analysis.list()
    for idx, report in enumerate(reports):
        matrix = report.matrix
        matrix_features = report.matrix_features
        tree_features = report.tree_features
        info_features = ea_info_list[REPORTS][idx][FILTER_FEATURES]
        assert matrix_features == info_features
        assert tree_features == model_analysis.error_analysis._feature_names

        ea_x_dataset = model_analysis.error_analysis._dataset
        ea_true_y = model_analysis.error_analysis._true_y

        expected_count = len(ea_x_dataset)
        if matrix is not None:
            predictions = model_analysis.model.predict(ea_x_dataset)
            expected_false_count = sum(predictions != ea_true_y)
            validate_matrix(matrix, expected_count, expected_false_count)

        tree = report.tree
        min_child_samples = ea_info_list[REPORTS][idx][MIN_CHILD_SAMPLES]
        validate_tree(tree, expected_count, min_child_samples)


def validate_matrix(matrix, exp_total_count, exp_total_false_count):
    assert MATRIX in matrix
    assert CATEGORY1 in matrix
    assert CATEGORY2 in matrix
    num_cat1 = len(matrix[CATEGORY1][VALUES])
    num_cat2 = len(matrix[CATEGORY2][VALUES])
    assert len(matrix[MATRIX]) == num_cat1
    assert len(matrix[MATRIX][0]) == num_cat2
    # take sum of count, false count
    total_count = 0
    total_false_count = 0
    for i in range(num_cat1):
        for j in range(num_cat2):
            total_count += matrix[MATRIX][i][j][COUNT]
            total_false_count += matrix[MATRIX][i][j][FALSE_COUNT]
    assert exp_total_count == total_count
    assert exp_total_false_count == total_false_count


def validate_tree(tree, expected_count, min_child_samples):
    assert tree is not None
    assert len(tree) > 0
    assert ERROR in tree[0]
    assert ID in tree[0]
    assert PARENTID in tree[0]
    assert tree[0][PARENTID] is None
    assert SIZE in tree[0]
    assert tree[0][SIZE] == expected_count
    for node in tree:
        assert node[SIZE] >= min_child_samples
