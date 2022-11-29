# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from erroranalysis._internal.constants import (Metrics, RootKeys,
                                               metric_to_display_name)
from erroranalysis._internal.error_analyzer import ModelAnalyzer
from erroranalysis._internal.metrics import metric_to_func
from rai_test_utils.datasets.tabular import (
    create_binary_classification_dataset, create_cancer_data,
    create_housing_data, create_iris_data, create_simple_titanic_data)
from rai_test_utils.models.model_utils import (create_models_classification,
                                               create_models_regression)
from rai_test_utils.models.sklearn import create_titanic_pipeline

TOL = 1e-10


class TestRootStats(object):

    @pytest.mark.parametrize('metric', [Metrics.ERROR_RATE,
                                        Metrics.MACRO_PRECISION_SCORE,
                                        Metrics.MICRO_PRECISION_SCORE,
                                        Metrics.MACRO_RECALL_SCORE,
                                        Metrics.MICRO_RECALL_SCORE,
                                        Metrics.MACRO_F1_SCORE,
                                        Metrics.MICRO_F1_SCORE,
                                        Metrics.ACCURACY_SCORE])
    def test_importances_iris(self, metric):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features, metric)

    @pytest.mark.parametrize('metric', [Metrics.ERROR_RATE,
                                        Metrics.PRECISION_SCORE,
                                        Metrics.RECALL_SCORE,
                                        Metrics.ACCURACY_SCORE,
                                        Metrics.F1_SCORE])
    def test_importances_cancer(self, metric):
        X_train, X_test, y_train, y_test, feature_names, _ = \
            create_cancer_data()

        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features, metric)

    @pytest.mark.parametrize('metric', [Metrics.ERROR_RATE,
                                        Metrics.PRECISION_SCORE,
                                        Metrics.RECALL_SCORE,
                                        Metrics.ACCURACY_SCORE,
                                        Metrics.F1_SCORE])
    def test_importances_binary_classification(self, metric):
        X_train, y_train, X_test, y_test, _ = \
            create_binary_classification_dataset()
        feature_names = list(X_train.columns)
        models = create_models_classification(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features, metric=metric)

    def test_importances_titanic(self):
        X_train, X_test, y_train, y_test, numeric, categorical = \
            create_simple_titanic_data()
        feature_names = categorical + numeric
        clf = create_titanic_pipeline(X_train, y_train)
        categorical_features = categorical
        run_error_analyzer(clf, X_test, y_test, feature_names,
                           categorical_features)

    @pytest.mark.parametrize('metric', [Metrics.MEAN_SQUARED_ERROR,
                                        Metrics.MEAN_ABSOLUTE_ERROR])
    def test_importances_housing(self, metric):
        X_train, X_test, y_train, y_test, feature_names = \
            create_housing_data()
        models = create_models_regression(X_train, y_train)

        for model in models:
            categorical_features = []
            run_error_analyzer(model, X_test, y_test, feature_names,
                               categorical_features, metric)


def run_error_analyzer(model, X_test, y_test, feature_names,
                       categorical_features, metric=Metrics.ERROR_RATE):
    model_analyzer = ModelAnalyzer(model, X_test, y_test,
                                   feature_names,
                                   categorical_features,
                                   metric=metric)
    root_stats = model_analyzer.compute_root_stats()
    metric_name = metric_to_display_name[metric]

    total = len(X_test)

    assert root_stats[RootKeys.METRIC_NAME] == metric_name
    assert root_stats[RootKeys.TOTAL_SIZE] == total
    assert root_stats[RootKeys.ERROR_COVERAGE] == 100

    if metric == Metrics.ERROR_RATE:
        diff = model_analyzer.get_diff()
        error = sum(diff)
        metric_value = (error / total) * 100
    else:
        metric_func = metric_to_func[metric]
        metric_value = metric_func(model_analyzer.pred_y,
                                   model_analyzer.true_y)

    assert root_stats[RootKeys.METRIC_VALUE] == metric_value
