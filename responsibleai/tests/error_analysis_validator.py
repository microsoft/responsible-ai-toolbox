# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import pytest

from erroranalysis._internal.matrix_filter import (
    CATEGORY1, CATEGORY2, COUNT, FALSE_COUNT, MATRIX, VALUES)
from responsibleai.exceptions import DuplicateManagerConfigException

SIZE = 'size'
PARENTID = 'parentId'
ERROR = 'error'
ID = 'id'


def setup_error_analysis(model_analysis, add_ea=True, max_depth=3):
    if add_ea:
        model_analysis.error_analysis.add(max_depth=max_depth)
        with pytest.raises(DuplicateManagerConfigException):
            model_analysis.error_analysis.add(max_depth=max_depth)
    model_analysis.error_analysis.compute()


def validate_error_analysis(model_analysis, expected_reports=1):
    reports = model_analysis.error_analysis.get()
    assert isinstance(reports, list)
    assert len(reports) == expected_reports
    for report in reports:
        matrix = report.matrix

        ea_x_dataset = model_analysis.error_analysis._dataset
        ea_true_y = model_analysis.error_analysis._true_y

        expected_count = len(ea_x_dataset)
        if matrix is not None:
            predictions = model_analysis.model.predict(ea_x_dataset)
            expected_false_count = sum(predictions != ea_true_y)
            validate_matrix(matrix, expected_count, expected_false_count)

        tree = report.tree
        validate_tree(tree, expected_count)


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


def validate_tree(tree, expected_count):
    assert tree is not None
    assert len(tree) > 0
    assert ERROR in tree[0]
    assert ID in tree[0]
    assert PARENTID in tree[0]
    assert tree[0][PARENTID] is None
    assert SIZE in tree[0]
    assert tree[0][SIZE] == expected_count
