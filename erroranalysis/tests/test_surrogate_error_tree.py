# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from common_utils import (
    create_iris_data, create_models_classification,
    create_adult_census_data, create_kneighbors_classifier)
from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.surrogate_error_tree import (
    create_surrogate_model, get_categorical_info, get_max_split_index,
    traverse, TreeSide)
from erroranalysis._internal.constants import (PRED_Y,
                                               TRUE_Y,
                                               DIFF,
                                               SPLIT_INDEX,
                                               SPLIT_FEATURE,
                                               LEAF_INDEX)

SIZE = 'size'
PARENTID = 'parentId'
ERROR = 'error'
ID = 'id'


class TestSurrogateErrorTree(object):

    def test_surrogate_error_tree_iris(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)

    def test_surrogate_error_tree_int_categorical(self):
        X_train, X_test, y_train, y_test, categorical_features = \
            create_adult_census_data()

        model = create_kneighbors_classifier(X_train, y_train)

        run_error_analyzer(model, X_test, y_test, list(X_train.columns),
                           categorical_features)

    def test_traverse_tree(self):
        X_train, X_test, y_train, y_test, categorical_features = \
            create_adult_census_data()
        model = create_kneighbors_classifier(X_train, y_train)
        feature_names = list(X_train.columns)
        error_analyzer = ModelAnalyzer(model, X_test, y_test,
                                       feature_names,
                                       categorical_features)
        categorical_info = get_categorical_info(error_analyzer,
                                                feature_names)
        cat_ind_reindexed, categories_reindexed = categorical_info
        pred_y = model.predict(X_test)
        diff = pred_y != y_test
        max_depth = 3
        num_leaves = 31
        surrogate = create_surrogate_model(error_analyzer,
                                           X_test,
                                           diff,
                                           max_depth,
                                           num_leaves,
                                           cat_ind_reindexed)
        model_json = surrogate._Booster.dump_model()
        tree_structure = model_json["tree_info"][0]['tree_structure']
        max_split_index = get_max_split_index(tree_structure) + 1
        filtered_indexed_df = X_test
        filtered_indexed_df[DIFF] = diff
        filtered_indexed_df[TRUE_Y] = y_test
        filtered_indexed_df[PRED_Y] = pred_y
        json_tree = traverse(filtered_indexed_df,
                             tree_structure,
                             max_split_index,
                             (categories_reindexed,
                              cat_ind_reindexed),
                             [],
                             feature_names,
                             metric=error_analyzer.metric)
        # create dictionary from json tree id to values
        json_tree_dict = {}
        for entry in json_tree:
            json_tree_dict[entry['id']] = entry
        validate_traversed_tree(tree_structure, json_tree_dict,
                                max_split_index, feature_names)


def run_error_analyzer(model, X_test, y_test, feature_names,
                       categorical_features, tree_features=None):
    error_analyzer = ModelAnalyzer(model, X_test, y_test,
                                   feature_names,
                                   categorical_features)
    if tree_features is None:
        tree_features = feature_names
    filters = None
    composite_filters = None
    json_tree = error_analyzer.compute_error_tree(tree_features,
                                                  filters,
                                                  composite_filters)
    assert json_tree is not None
    assert len(json_tree) > 0
    assert ERROR in json_tree[0]
    assert ID in json_tree[0]
    assert PARENTID in json_tree[0]
    assert json_tree[0][PARENTID] is None
    assert SIZE in json_tree[0]
    assert json_tree[0][SIZE] == len(X_test)


def validate_traversed_tree(tree, json_tree_dict, max_split_index,
                            feature_names, parent_id=None):
    if SPLIT_INDEX in tree:
        nodeid = tree[SPLIT_INDEX]
    elif LEAF_INDEX in tree:
        nodeid = max_split_index + tree[LEAF_INDEX]
    else:
        nodeid = 0

    assert json_tree_dict[nodeid]['id'] == nodeid
    assert json_tree_dict[nodeid]['parentId'] == parent_id
    if SPLIT_FEATURE in tree:
        node_name = feature_names[tree[SPLIT_FEATURE]]
    else:
        node_name = None
    assert json_tree_dict[nodeid]['nodeName'] == node_name

    # validate children
    if 'leaf_value' not in tree:
        left_child = tree[TreeSide.LEFT_CHILD]
        right_child = tree[TreeSide.RIGHT_CHILD]
        validate_traversed_tree(left_child,
                                json_tree_dict,
                                max_split_index,
                                feature_names,
                                nodeid)
        validate_traversed_tree(right_child,
                                json_tree_dict,
                                max_split_index,
                                feature_names,
                                nodeid)
