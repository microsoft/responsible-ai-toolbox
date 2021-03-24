# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from common_utils import create_iris_data, create_models
from erroranalysis._internal.error_analyzer import ErrorAnalyzer

SIZE = 'size'
PARENTID = 'parentId'
ERROR = 'error'
ID = 'id'


class TestSurrogateErrorTree(object):

    def test_surrogate_error_tree_iris(self):
        x_train, x_test, y_train, y_test, feature_names, _ = create_iris_data()

        models = create_models(x_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, x_test, y_test, feature_names,
                               categorical_features)


def run_error_analyzer(model, x_test, y_test, feature_names,
                       categorical_features):
    error_analyzer = ErrorAnalyzer(model, x_test, y_test,
                                   feature_names,
                                   categorical_features)
    # features, filters, composite_filters
    features = [feature_names[0], feature_names[1]]
    filters = None
    composite_filters = None
    json_tree = error_analyzer.compute_error_tree(features, filters,
                                                  composite_filters)
    assert json_tree is not None
    assert len(json_tree) > 0
    assert ERROR in json_tree[0]
    assert ID in json_tree[0]
    assert PARENTID in json_tree[0]
    assert json_tree[0][PARENTID] is None
    assert SIZE in json_tree[0]
    assert json_tree[0][SIZE] == len(x_test)
