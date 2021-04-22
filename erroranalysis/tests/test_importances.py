# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from common_utils import (
    create_iris_data, create_cancer_data, create_binary_classification_dataset,
    create_models, create_simple_titanic_data, create_titanic_pipeline)
from erroranalysis._internal.error_analyzer import ModelAnalyzer

TOL = 1e-10


class TestImportances(object):

    def test_importances_iris(self):
        x_train, x_test, y_train, y_test, feature_names, _ = create_iris_data()

        models = create_models(x_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, x_test, y_test, feature_names,
                               categorical_features)

    def test_importances_cancer(self):
        x_train, x_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        models = create_models(x_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, x_test, y_test, feature_names,
                               categorical_features)

    def test_importances_binary_classification(self):
        x_train, y_train, x_test, y_test, _ = \
            create_binary_classification_dataset()
        feature_names = list(x_train.columns)
        models = create_models(x_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, x_test, y_test, feature_names,
                               categorical_features)

    def test_importances_titanic(self):
        x_train, x_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        feature_names = categorical + numeric
        clf = create_titanic_pipeline(x_train, y_train)
        categorical_features = categorical
        run_error_analyzer(clf, x_test, y_test, feature_names,
                           categorical_features)


def run_error_analyzer(model, x_test, y_test, feature_names,
                       categorical_features):
    model_analyzer = ModelAnalyzer(model, x_test, y_test,
                                   feature_names,
                                   categorical_features)
    scores = model_analyzer.compute_importances()
    diff = model.predict(model_analyzer.dataset) != model_analyzer.true_y
    assert isinstance(scores, list)
    assert len(scores) == len(feature_names)
    # If model predicted perfectly, assert all scores are zeros
    if not any(diff):
        assert all(abs(score - 0) < TOL for score in scores)
    else:
        assert any(score != 0 for score in scores)
