# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from enum import Enum
from erroranalysis._internal.cohort_filter import filter_from_cohort
from erroranalysis._internal.constants import (TRUE_Y,
                                               ROW_INDEX,
                                               DIFF,
                                               SPLIT_INDEX,
                                               SPLIT_FEATURE,
                                               LEAF_INDEX,
                                               METHOD,
                                               METHOD_EXCLUDES,
                                               METHOD_INCLUDES)


class TreeSide(str, Enum):
    """Provide model task constants.
    Can be 'classification', 'regression', or 'unknown'.

    By default the model domain is inferred if 'unknown',
    but this can be overridden if you specify
    'classification' or 'regression'.
    """

    RIGHT_CHILD = 'right_child'
    LEFT_CHILD = 'left_child'
    UNKNOWN = 'unknown'


def compute_json_error_tree(analyzer, features, filters,
                            composite_filters):
    # Fit a surrogate model on errors
    surrogate = LGBMClassifier(n_estimators=1, max_depth=3)
    filtered_df = filter_from_cohort(analyzer.dataset,
                                     filters,
                                     composite_filters,
                                     analyzer.feature_names,
                                     analyzer.true_y,
                                     analyzer.categorical_features,
                                     analyzer.categories)
    row_index = filtered_df[ROW_INDEX]
    true_y = filtered_df[TRUE_Y]
    input_data = filtered_df.drop(columns=[TRUE_Y, ROW_INDEX])
    is_pandas = isinstance(analyzer.dataset, pd.DataFrame)
    if is_pandas:
        true_y = true_y.to_numpy()
    else:
        input_data = input_data.to_numpy()
    diff = analyzer.model.predict(input_data) != true_y
    if not isinstance(diff, np.ndarray):
        diff = np.array(diff)
    indexes = []
    for feature in features:
        indexes.append(analyzer.feature_names.index(feature))
    if is_pandas:
        input_data = input_data.to_numpy()
    cat_ind_reindexed = []
    categories_reindexed = []
    if analyzer.categorical_features:
        # Inplace replacement of columns
        for idx, c_i in enumerate(analyzer.categorical_indexes):
            input_data[:, c_i] = analyzer.string_indexed_data[row_index, idx]
    dataset_sub_features = input_data[:, indexes]
    dataset_sub_names = np.array(analyzer.feature_names)[np.array(indexes)]
    dataset_sub_names = list(dataset_sub_names)
    if analyzer.categorical_features:
        for c_index, feature in enumerate(analyzer.categorical_features):
            try:
                index_sub = dataset_sub_names.index(feature)
            except ValueError:
                continue
            cat_ind_reindexed.append(index_sub)
            categories_reindexed.append(analyzer.categories[c_index])
        surrogate.fit(dataset_sub_features, diff,
                      categorical_feature=cat_ind_reindexed)
    else:
        surrogate.fit(dataset_sub_features, diff)
    filtered_indexed_df = pd.DataFrame(dataset_sub_features,
                                       columns=dataset_sub_names)
    filtered_indexed_df[DIFF] = diff
    model_json = surrogate._Booster.dump_model()
    tree_structure = model_json["tree_info"][0]['tree_structure']
    max_split_index = get_max_split_index(tree_structure) + 1
    json_tree = traverse(filtered_indexed_df,
                         tree_structure,
                         max_split_index,
                         (categories_reindexed,
                          cat_ind_reindexed),
                         [], dataset_sub_names)
    return json_tree


def get_max_split_index(tree):
    if SPLIT_INDEX in tree:
        max_index = tree[SPLIT_INDEX]
        index1 = get_max_split_index(tree[TreeSide.LEFT_CHILD])
        index2 = get_max_split_index(tree[TreeSide.RIGHT_CHILD])
        return max(max(max_index, index1), index2)
    else:
        return 0


def traverse(df, tree, max_split_index,
             categories, json, feature_names, parent=None,
             side=TreeSide.UNKNOWN):
    if SPLIT_INDEX in tree:
        nodeid = tree[SPLIT_INDEX]
    elif LEAF_INDEX in tree:
        nodeid = max_split_index + tree[LEAF_INDEX]
    else:
        nodeid = 0

    # write current node to json
    json, df = node_to_json(df, tree, nodeid, categories, json,
                            feature_names, parent, side)

    # write children to json
    if 'leaf_value' not in tree:
        left_child = tree[TreeSide.LEFT_CHILD]
        right_child = tree[TreeSide.RIGHT_CHILD]
        json = traverse(df, left_child, max_split_index,
                        categories, json, feature_names,
                        tree, TreeSide.LEFT_CHILD)
        json = traverse(df, right_child, max_split_index,
                        categories, json, feature_names,
                        tree, TreeSide.RIGHT_CHILD)
    return json


def node_to_json(df, tree, nodeid, categories, json,
                 feature_names, parent=None,
                 side=TreeSide.UNKNOWN):
    p_node_name = None
    condition = None
    arg = None
    method = None
    parentid = None
    if parent is not None:
        parentid = int(parent[SPLIT_INDEX])
        p_node_name = feature_names[parent[SPLIT_FEATURE]]
        parent_threshold = parent['threshold']
        parent_decision_type = parent['decision_type']
        if side == TreeSide.RIGHT_CHILD:
            if parent_decision_type == '<=':
                method = "less and equal"
                arg = float(parent_threshold)
                condition = "{} <= {:.2f}".format(p_node_name,
                                                  parent_threshold)
                query = "`" + p_node_name + "` <= " + str(parent_threshold)
                df = df.query(query)
            elif parent_decision_type == '==':
                method = METHOD_INCLUDES
                arg = [float(i) for i in parent_threshold.split('||')]
                categorical_values = categories[0]
                categorical_indexes = categories[1]
                thresholds = []
                catcoli = categorical_indexes.index(parent[SPLIT_FEATURE])
                catvals = categorical_values[catcoli]
                for argi in arg:
                    encoded_val = catvals[int(argi)]
                    thresholds.append(encoded_val)
                threshold_str = " | ".join(thresholds)
                condition = "{} == {}".format(p_node_name,
                                              threshold_str)
                query = []
                for argi in arg:
                    query.append("`" + p_node_name + "` == " + str(argi))
                df = df.query(" | ".join(query))
        elif side == TreeSide.LEFT_CHILD:
            if parent_decision_type == '<=':
                method = "greater"
                arg = float(parent_threshold)
                condition = "{} > {:.2f}".format(p_node_name,
                                                 parent_threshold)
                query = "`" + p_node_name + "` > " + str(parent_threshold)
                df = df.query(query)
            elif parent_decision_type == '==':
                method = METHOD_EXCLUDES
                arg = [float(i) for i in parent_threshold.split('||')]
                categorical_values = categories[0]
                categorical_indexes = categories[1]
                thresholds = []
                catcoli = categorical_indexes.index(parent[SPLIT_FEATURE])
                catvals = categorical_values[catcoli]
                for argi in arg:
                    encoded_val = catvals[int(argi)]
                    thresholds.append(encoded_val)
                threshold_str = " | ".join(thresholds)
                condition = "{} != {}".format(p_node_name,
                                              threshold_str)
                query = []
                for argi in arg:
                    query.append("`" + p_node_name + "` != " + str(argi))
                df = df.query(" & ".join(query))
    error = df[DIFF].values.sum()
    total = df.shape[0]
    success = total - error
    if SPLIT_FEATURE in tree:
        node_name = feature_names[tree[SPLIT_FEATURE]]
    else:
        node_name = None
    json.append({
        "arg": arg,
        "badFeaturesRowCount": 0,
        "condition": condition,
        "error": float(error),
        "id": int(nodeid),
        METHOD: method,
        "nodeIndex": int(nodeid),
        "nodeName": node_name,
        "parentId": parentid,
        "parentNodeName": p_node_name,
        "pathFromRoot": "",
        "size": float(success + error),
        "sourceRowKeyHash": "hashkey",
        "success": float(success)
    })
    return json, df
