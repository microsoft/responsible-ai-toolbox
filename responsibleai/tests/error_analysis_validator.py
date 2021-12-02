# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
import pytest

from erroranalysis._internal.matrix_filter import (CATEGORY1, CATEGORY2, COUNT,
                                                   FALSE_COUNT, MATRIX, VALUES)
from responsibleai._internal.constants import ErrorAnalysisManagerKeys as Keys
from responsibleai.exceptions import (DuplicateManagerConfigException,
                                      UserConfigValidationException)

SIZE = 'size'
PARENTID = 'parentId'
ERROR = 'error'
ID = 'id'
MIN_CHILD_SAMPLES = Keys.MIN_CHILD_SAMPLES
REPORTS = Keys.REPORTS
FILTER_FEATURES = Keys.FILTER_FEATURES


def setup_error_analysis(rai_insights, add_ea=True, max_depth=3):
    if add_ea:
        if rai_insights.model is None:
            with pytest.raises(UserConfigValidationException,
                               match='Model is required for error analysis'):
                rai_insights.error_analysis.add(max_depth=max_depth)
        else:
            rai_insights.error_analysis.add(max_depth=max_depth)
            with pytest.raises(DuplicateManagerConfigException):
                rai_insights.error_analysis.add(max_depth=max_depth)
    rai_insights.error_analysis.compute()


def validate_error_analysis(rai_insights, expected_reports=1):
    if rai_insights.model is None:
        return
    reports = rai_insights.error_analysis.get()
    assert isinstance(reports, list)
    assert len(reports) == expected_reports
    ea_info_list = rai_insights.error_analysis.list()
    for idx, report in enumerate(reports):
        matrix = report.matrix
        matrix_features = report.matrix_features
        importances = report.importances
        tree_features = report.tree_features
        info_features = ea_info_list[REPORTS][idx][FILTER_FEATURES]
        assert matrix_features == info_features
        assert tree_features == rai_insights.error_analysis._feature_names

        ea_x_dataset = rai_insights.error_analysis._dataset
        ea_true_y = rai_insights.error_analysis._true_y

        expected_count = len(ea_x_dataset)
        if matrix is not None:
            predictions = rai_insights.model.predict(ea_x_dataset)
            expected_false_count = sum(predictions != ea_true_y)
            validate_matrix(matrix, expected_count, expected_false_count)

        tree = report.tree
        min_child_samples = ea_info_list[REPORTS][idx][MIN_CHILD_SAMPLES]
        validate_tree(tree, expected_count, min_child_samples)
        num_features = len(rai_insights.error_analysis._feature_names)
        assert len(importances) == num_features


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
