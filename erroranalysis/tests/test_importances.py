# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import time

import numpy as np
import pytest
from common_utils import replicate_dataset

from erroranalysis._internal.constants import (ErrorCorrelationMethods,
                                               ModelTask)
from erroranalysis._internal.error_analyzer import ModelAnalyzer
from rai_test_utils.datasets.tabular import (
    create_binary_classification_dataset, create_cancer_data,
    create_housing_data, create_iris_data, create_simple_titanic_data)
from rai_test_utils.models.lightgbm import create_lightgbm_classifier
from rai_test_utils.models.model_utils import (create_models_classification,
                                               create_models_regression)
from rai_test_utils.models.sklearn import (
    create_sklearn_random_forest_classifier,
    create_sklearn_random_forest_regressor, create_titanic_pipeline)

TOL = 1e-10
NUM_SAMPLE_ROWS = 100
DEFAULT_SAMPLE_COLS = 20
MUTUAL_INFO = ErrorCorrelationMethods.MUTUAL_INFO
EBM = ErrorCorrelationMethods.EBM
GBM_SHAP = ErrorCorrelationMethods.GBM_SHAP
GBM_ERROR_SAMPLES_TOL = 6


class TestImportances(object):

    @pytest.mark.parametrize('error_correlation_method',
                             [MUTUAL_INFO, EBM, GBM_SHAP])
    def test_importances_iris(self, error_correlation_method):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features, error_correlation_method)

    @pytest.mark.parametrize('error_correlation_method',
                             [MUTUAL_INFO, EBM, GBM_SHAP])
    def test_importances_cancer(self, error_correlation_method):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features, error_correlation_method)

    @pytest.mark.parametrize('error_correlation_method',
                             [MUTUAL_INFO, EBM, GBM_SHAP])
    def test_importances_binary_classification(self,
                                               error_correlation_method):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()
        feature_names = list(X_train.columns)
        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features, error_correlation_method)

    @pytest.mark.parametrize('error_correlation_method',
                             [MUTUAL_INFO, EBM, GBM_SHAP])
    def test_importances_titanic(self, error_correlation_method):
        X_train, X_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        feature_names = categorical + numeric
        clf = create_titanic_pipeline(X_train, y_train)
        categorical_features = categorical
        run_error_analyzer(clf, X_test, y_test, feature_names,
                           categorical_features, error_correlation_method)

    @pytest.mark.parametrize('error_correlation_method',
                             [MUTUAL_INFO, EBM, GBM_SHAP])
    def test_importances_housing(self, error_correlation_method):
        X_train, X_test, y_train, y_test, feature_names = \
            create_housing_data()
        models = create_models_regression(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features, error_correlation_method)

    @pytest.mark.parametrize('error_correlation_method',
                             [MUTUAL_INFO, EBM, GBM_SHAP])
    def test_large_data_importances(self, error_correlation_method):
        # mutual information can be very costly for large number of rows
        # hence, assert we downsample to compute importances for large data
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset(NUM_SAMPLE_ROWS)
        feature_names = list(X_train.columns)
        model = create_sklearn_random_forest_regressor(X_train, y_train)
        X_test, y_test = replicate_dataset(X_test, y_test)
        assert X_test.shape[0] > 1000000
        t0 = time.time()
        categorical_features = []
        model_analyzer = ModelAnalyzer(model, X_test, y_test,
                                       feature_names,
                                       categorical_features)
        model_analyzer.compute_importances(error_correlation_method)
        t1 = time.time()
        execution_time = t1 - t0
        print(execution_time)
        # assert we don't take too long and downsample the dataset
        # note execution time is in seconds
        # note GBM_SHAP is slower than the other methods
        if error_correlation_method == GBM_SHAP:
            assert execution_time < 35
        else:
            assert execution_time < 25

    @pytest.mark.parametrize('num_rows', [1, 2, 3, 4])
    @pytest.mark.parametrize('error_correlation_method',
                             [MUTUAL_INFO, EBM, GBM_SHAP])
    def test_small_data_importances(self, num_rows, error_correlation_method):
        # validate we can run on very few rows
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset(NUM_SAMPLE_ROWS)
        feature_names = list(X_train.columns)
        model = create_sklearn_random_forest_classifier(X_train, y_train)
        X_test = X_test[:num_rows]
        y_test = y_test[:num_rows]
        categorical_features = []
        model_analyzer = ModelAnalyzer(model, X_test, y_test,
                                       feature_names,
                                       categorical_features)
        scores = model_analyzer.compute_importances(error_correlation_method)
        assert len(scores) == DEFAULT_SAMPLE_COLS

    @pytest.mark.parametrize('error_correlation_method',
                             [MUTUAL_INFO, EBM, GBM_SHAP])
    def test_importances_missings(self, error_correlation_method):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        # add missing values to X_test
        for i in range(5, 10):
            X_test.iloc[i, 0] = np.nan
            X_test.iloc[i + 5, 2] = np.nan

        model = create_lightgbm_classifier(X_train, y_train)

        categorical_features = []
        run_error_analyzer(model, X_test, y_test, feature_names,
                           categorical_features, error_correlation_method)


def run_error_analyzer(model, X_test, y_test, feature_names,
                       categorical_features,
                       error_correlation_method):
    model_analyzer = ModelAnalyzer(model, X_test, y_test,
                                   feature_names,
                                   categorical_features)
    scores = model_analyzer.compute_importances(error_correlation_method)
    if model_analyzer.model_task == ModelTask.CLASSIFICATION:
        diff = model.predict(model_analyzer.dataset) != model_analyzer.true_y
    else:
        diff = model.predict(model_analyzer.dataset) - model_analyzer.true_y
    assert isinstance(scores, list)
    assert len(scores) == len(feature_names)
    # GBM methods seems to predict all zeros
    # (and sometimes otherwise) even if very few instances non-zero
    is_gbm = error_correlation_method == GBM_SHAP
    sum_diff = sum(diff)
    noisy_gbm = sum_diff < GBM_ERROR_SAMPLES_TOL and sum_diff > 0 and is_gbm
    # If model predicted perfectly, assert all scores are zeros
    if not any(diff):
        assert all(abs(score - 0) < TOL for score in scores)
    elif not noisy_gbm:
        assert any(score != 0 for score in scores)
