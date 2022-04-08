# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import time

import pandas as pd
import pytest
from common_utils import (create_adult_census_data,
                          create_binary_classification_dataset,
                          create_cancer_data, create_diabetes_data,
                          create_iris_data, create_kneighbors_classifier,
                          create_models_classification,
                          create_sklearn_random_forest_regressor,
                          replicate_dataset)

from erroranalysis._internal.cohort_filter import filter_from_cohort
from erroranalysis._internal.constants import (ARG, COLUMN, COMPOSITE_FILTERS,
                                               DIFF, LEAF_INDEX, METHOD,
                                               OPERATION, PRED_Y, ROW_INDEX,
                                               SPLIT_FEATURE, SPLIT_INDEX,
                                               TRUE_Y, CohortFilterMethods,
                                               CohortFilterOps, Metrics)
from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.surrogate_error_tree import (
    TreeSide, cache_subtree_features, create_surrogate_model,
    get_categorical_info, get_max_split_index, traverse)

SIZE = 'size'
PARENTID = 'parentId'
ERROR = 'error'
ID = 'id'


class TestSurrogateErrorTree(object):

    def test_surrogate_error_tree_iris(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        models = create_models_classification(X_train, y_train)

        for model in models:
            run_error_analyzer(model, X_test, y_test, feature_names)

    def test_surrogate_error_tree_int_categorical(self):
        X_train, X_test, y_train, y_test, categorical_features = \
            create_adult_census_data()

        model = create_kneighbors_classifier(X_train, y_train)

        run_error_analyzer(model, X_test, y_test, list(X_train.columns),
                           categorical_features)

    def test_large_data_surrogate_error_tree(self):
        # validate tree trains quickly for large data
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset(100)
        feature_names = list(X_train.columns)
        model = create_sklearn_random_forest_regressor(X_train, y_train)
        X_test, y_test = replicate_dataset(X_test, y_test)
        assert X_test.shape[0] > 1000000
        t0 = time.time()
        categorical_features = []
        model_analyzer = ModelAnalyzer(model, X_test, y_test,
                                       feature_names, categorical_features)
        max_depth = 3
        num_leaves = 31
        min_child_samples = 20
        categories_reindexed = []
        cat_ind_reindexed = []
        diff = model_analyzer.get_diff()
        surrogate = create_surrogate_model(model_analyzer,
                                           X_test,
                                           diff,
                                           max_depth,
                                           num_leaves,
                                           min_child_samples,
                                           cat_ind_reindexed)
        t1 = time.time()
        execution_time = t1 - t0
        print("creating surrogate model took {} seconds".format(
            execution_time))
        # assert we don't take too long to train the tree on 1 million rows
        # note we train on >1 million rows in ~1 second
        assert execution_time < 20
        model_json = surrogate._Booster.dump_model()
        tree_structure = model_json["tree_info"][0]['tree_structure']
        max_split_index = get_max_split_index(tree_structure) + 1
        assert max_split_index == 3
        cache_subtree_features(tree_structure, feature_names)
        pred_y = model_analyzer.model.predict(X_test)
        traversed_X_test = X_test.copy()
        traversed_X_test[DIFF] = diff
        traversed_X_test[TRUE_Y] = y_test
        traversed_X_test[PRED_Y] = pred_y
        t2 = time.time()
        tree = traverse(traversed_X_test,
                        tree_structure,
                        max_split_index,
                        (categories_reindexed,
                         cat_ind_reindexed),
                        [],
                        feature_names,
                        metric=model_analyzer.metric,
                        classes=model_analyzer.classes)
        t3 = time.time()
        execution_time = t3 - t2
        print("traversing tree took {} seconds".format(execution_time))
        assert tree is not None

    @pytest.mark.parametrize('string_labels', [True, False])
    @pytest.mark.parametrize('metric', [Metrics.ERROR_RATE,
                                        Metrics.PRECISION_SCORE,
                                        Metrics.RECALL_SCORE,
                                        Metrics.ACCURACY_SCORE,
                                        Metrics.F1_SCORE])
    def test_traverse_tree(self, string_labels, metric):
        X_train, X_test, y_train, y_test, categorical_features = \
            create_adult_census_data(string_labels)
        model = create_kneighbors_classifier(X_train, y_train)
        feature_names = list(X_train.columns)
        error_analyzer = ModelAnalyzer(model, X_test, y_test,
                                       feature_names,
                                       categorical_features,
                                       metric=metric)
        categorical_info = get_categorical_info(error_analyzer,
                                                feature_names)
        cat_ind_reindexed, categories_reindexed = categorical_info
        pred_y = model.predict(X_test)
        diff = pred_y != y_test
        max_depth = 3
        num_leaves = 31
        min_child_samples = 20
        surrogate = create_surrogate_model(error_analyzer,
                                           X_test,
                                           diff,
                                           max_depth,
                                           num_leaves,
                                           min_child_samples,
                                           cat_ind_reindexed)
        model_json = surrogate._Booster.dump_model()
        tree_structure = model_json["tree_info"][0]['tree_structure']
        max_split_index = get_max_split_index(tree_structure) + 1
        filtered_indexed_df = X_test
        filtered_indexed_df[DIFF] = diff
        filtered_indexed_df[TRUE_Y] = y_test
        filtered_indexed_df[PRED_Y] = pred_y
        cache_subtree_features(tree_structure, feature_names)
        tree = traverse(filtered_indexed_df,
                        tree_structure,
                        max_split_index,
                        (categories_reindexed,
                         cat_ind_reindexed),
                        [],
                        feature_names,
                        metric=error_analyzer.metric)
        # create dictionary from json tree id to values
        tree_dict = {}
        for entry in tree:
            tree_dict[entry['id']] = entry
        validate_traversed_tree(tree_structure, tree_dict,
                                max_split_index, feature_names)

    @pytest.mark.parametrize('metric', [Metrics.ERROR_RATE,
                                        Metrics.MACRO_PRECISION_SCORE,
                                        Metrics.MICRO_PRECISION_SCORE,
                                        Metrics.MACRO_RECALL_SCORE,
                                        Metrics.MICRO_RECALL_SCORE,
                                        Metrics.MACRO_F1_SCORE,
                                        Metrics.MICRO_F1_SCORE,
                                        Metrics.ACCURACY_SCORE])
    @pytest.mark.parametrize('min_child_samples', [5, 10, 20])
    @pytest.mark.parametrize('max_depth', [3, 4])
    @pytest.mark.parametrize('num_leaves', [5, 10, 31])
    def test_parameters(self, metric, min_child_samples,
                        max_depth, num_leaves):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        model = create_kneighbors_classifier(X_train, y_train)
        run_error_analyzer(model, X_test, y_test, feature_names,
                           max_depth=max_depth,
                           num_leaves=num_leaves,
                           min_child_samples=min_child_samples,
                           metric=metric)

    def test_empty_cohort_cancer_classification(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        model = create_kneighbors_classifier(X_train, y_train)

        composite_filters = [{COMPOSITE_FILTERS:
                             [{COMPOSITE_FILTERS:
                              [{ARG: [20.45, 22.27],
                                COLUMN: 'mean radius',
                                METHOD: CohortFilterMethods.METHOD_RANGE},
                               {ARG: [10.88, 14.46],
                                COLUMN: 'mean texture',
                                METHOD: CohortFilterMethods.METHOD_RANGE}],
                               OPERATION: CohortFilterOps.AND}],
                             OPERATION: CohortFilterOps.OR}]
        run_error_analyzer(model, X_test, y_test, feature_names,
                           composite_filters=composite_filters)

    def test_empty_cohort_diabetes_regression(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_diabetes_data()

        model = create_kneighbors_classifier(X_train, y_train)

        composite_filters = [{COMPOSITE_FILTERS:
                             [{COMPOSITE_FILTERS:
                              [{ARG: [0.06],
                                COLUMN: 's1',
                                METHOD: CohortFilterMethods.METHOD_GREATER},
                               {ARG: [-0.01],
                                COLUMN: 's2',
                                METHOD: CohortFilterMethods.METHOD_LESS}],
                               OPERATION: CohortFilterOps.AND}],
                             OPERATION: CohortFilterOps.OR}]
        run_error_analyzer(model, X_test, y_test, feature_names,
                           composite_filters=composite_filters)


def run_error_analyzer(model, X_test, y_test, feature_names,
                       categorical_features=None, tree_features=None,
                       max_depth=3, num_leaves=31,
                       min_child_samples=20,
                       filters=None,
                       composite_filters=None,
                       metric=None):
    error_analyzer = ModelAnalyzer(model, X_test, y_test,
                                   feature_names,
                                   categorical_features,
                                   metric=metric)
    if tree_features is None:
        tree_features = feature_names
    tree = error_analyzer.compute_error_tree(
        tree_features, filters, composite_filters,
        max_depth=max_depth, num_leaves=num_leaves,
        min_child_samples=min_child_samples)
    validation_data = X_test
    if filters is not None or composite_filters is not None:
        validation_data = filter_from_cohort(error_analyzer,
                                             filters,
                                             composite_filters)
        y_test = validation_data[TRUE_Y]
        validation_data = validation_data.drop(columns=[TRUE_Y, ROW_INDEX])
        if not isinstance(X_test, pd.DataFrame):
            validation_data = validation_data.values
    validation_data_len = len(validation_data)
    assert tree is not None
    assert len(tree) > 0
    assert ERROR in tree[0]
    assert ID in tree[0]
    assert PARENTID in tree[0]
    assert tree[0][PARENTID] is None
    assert SIZE in tree[0]
    assert tree[0][SIZE] == validation_data_len
    for node in tree:
        assert node[SIZE] >= min(min_child_samples, validation_data_len)


def validate_traversed_tree(tree, tree_dict, max_split_index,
                            feature_names, parent_id=None):
    if SPLIT_INDEX in tree:
        nodeid = tree[SPLIT_INDEX]
    elif LEAF_INDEX in tree:
        nodeid = max_split_index + tree[LEAF_INDEX]
    else:
        nodeid = 0

    assert tree_dict[nodeid]['id'] == nodeid
    assert tree_dict[nodeid]['parentId'] == parent_id
    if SPLIT_FEATURE in tree:
        node_name = feature_names[tree[SPLIT_FEATURE]]
    else:
        node_name = None
    assert tree_dict[nodeid]['nodeName'] == node_name

    # validate children
    if 'leaf_value' not in tree:
        left_child = tree[TreeSide.LEFT_CHILD]
        right_child = tree[TreeSide.RIGHT_CHILD]
        validate_traversed_tree(left_child,
                                tree_dict,
                                max_split_index,
                                feature_names,
                                nodeid)
        validate_traversed_tree(right_child,
                                tree_dict,
                                max_split_index,
                                feature_names,
                                nodeid)
