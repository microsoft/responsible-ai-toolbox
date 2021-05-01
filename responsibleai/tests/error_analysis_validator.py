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


def setup_error_analysis(model_analysis, add_ea=True):
    if add_ea:
        model_analysis.error_analysis.add()
        with pytest.raises(DuplicateManagerConfigException):
            model_analysis.error_analysis.add()
    model_analysis.error_analysis.compute()


def validate_error_analysis(model_analysis):
    reports = model_analysis.error_analysis.get()
    assert isinstance(reports, list)
    assert len(reports) == 1
    report = reports[0]
    json_matrix = report.json_matrix

    ea_x_train = model_analysis.error_analysis._train
    ea_y_train = model_analysis.error_analysis._y_train

    expected_count = len(ea_x_train)
    if json_matrix is not None:
        predictions = model_analysis.model.predict(ea_x_train)
        expected_false_count = sum(predictions != ea_y_train)
        validate_matrix(json_matrix, expected_count, expected_false_count)

    json_tree = report.json_tree
    validate_tree(json_tree, expected_count)


def validate_matrix(json_matrix, exp_total_count, exp_total_false_count):
    assert MATRIX in json_matrix
    assert CATEGORY1 in json_matrix
    assert CATEGORY2 in json_matrix
    num_cat1 = len(json_matrix[CATEGORY1][VALUES])
    num_cat2 = len(json_matrix[CATEGORY2][VALUES])
    assert len(json_matrix[MATRIX]) == num_cat1
    assert len(json_matrix[MATRIX][0]) == num_cat2
    # take sum of count, false count
    total_count = 0
    total_false_count = 0
    for i in range(num_cat1):
        for j in range(num_cat2):
            total_count += json_matrix[MATRIX][i][j][COUNT]
            total_false_count += json_matrix[MATRIX][i][j][FALSE_COUNT]
    assert exp_total_count == total_count
    assert exp_total_false_count == total_false_count


def validate_tree(json_tree, expected_count):
    assert json_tree is not None
    assert len(json_tree) > 0
    assert ERROR in json_tree[0]
    assert ID in json_tree[0]
    assert PARENTID in json_tree[0]
    assert json_tree[0][PARENTID] is None
    assert SIZE in json_tree[0]
    assert json_tree[0][SIZE] == expected_count
