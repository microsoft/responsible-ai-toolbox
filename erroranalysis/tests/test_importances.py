# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import time

from common_utils import (create_binary_classification_dataset,
                          create_boston_data, create_cancer_data,
                          create_iris_data, create_models_classification,
                          create_models_regression, create_simple_titanic_data,
                          create_sklearn_random_forest_regressor,
                          create_titanic_pipeline, replicate_dataset)

from erroranalysis._internal.constants import ModelTask
from erroranalysis._internal.error_analyzer import ModelAnalyzer

TOL = 1e-10


class TestImportances(object):

    def test_importances_iris(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)

    def test_importances_cancer(self):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)

    def test_importances_binary_classification(self):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()
        feature_names = list(X_train.columns)
        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)

    def test_importances_titanic(self):
        X_train, X_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        feature_names = categorical + numeric
        clf = create_titanic_pipeline(X_train, y_train)
        categorical_features = categorical
        run_error_analyzer(clf, X_test, y_test, feature_names,
                           categorical_features)

    def test_importances_boston(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_boston_data()
        models = create_models_regression(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features)

    def test_large_data_importances(self):
        # mutual information can be very costly for large number of rows
        # hence, assert we downsample to compute importances for large data
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset(100)
        feature_names = list(X_train.columns)
        model = create_sklearn_random_forest_regressor(X_train, y_train)
        X_test, y_test = replicate_dataset(X_test, y_test)
        assert X_test.shape[0] > 1000000
        t0 = time.time()
        categorical_features = []
        model_analyzer = ModelAnalyzer(model, X_test, y_test,
                                       feature_names,
                                       categorical_features)
        model_analyzer.compute_importances()
        t1 = time.time()
        execution_time = t1 - t0
        print(execution_time)
        # assert we don't take too long and downsample the dataset
        # note execution time is in seconds
        assert execution_time < 20


def run_error_analyzer(model, X_test, y_test, feature_names,
                       categorical_features):
    model_analyzer = ModelAnalyzer(model, X_test, y_test,
                                   feature_names,
                                   categorical_features)
    scores = model_analyzer.compute_importances()
    if model_analyzer.model_task == ModelTask.CLASSIFICATION:
        diff = model.predict(model_analyzer.dataset) != model_analyzer.true_y
    else:
        diff = model.predict(model_analyzer.dataset) - model_analyzer.true_y
    assert isinstance(scores, list)
    assert len(scores) == len(feature_names)
    # If model predicted perfectly, assert all scores are zeros
    if not any(diff):
        assert all(abs(score - 0) < TOL for score in scores)
    else:
        assert any(score != 0 for score in scores)
