# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numbers
from enum import Enum

import numpy as np
import pandas as pd
from lightgbm import Booster, LGBMClassifier, LGBMRegressor
from sklearn.metrics import (mean_absolute_error, mean_squared_error,
                             median_absolute_error, r2_score)

from erroranalysis._internal.cohort_filter import filter_from_cohort
from erroranalysis._internal.constants import (DIFF, LEAF_INDEX, METHOD,
                                               PRED_Y, ROW_INDEX,
                                               SPLIT_FEATURE, SPLIT_INDEX,
                                               TRUE_Y, CohortFilterMethods,
                                               Metrics, ModelTask, TreeNode,
                                               error_metrics, f1_metrics,
                                               metric_to_display_name,
                                               precision_metrics,
                                               recall_metrics,
                                               regression_metrics)
from erroranalysis._internal.metrics import get_ordered_classes, metric_to_func
from erroranalysis._internal.process_categoricals import process_categoricals
from erroranalysis._internal.utils import is_spark
from raiutils.exceptions import UserConfigValidationException

# imports required for pyspark support
try:
    import pyspark.sql.functions as F
    from synapse.ml.lightgbm import LightGBMClassifier, LightGBMRegressor
except ImportError:
    pass

MODEL = 'model'
DEFAULT_MAX_DEPTH = 3
DEFAULT_NUM_LEAVES = 31
DEFAULT_MIN_CHILD_SAMPLES = 20
CACHED_SUBTREE_FEATURES = 'cache_subtree_features'
LEAF_VALUE = 'leaf_value'
PREDICTION = 'prediction'
RAW_PREDICTION = 'rawPrediction'
PROBABILITY = 'probability'


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


def compute_json_error_tree(analyzer,
                            features,
                            filters,
                            composite_filters,
                            max_depth=DEFAULT_MAX_DEPTH,
                            num_leaves=DEFAULT_NUM_LEAVES,
                            min_child_samples=DEFAULT_MIN_CHILD_SAMPLES):
    """Computes the error tree for the given dataset.

    Note: this is for backcompat for older versions
    of raiwidgets pypi package

    :param analyzer: The error analyzer containing the categorical
        features and categories for the full dataset.
    :type analyzer: BaseAnalyzer
    :param features: The features to train the surrogate model on.
    :type features: numpy.ndarray or pandas.DataFrame
    :param filters: The filters to apply to the dataset.
    :type filters: numpy.ndarray or pandas.DataFrame
    :param composite_filters: The composite filters to apply to the dataset.
    :type composite_filters: numpy.ndarray or pandas.DataFrame
    :param max_depth: The maximum depth of the surrogate tree trained
        on errors.
    :type max_depth: int
    :param num_leaves: The number of leaves of the surrogate tree
        trained on errors.
    :type num_leaves: int
    :param min_child_samples: The minimal number of data required to
        create one leaf.
    :return: The tree representation as a list of nodes.
    :rtype: list[dict[str, str]]
    """
    return compute_error_tree(analyzer,
                              features,
                              filters,
                              composite_filters,
                              max_depth,
                              num_leaves,
                              min_child_samples)


def compute_error_tree_on_dataset(
        analyzer,
        features,
        dataset,
        max_depth=DEFAULT_MAX_DEPTH,
        num_leaves=DEFAULT_NUM_LEAVES,
        min_child_samples=DEFAULT_MIN_CHILD_SAMPLES):
    """Computes the error tree for the given dataset.

    :param analyzer: The error analyzer containing the categorical
        features and categories for the full dataset.
    :type analyzer: BaseAnalyzer
    :param features: The features to train the surrogate model on.
    :type features: numpy.ndarray or pandas.DataFrame
    :param dataset: The dataset on which matrix view needs to be computed.
        The dataset should have the feature columns and the columns
        'true_y' and 'index'. The 'true_y' column should have the true
        target values corresponding to the test data. The 'index'
        column should have the indices. If the analyzer is of type
        PredictionsAnalyzer, then the dataset should include the column
        'pred_y' which will hold the predictions.
    :type dataset: pd.DataFrame
    :param max_depth: The maximum depth of the surrogate tree trained
        on errors.
    :type max_depth: int
    :param num_leaves: The number of leaves of the surrogate tree
        trained on errors.
    :type num_leaves: int
    :param min_child_samples: The minimal number of data required to
        create one leaf.
    :return: The tree representation as a list of nodes.
    :rtype: list[dict[str, str]]
    """
    if max_depth is None:
        max_depth = DEFAULT_MAX_DEPTH
    if num_leaves is None:
        num_leaves = DEFAULT_NUM_LEAVES
    if min_child_samples is None:
        min_child_samples = DEFAULT_MIN_CHILD_SAMPLES

    if dataset.shape[0] == 0:
        return create_empty_node(analyzer.metric)
    is_model_analyzer = hasattr(analyzer, MODEL)
    indexes = []
    for feature in features:
        if feature not in analyzer.feature_names:
            msg = 'Feature {} not found in dataset. Existing features: {}'
            raise UserConfigValidationException(
                msg.format(feature, analyzer.feature_names))
        indexes.append(analyzer.feature_names.index(feature))
    dataset_sub_names = np.array(analyzer.feature_names)[np.array(indexes)]
    dataset_sub_names = list(dataset_sub_names)
    if not is_spark(dataset):
        booster, dataset_indexed_df, cat_info = get_surrogate_booster_local(
            dataset, analyzer, is_model_analyzer, indexes,
            dataset_sub_names, max_depth, num_leaves, min_child_samples)
        cat_ind_reindexed, categories_reindexed = cat_info
    else:
        booster, dataset_indexed_df = get_surrogate_booster_pyspark(
            dataset, analyzer, max_depth, num_leaves, min_child_samples)
        cat_ind_reindexed = []
        categories_reindexed = []
    dumped_model = booster.dump_model()
    tree_structure = dumped_model["tree_info"][0]['tree_structure']
    max_split_index = get_max_split_index(tree_structure) + 1
    cache_subtree_features(tree_structure, dataset_sub_names)
    tree = traverse(dataset_indexed_df,
                    tree_structure,
                    max_split_index,
                    (categories_reindexed,
                     cat_ind_reindexed),
                    [],
                    dataset_sub_names,
                    metric=analyzer.metric,
                    classes=analyzer.classes)
    return tree


def compute_error_tree(analyzer,
                       features,
                       filters,
                       composite_filters,
                       max_depth=DEFAULT_MAX_DEPTH,
                       num_leaves=DEFAULT_NUM_LEAVES,
                       min_child_samples=DEFAULT_MIN_CHILD_SAMPLES):
    """Computes the error tree for the given dataset.

    :param analyzer: The error analyzer containing the categorical
        features and categories for the full dataset.
    :type analyzer: BaseAnalyzer
    :param features: The features to train the surrogate model on.
    :type features: numpy.ndarray or pandas.DataFrame
    :param filters: The filters to apply to the dataset.
    :type filters: numpy.ndarray or pandas.DataFrame
    :param composite_filters: The composite filters to apply to the dataset.
    :type composite_filters: numpy.ndarray or pandas.DataFrame
    :param max_depth: The maximum depth of the surrogate tree trained
        on errors.
    :type max_depth: int
    :param num_leaves: The number of leaves of the surrogate tree
        trained on errors.
    :type num_leaves: int
    :param min_child_samples: The minimal number of data required to
        create one leaf.
    :return: The tree representation as a list of nodes.
    :rtype: list[dict[str, str]]

    :Example:

    An example of running compute_error_tree with a
    filter and a composite filter:

    >>> from erroranalysis._internal.error_analyzer import ModelAnalyzer
    >>> from erroranalysis._internal.surrogate_error_tree import (
    ...     compute_error_tree)
    >>> from erroranalysis._internal.constants import ModelTask
    >>> from sklearn.datasets import load_breast_cancer
    >>> from sklearn.model_selection import train_test_split
    >>> from sklearn import svm
    >>> breast_cancer_data = load_breast_cancer()
    >>> feature_names = breast_cancer_data.feature_names
    >>> X_train, X_test, y_train, y_test = train_test_split(
    ...     breast_cancer_data.data, breast_cancer_data.target,
    ...     test_size=0.2, random_state=0)
    >>> categorical_features = []
    >>> clf = svm.SVC(gamma=0.001, C=100., probability=True,
    ...               random_state=777)
    >>> model = clf.fit(X_train, y_train)
    >>> model_task = ModelTask.CLASSIFICATION
    >>> analyzer = ModelAnalyzer(model, X_test, y_test, feature_names,
    ...                          categorical_features, model_task=model_task)
    >>> filters = [{'arg': [23.85], 'column': 'mean radius',
    ...             'method': 'less and equal'}]
    >>> composite_filters = [{'compositeFilters':
    ...                      [{'compositeFilters':
    ...                       [{'arg': [13.45, 22.27],
    ...                         'column': 'mean radius',
    ...                         'method': 'in the range of'},
    ...                        {'arg': [10.88, 24.46],
    ...                         'column': 'mean texture',
    ...                         'method': 'in the range of'}],
    ...                        'operation': 'and'}],
    ...                      'operation': 'or'}]
    >>> tree = compute_error_tree(analyzer, ['mean radius', 'mean texture'],
    ...                           filters, composite_filters)
    """
    # Fit a surrogate model on errors
    filtered_df = filter_from_cohort(analyzer,
                                     filters,
                                     composite_filters)
    return compute_error_tree_on_dataset(
        analyzer,
        features,
        filtered_df,
        max_depth=max_depth,
        num_leaves=num_leaves,
        min_child_samples=min_child_samples
    )


def get_surrogate_booster_local(filtered_df, analyzer, is_model_analyzer,
                                indexes, dataset_sub_names, max_depth,
                                num_leaves, min_child_samples):
    """Get surrogate booster for local pandas DataFrame.

    Creates the surrogate model trained on errors and returns the booster.

    :param filtered_df: The filtered DataFrame.
    :type filtered_df: pandas.DataFrame
    :param analyzer: The error analyzer containing the categorical
        features and categories for the full dataset.
    :type analyzer: BaseAnalyzer
    :param is_model_analyzer: Whether the analyzer is a model analyzer.
    :type is_model_analyzer: bool
    :param indexes: The indexes of the features to train the surrogate model
        on.
    :type indexes: list[int]
    :param dataset_sub_names: The names of the features to train the
        surrogate model on.
    :type dataset_sub_names: list[str]
    :param max_depth: The maximum depth of the surrogate tree trained
        on errors.
    :type max_depth: int
    :param num_leaves: The number of leaves of the surrogate tree
        trained on errors.
    :type num_leaves: int
    :param min_child_samples: The minimal number of data required to
        create one leaf.
    :type min_child_samples: int
    :return: The extracted booster from the surrogate model and the
        scored dataset.
    :rtype: (Booster, pandas.DataFrame, (list[str], list[int]))
    """
    true_y = filtered_df[TRUE_Y]
    dropped_cols = [TRUE_Y, ROW_INDEX]
    if not is_model_analyzer:
        pred_y = filtered_df[PRED_Y]
        dropped_cols.append(PRED_Y)
    input_data = filtered_df.drop(columns=dropped_cols)
    is_pandas = isinstance(analyzer.dataset, pd.DataFrame)
    if is_pandas:
        true_y = true_y.to_numpy()
    else:
        input_data = input_data.to_numpy(copy=True)
    if is_model_analyzer:
        pred_y = analyzer.model.predict(input_data)
    if analyzer.model_task == ModelTask.CLASSIFICATION:
        diff = pred_y != true_y
    else:
        diff = pred_y - true_y
    if not isinstance(diff, np.ndarray):
        diff = np.array(diff)
    if not isinstance(pred_y, np.ndarray):
        pred_y = np.array(pred_y)
    if not isinstance(true_y, np.ndarray):
        true_y = np.array(true_y)
    if is_pandas:
        input_data = input_data.to_numpy(copy=True)

    if analyzer.categorical_features:
        # Inplace replacement of columns
        if len(input_data) != len(analyzer.string_indexed_data):
            _, _, _, string_indexed_data = \
                process_categoricals(
                    all_feature_names=analyzer._feature_names,
                    categorical_features=analyzer._categorical_features,
                    dataset=input_data)
        else:
            string_indexed_data = analyzer.string_indexed_data
        for idx, c_i in enumerate(analyzer.categorical_indexes):
            input_data[:, c_i] = string_indexed_data[:, idx]
    dataset_sub_features = input_data[:, indexes]

    categorical_info = get_categorical_info(analyzer,
                                            dataset_sub_names)
    cat_ind_reindexed, categories_reindexed = categorical_info

    surrogate = create_surrogate_model(analyzer,
                                       dataset_sub_features,
                                       diff,
                                       max_depth,
                                       num_leaves,
                                       min_child_samples,
                                       cat_ind_reindexed)

    filtered_indexed_df = pd.DataFrame(dataset_sub_features,
                                       columns=dataset_sub_names)
    filtered_indexed_df[DIFF] = diff
    filtered_indexed_df[TRUE_Y] = true_y
    filtered_indexed_df[PRED_Y] = pred_y
    return surrogate._Booster, filtered_indexed_df, categorical_info


def get_surrogate_booster_pyspark(filtered_df, analyzer, max_depth,
                                  num_leaves, min_child_samples):
    """Get surrogate booster for pyspark DataFrame.

    Creates the surrogate model trained on errors and returns the booster.

    :param filtered_df: The filtered DataFrame.
    :type filtered_df: pyspark.sql.DataFrame
    :param analyzer: The error analyzer containing the categorical
        features and categories for the full dataset.
    :type analyzer: BaseAnalyzer
    :param max_depth: The maximum depth of the surrogate tree trained
        on errors.
    :type max_depth: int
    :param num_leaves: The number of leaves of the surrogate tree
        trained on errors.
    :type num_leaves: int
    :param min_child_samples: The minimal number of data required to
        create one leaf.
    :type min_child_samples: int
    :return: The extracted booster from the surrogate model and the
        scored dataset.
    :rtype: (Booster, pyspark.sql.DataFrame)
    """
    # compute the pred_y column
    scored_data = analyzer.model.transform(filtered_df.to_spark())
    diff_data = scored_data.withColumn(
        DIFF,
        F.when(F.col(analyzer.true_y) != F.col(PREDICTION),
               1).otherwise(0))
    if analyzer.model_task == ModelTask.CLASSIFICATION:
        diff_data = diff_data.drop(PREDICTION, RAW_PREDICTION, PROBABILITY)
    else:
        diff_data = diff_data.drop(PREDICTION)
    model = create_surrogate_model_pyspark(analyzer, diff_data, max_depth,
                                           num_leaves, min_child_samples)
    model_str = model.getNativeModel()
    booster_args = {'objective': analyzer.model_task}
    lgbm_booster = Booster(params=booster_args, model_str=model_str)
    return lgbm_booster, diff_data.to_koalas()


def create_surrogate_model_pyspark(analyzer,
                                   dataset,
                                   max_depth,
                                   num_leaves,
                                   min_child_samples):
    """Creates and fits the surrogate lightgbm model.

    :param analyzer: The error analyzer containing the categorical
        features and categories for the full dataset.
    :type analyzer: BaseAnalyzer
    :param dataset: The subset of features to train the
        surrogate model on.
    :type dataset: numpy.ndarray or pandas.DataFrame
    :param diff: The difference between the true and predicted labels column.
    :type diff: numpy.ndarray
    :param max_depth: The maximum depth of the surrogate tree trained
        on errors.
    :type max_depth: int
    :param num_leaves: The number of leaves of the surrogate tree
        trained on errors.
    :type num_leaves: int
    :param min_child_samples: The minimal number of data required to
        create one leaf.
    :type min_child_samples: int
    :return: The trained surrogate model.
    :rtype: LightGBMClassifier or LightGBMRegressor
    """
    if analyzer.model_task == ModelTask.CLASSIFICATION:
        surrogate = LightGBMClassifier(numIterations=1,
                                       maxDepth=max_depth,
                                       numLeaves=num_leaves,
                                       minDataInLeaf=min_child_samples,
                                       labelCol=DIFF)
    else:
        surrogate = LightGBMRegressor(numIterations=1,
                                      maxDepth=max_depth,
                                      numLeaves=num_leaves,
                                      minDataInLeaf=min_child_samples,
                                      labelCol=DIFF)
    return surrogate.fit(dataset)


def create_surrogate_model(analyzer,
                           dataset_sub_features,
                           diff,
                           max_depth,
                           num_leaves,
                           min_child_samples,
                           cat_ind_reindexed):
    """Creates and fits the surrogate lightgbm model.

    :param analyzer: The error analyzer containing the categorical
        features and categories for the full dataset.
    :type analyzer: BaseAnalyzer
    :param dataset_sub_features: The subset of features to train the
        surrogate model on.
    :type dataset_sub_features: numpy.ndarray or pandas.DataFrame
    :param diff: The difference between the true and predicted labels column.
    :type diff: numpy.ndarray
    :param max_depth: The maximum depth of the surrogate tree trained
        on errors.
    :type max_depth: int
    :param num_leaves: The number of leaves of the surrogate tree
        trained on errors.
    :type num_leaves: int
    :param min_child_samples: The minimal number of data required to
        create one leaf.
    :type min_child_samples: int
    :param cat_ind_reindexed: The list of categorical feature indexes.
    :type cat_ind_reindexed: list[int]
    :return: The trained surrogate model.
    :rtype: LGBMClassifier or LGBMRegressor
    """
    if analyzer.model_task == ModelTask.CLASSIFICATION:
        surrogate = LGBMClassifier(n_estimators=1,
                                   max_depth=max_depth,
                                   num_leaves=num_leaves,
                                   min_child_samples=min_child_samples)
    else:
        surrogate = LGBMRegressor(n_estimators=1,
                                  max_depth=max_depth,
                                  num_leaves=num_leaves,
                                  min_child_samples=min_child_samples)
    if cat_ind_reindexed:
        surrogate.fit(dataset_sub_features, diff,
                      categorical_feature=cat_ind_reindexed)
    else:
        surrogate.fit(dataset_sub_features, diff)
    return surrogate


def get_categorical_info(analyzer, dataset_sub_names):
    """Returns the categorical information for the given feature names.

    :param analyzer: The error analyzer containing the categorical
        features and categories for the full dataset.
    :type analyzer: BaseAnalyzer
    :param dataset_sub_names: The subset of feature names to get the
        categorical indexes and names for.
    :type dataset_sub_names: list[str]
    :return: The categorical indexes and categories for the subset
        of features specified.
    :rtype: tuple[list]
    """
    cat_ind_reindexed = []
    categories_reindexed = []
    if analyzer.categorical_features:
        for c_index, feature in enumerate(analyzer.categorical_features):
            try:
                index_sub = dataset_sub_names.index(feature)
            except ValueError:
                continue
            cat_ind_reindexed.append(index_sub)
            categories_reindexed.append(analyzer.categories[c_index])
    return (cat_ind_reindexed, categories_reindexed)


def get_max_split_index(tree):
    """Gets the max split index for the tree recursively.

    :param tree: The tree to get the max split index for.
    :type tree: dict
    """
    if SPLIT_INDEX in tree:
        max_index = tree[SPLIT_INDEX]
        index1 = get_max_split_index(tree[TreeSide.LEFT_CHILD])
        index2 = get_max_split_index(tree[TreeSide.RIGHT_CHILD])
        return max(max(max_index, index1), index2)
    else:
        return 0


def traverse(df,
             tree,
             max_split_index,
             categories,
             dict,
             feature_names,
             parent=None,
             side=TreeSide.UNKNOWN,
             metric=None,
             classes=None):
    """Traverses the current node in the tree to create a list of nodes.

    :param df: The DataFrame containing the features and labels.
    :type df: pandas.DataFrame
    :param tree: The current node in the tree to traverse.
    :type tree: dict
    :param max_split_index: The max split index for the tree.
    :type max_split_index: int
    :param categories: The list of categorical features and categories.
    :type categories: list[tuple]
    :param dict: The dictionary to store the nodes in.
    :type dict: dict
    :param feature_names: The list of feature names.
    :type feature_names: list[str]
    :param parent: The parent node of the current node.
    :type parent: Node or None
    :param side: The side of the parent node the current node is on.
    :type side: TreeSide
    :param metric: The metric to use for the current node.
    :type metric: str
    :param classes: The list of classes for the current node.
    :type classes: list[str]
    :return: The tree representation as a list of nodes.
    :rtype: list[dict[str, str]]
    """
    if SPLIT_INDEX in tree:
        nodeid = tree[SPLIT_INDEX]
    elif LEAF_INDEX in tree:
        nodeid = max_split_index + tree[LEAF_INDEX]
    else:
        nodeid = 0

    # reduce DataFrame to just features split on at each step for perf
    if not is_spark(df):
        df = filter_to_used_features(df, tree)

    # write current node to a dictionary that can be saved as JSON
    dict, df = node_to_dict(df, tree, nodeid, categories, dict,
                            feature_names, metric, parent, side,
                            classes)

    # write children to a dictionary that can be saved as JSON
    if LEAF_VALUE not in tree:
        left_child = tree[TreeSide.LEFT_CHILD]
        right_child = tree[TreeSide.RIGHT_CHILD]
        dict = traverse(df, left_child, max_split_index,
                        categories, dict, feature_names,
                        tree, TreeSide.LEFT_CHILD, metric,
                        classes)
        dict = traverse(df, right_child, max_split_index,
                        categories, dict, feature_names,
                        tree, TreeSide.RIGHT_CHILD, metric,
                        classes)
    return dict


def filter_to_used_features(df, tree):
    """Filters the DataFrame to only include features used in the tree.

    :param df: The DataFrame to filter.
    :type df: pandas.DataFrame
    :param tree: The tree to get the features from.
    :type tree: dict
    :return: The filtered DataFrame.
    :rtype: pandas.DataFrame
    """
    features = tree[CACHED_SUBTREE_FEATURES]
    features = features.union({PRED_Y, TRUE_Y, DIFF})
    return df[list(features)]


def cache_subtree_features(tree, feature_names, parent=None):
    """Caches the features of the subtree on each of the tree nodes.

    :param tree: The current node in the tree to cache the features on.
    :type tree: dict
    :param feature_names: The set of feature names.
    :type feature_names: set[str]
    :param parent: The parent node of the current node.
    :type parent: Node or None
    :return: The features from the tree.
    :rtype: list[str]
    """
    if parent is not None:
        p_node_name_val = feature_names[parent[SPLIT_FEATURE]]
        features = {p_node_name_val}
    else:
        features = set()
    if LEAF_VALUE not in tree:
        left_child = tree[TreeSide.LEFT_CHILD]
        features = features.union(
            cache_subtree_features(left_child, feature_names, tree))
        right_child = tree[TreeSide.RIGHT_CHILD]
        features = features.union(
            cache_subtree_features(right_child, feature_names, tree))
    tree[CACHED_SUBTREE_FEATURES] = features
    return features


def create_categorical_arg(parent_threshold):
    """Create the categorical argument for given parent threshold.

    The argument contains the categories to split on.

    :param parent_threshold: The parent threshold to create the categorical.
    :type parent_threshold: float
    :return: The categorical argument.
    :rtype: list[float]
    """
    return [float(i) for i in parent_threshold.split('||')]


def create_categorical_query(method, arg, p_node_name, p_node_query,
                             parent, categories):
    """Create the categorical query for given method and argument.

    :param method: The method to use for the categorical query.
    :type method: str
    :param arg: The argument to use for the categorical query.
    :type arg: list[float]
    :param p_node_name: The name of the node.
    :type p_node_name: str
    :param p_node_query: The reference to the node to be used in the query.
    :type p_node_query: str
    :param parent: The parent node.
    :type parent: dict
    :param categories: The list of categories for the current node.
    :type categories: list[tuple]
    :return: The categorical query and condition.
    :rtype: tuple(str, str)
    """
    if method == CohortFilterMethods.METHOD_INCLUDES:
        operation = "=="
    else:
        operation = "!="
    categorical_values = categories[0]
    categorical_indexes = categories[1]
    thresholds = []
    catcoli = categorical_indexes.index(parent[SPLIT_FEATURE])
    catvals = categorical_values[catcoli]
    for argi in arg:
        encoded_val = catvals[int(argi)]
        if not isinstance(encoded_val, str):
            encoded_val = str(encoded_val)
        thresholds.append(encoded_val)
    threshold_str = " | ".join(thresholds)
    condition = "{} {} {}".format(p_node_name, operation, threshold_str)
    query = []
    for argi in arg:
        query.append(p_node_query + " " + operation + " " + str(argi))
    if method == CohortFilterMethods.METHOD_INCLUDES:
        query = " | ".join(query)
    else:
        query = " & ".join(query)
    return query, condition


def node_to_dict(df, tree, nodeid, categories, json,
                 feature_names, metric, parent=None,
                 side=TreeSide.UNKNOWN, classes=None):
    """Converts a node and children to a dictionary that can be saved as JSON.

    This is a method that is called on the current node and then its children
    recursively to construct the dictionary representation.

    :param df: The DataFrame to use for the current node.
    :type df: pandas.DataFrame
    :param tree: The tree to use for the current node.
    :type tree: dict
    :param nodeid: The id of the current node.
    :type nodeid: int
    :param categories: The list of categories for the current node.
    :type categories: list[tuple]
    :param json: The JSON to write the node to.
    :type json: dict
    :param feature_names: The set of feature names.
    :type feature_names: set[str]
    :param metric: The metric to use for the current node.
    :type metric: str
    :param parent: The parent node.
    :type parent: dict
    :param side: The side of the current node from the parent, if known.
    :type side: TreeSide
    :param classes: The list of classes.
    :type classes: list[str]
    :return: The JSON with the node and all children added.
    :rtype: dict
    """
    p_node_name = None
    condition = None
    arg = None
    method = None
    parentid = None
    if parent is not None:
        parentid = int(parent[SPLIT_INDEX])
        p_node_name_val = feature_names[parent[SPLIT_FEATURE]]
        # use number.Integral to check for any numpy or python number type
        if isinstance(p_node_name_val, numbers.Integral):
            # for numeric column names, we can use @df[numeric_colname] syntax
            p_node_query = "@df[" + str(p_node_name_val) + "]"
        else:
            # for string column names, we can just use column name directly
            # with backticks
            p_node_query = "`" + str(p_node_name_val) + "`"
        p_node_name = str(p_node_name_val)
        parent_threshold = parent['threshold']
        parent_decision_type = parent['decision_type']
        if side == TreeSide.LEFT_CHILD:
            if parent_decision_type == '<=':
                method = "less and equal"
                arg = float(parent_threshold)
                condition = "{} <= {:.2f}".format(p_node_name,
                                                  parent_threshold)
                df = filter_by_threshold(df, p_node_name_val,
                                         parent_threshold, side)
            elif parent_decision_type == '==':
                method = CohortFilterMethods.METHOD_INCLUDES
                arg = create_categorical_arg(parent_threshold)
                query, condition = create_categorical_query(method,
                                                            arg,
                                                            p_node_name,
                                                            p_node_query,
                                                            parent,
                                                            categories)
                df = df.query(query)
        elif side == TreeSide.RIGHT_CHILD:
            if parent_decision_type == '<=':
                method = "greater"
                arg = float(parent_threshold)
                condition = "{} > {:.2f}".format(p_node_name,
                                                 parent_threshold)
                df = filter_by_threshold(df, p_node_name_val,
                                         parent_threshold, side)
            elif parent_decision_type == '==':
                method = CohortFilterMethods.METHOD_EXCLUDES
                arg = create_categorical_arg(parent_threshold)
                query, condition = create_categorical_query(method,
                                                            arg,
                                                            p_node_name,
                                                            p_node_query,
                                                            parent,
                                                            categories)
                df = df.query(query)
    total = df.shape[0]
    if is_spark(df):
        metric_value, success, error = compute_metrics_pyspark(
            df, metric, total)
    else:
        metric_value, success, error = compute_metrics_local(
            df, metric, total, classes)
    metric_name = metric_to_display_name[metric]
    is_error_metric = metric in error_metrics
    if SPLIT_FEATURE in tree:
        node_name = str(feature_names[tree[SPLIT_FEATURE]])
    else:
        node_name = None
    is_regression_metric = metric in regression_metrics
    json.append(get_json_node(arg, condition, error, nodeid, method,
                              node_name, parentid, p_node_name,
                              total, success, metric_name,
                              metric_value, is_error_metric,
                              is_regression_metric))
    return json, df


def filter_by_threshold(df, p_node_name_val, parent_threshold, side):
    """Filters the DataFrame by the threshold of the parent node.

    :param df: The DataFrame to filter.
    :type df: pandas.DataFrame
    :param p_node_name_val: The name of the parent node.
    :type p_node_name_val: str
    :param parent_threshold: The threshold of the parent node.
    :type parent_threshold: float
    :param side: The side of the parent node.
    :type side: TreeSide
    :return: The filtered DataFrame.
    :rtype: pandas.DataFrame
    """
    try:
        if side == TreeSide.LEFT_CHILD:
            df = df[df[p_node_name_val] <= parent_threshold]
        else:
            df = df[df[p_node_name_val] > parent_threshold]
        return df
    except TypeError as e:
        has_vals = df[p_node_name_val].shape[0] > 0
        if has_vals and isinstance(df[p_node_name_val][0], str):
            err = ("Column {0} of type string is incorrectly treated "
                   "as numeric with threshold value {1}. "
                   "Please make sure it is marked as categorical instead.")
            err = err.format(p_node_name_val, parent_threshold)
            raise TypeError(err, e)
        else:
            raise e


def compute_metrics_pyspark(df, metric, total):
    """Compute the metric value for a given pyspark DataFrame.

    :param df: The DataFrame to compute the metric on.
    :type df: pyspark.sql.DataFrame
    :param metric: The metric to compute.
    :type metric: str
    :param total: The total number of rows in the DataFrame.
    :type total: int
    :return: The metric value and success/error counts.
    :rtype: tuple(float, int, int)
    """
    if metric != Metrics.ERROR_RATE:
        raise ValueError(
            "Only Error Rate metric currently supported for pyspark case")
    else:
        classes = None
        return compute_metrics_local(df, metric, total, classes)


def compute_metrics_local(df, metric, total, classes):
    """Compute the metric value for a given local pandas DataFrame.

    :param df: The DataFrame to compute the metric on.
    :type df: pandas.DataFrame
    :param metric: The metric to compute.
    :type metric: str
    :param total: The total number of rows in the DataFrame.
    :type total: int
    :return: The metric value and success/error counts.
    :rtype: tuple(float, int, int)
    """
    success = 0
    if metric != Metrics.ERROR_RATE and df.shape[0] == 0:
        metric_value = 0
        error = 0
    elif metric == Metrics.MEAN_ABSOLUTE_ERROR:
        pred_y, true_y, error = get_regression_metric_data(df)
        metric_value = mean_absolute_error(true_y, pred_y)
    elif metric == Metrics.MEAN_SQUARED_ERROR:
        pred_y, true_y, error = get_regression_metric_data(df)
        metric_value = mean_squared_error(true_y, pred_y)
    elif metric == Metrics.MEDIAN_ABSOLUTE_ERROR:
        pred_y, true_y, error = get_regression_metric_data(df)
        metric_value = median_absolute_error(true_y, pred_y)
    elif metric == Metrics.R2_SCORE:
        pred_y, true_y, error = get_regression_metric_data(df)
        metric_value = r2_score(true_y, pred_y)
    elif (metric in precision_metrics or
          metric in recall_metrics or
          metric in f1_metrics or
          metric == Metrics.ACCURACY_SCORE):
        pred_y, true_y, error = get_classification_metric_data(df)
        func = metric_to_func[metric]
        metric_value = compute_metric_value(func, classes, true_y,
                                            pred_y, metric)
        success = total - error
    else:
        func = metric_to_func[metric]
        diff = df[DIFF]
        metric_value = func(None, None, diff)
        error = metric_value * total
        success = total - error
    return metric_value, success, error


def create_empty_node(metric):
    """Create an empty node for the tree.

    :param metric: The metric to use for the node.
    :type metric: str
    :return: The empty node.
    :rtype: dict
    """
    metric_name = metric_to_display_name[metric]
    is_regression_metric = metric in regression_metrics
    is_error_metric = metric in error_metrics
    return [get_json_node(None, None, 0, 0, None, None, None,
                          None, 0, 0, metric_name, 0, is_error_metric,
                          is_regression_metric)]


def get_json_node(arg, condition, error, nodeid, method, node_name,
                  parentid, p_node_name, total, success, metric_name,
                  metric_value, is_error_metric,
                  is_regression_metric):
    """Get the JSON node for the tree.

    :param arg: The arg for the node.
    :type arg: str
    :param condition: The condition for the node.
    :type condition: str
    :param error: The error for the node.
        Can be int for classification or float for regression.
    :type error: int or float
    :param nodeid: The node id for the node.
    :type nodeid: int
    :param method: The method for the node.
    :type method: str
    :param node_name: The node name for the node.
    :type node_name: str
    :param parentid: The parent id for the node.
    :type parentid: int
    :param p_node_name: The parent node name for the node.
    :type p_node_name: str
    :param total: The total number of instances in the node.
    :type total: int
    :param success: The total number of success instances for the node.
    :type success: int
    :param metric_name: The metric name for the node.
    :type metric_name: str
    :param metric_value: The metric value for the node.
    :type metric_value: float
    :param is_error_metric: Whether the metric is an error metric.
    :type is_error_metric: bool
    :param is_regression_metric: Whether the metric is a regression metric.
    :type is_regression_metric: bool
    :return: The JSON node.
    :rtype: dict
    """
    if is_regression_metric:
        error = float(error)
    else:
        error = int(error)
    return {
        "arg": arg,
        "badFeaturesRowCount": 0,  # Note: remove this eventually
        "condition": condition,
        "error": error,
        "id": int(nodeid),
        METHOD: method,
        "nodeIndex": int(nodeid),
        "nodeName": node_name,
        "parentId": parentid,
        "parentNodeName": p_node_name,
        "pathFromRoot": "",  # Note: remove this eventually
        "size": float(total),
        "sourceRowKeyHash": "hashkey",  # Note: remove this eventually
        "success": float(success),  # Note: remove this eventually
        TreeNode.METRIC_NAME: metric_name,
        TreeNode.METRIC_VALUE: float(metric_value),
        "isErrorMetric": is_error_metric
    }


def get_regression_metric_data(df):
    """Compute regression metric data from a DataFrame.

    :param df: DataFrame
    :type df: pandas.DataFrame
    :return: pred_y, true_y, error
    :rtype: numpy.ndarray, numpy.ndarray, int
    """
    pred_y = df[PRED_Y]
    true_y = df[TRUE_Y]
    # total abs error at the node
    error = sum(abs(pred_y - true_y))
    return pred_y, true_y, error


def get_classification_metric_data(df):
    """Compute classification metric data from a DataFrame.

    :param df: DataFrame
    :type df: pandas.DataFrame
    :return: pred_y, true_y, error
    :rtype: numpy.ndarray, numpy.ndarray, int
    """
    pred_y = df[PRED_Y]
    true_y = df[TRUE_Y]
    error = df[DIFF].values.sum()
    return pred_y, true_y, error


def compute_metric_value(func, classes, true_y, pred_y, metric):
    """Compute metric from the given function, true and predicted values.

    :param func: The metric function to evaluate.
    :type func: function
    :param classes: List of classes.
    :type classes: list
    :param true_y: True y values.
    :type true_y: numpy.ndarray
    :param pred_y: Predicted y values.
    :type pred_y: numpy.ndarray
    :param metric: Metric to compute.
    :type metric: str
    :return: The computed metric value.
    :rtype: float
    """
    requires_pos_label = (metric == Metrics.RECALL_SCORE or
                          metric == Metrics.PRECISION_SCORE or
                          metric == Metrics.F1_SCORE)
    if requires_pos_label:
        ordered_labels = get_ordered_classes(classes, true_y, pred_y)
        if ordered_labels is not None and len(ordered_labels) == 2:
            return func(true_y, pred_y, pos_label=ordered_labels[1])
    return func(true_y, pred_y)
