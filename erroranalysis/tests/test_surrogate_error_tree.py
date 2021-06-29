# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from common_utils import (
    create_iris_data, create_models_classification,
    create_adult_census_data, create_kneighbors_classifier)
from erroranalysis._internal.error_analyzer import ModelAnalyzer

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
