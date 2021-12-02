# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import shap
import sklearn
from interpret.ext.blackbox import MimicExplainer
from interpret.ext.glassbox import LGBMExplainableModel
from interpret_community.common.constants import ModelTask
from sklearn.datasets import load_iris, make_classification
from sklearn.model_selection import train_test_split

from erroranalysis._internal.constants import Metrics, metric_to_display_name
from erroranalysis._internal.surrogate_error_tree import (
    DEFAULT_MAX_DEPTH, DEFAULT_MIN_CHILD_SAMPLES, DEFAULT_NUM_LEAVES)
from raiwidgets import ErrorAnalysisDashboard
from raiwidgets.explanation_constants import WidgetRequestResponseConstants


class TestErrorAnalysisDashboard:
    def test_error_analysis_adult_census(self):
        X, y = shap.datasets.adult()
        y = [1 if r else 0 for r in y]
        categorical_features = ['Workclass',
                                'Education-Num',
                                'Marital Status',
                                'Occupation',
                                'Relationship',
                                'Race',
                                'Sex',
                                'Country']
        run_error_analysis_adult_census(X, y, categorical_features)

    def test_error_analysis_many_rows(self):
        X, y = make_classification(n_samples=110000)

        # Split data into train and test
        X_train, X_test, y_train, y_test = train_test_split(X,
                                                            y,
                                                            test_size=0.2,
                                                            random_state=0)
        classes = np.unique(y_train).tolist()
        feature_names = ["col" + str(i) for i in list(range(X_train.shape[1]))]
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)
        ErrorAnalysisDashboard(model=knn, dataset=X_test,
                               true_y=y_test, classes=classes)

    def test_error_analysis_sample_dataset_with_many_more_rows(self):
        X, y = make_classification(n_samples=400000)

        # Split data into train and test
        X_train, X_test, y_train, y_test = train_test_split(X,
                                                            y,
                                                            test_size=0.2,
                                                            random_state=0)
        classes = np.unique(y_train).tolist()
        feature_names = ["col" + str(i) for i in list(range(X_train.shape[1]))]
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        logreg = sklearn.linear_model.LogisticRegression()
        logreg.fit(X_train, y_train)
        _, X_test_sample, _, y_test_sample = train_test_split(X_test,
                                                              y_test,
                                                              test_size=0.01,
                                                              random_state=0)
        ErrorAnalysisDashboard(model=logreg,
                               dataset=X_test,
                               true_y=y_test_sample,
                               true_y_dataset=y_test,
                               classes=classes,
                               sample_dataset=X_test_sample)

        pred_y = logreg.predict(X_test)
        pred_y_sample = logreg.predict(X_test_sample)
        ErrorAnalysisDashboard(dataset=X_test,
                               true_y=y_test_sample,
                               true_y_dataset=y_test,
                               classes=classes,
                               sample_dataset=X_test_sample,
                               pred_y=pred_y_sample,
                               pred_y_dataset=pred_y)

    def test_error_analysis_pandas(self):
        X_train, X_test, y_train, y_test, feature_names, _ = create_iris_data()

        # Validate error analysis dashboard on pandas DataFrame
        # and pandas Series
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)
        y_train = pd.Series(y_train)
        y_test = pd.Series(y_test)

        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)

        model_task = ModelTask.Classification
        explainer = MimicExplainer(knn,
                                   X_train,
                                   LGBMExplainableModel,
                                   model_task=model_task)
        global_explanation = explainer.explain_global(X_test)

        ErrorAnalysisDashboard(global_explanation,
                               knn,
                               dataset=X_test,
                               true_y=y_test)

    def test_error_analysis_iris_numeric_feature_names(self):
        # e2e test of error analysis with numeric feature names
        X_train, X_test, y_train, y_test, _, _ = create_iris_data()
        knn = sklearn.neighbors.KNeighborsClassifier()
        knn.fit(X_train, y_train)

        model_task = ModelTask.Classification
        explainer = MimicExplainer(knn,
                                   X_train,
                                   LGBMExplainableModel,
                                   model_task=model_task)
        global_explanation = explainer.explain_global(X_test)

        dashboard = ErrorAnalysisDashboard(global_explanation,
                                           knn,
                                           dataset=X_test,
                                           true_y=y_test)
        metric = metric_to_display_name[Metrics.ERROR_RATE]
        result = dashboard.input.debug_ml([global_explanation.features,
                                           [],
                                           [],
                                           DEFAULT_MAX_DEPTH,
                                           DEFAULT_NUM_LEAVES,
                                           DEFAULT_MIN_CHILD_SAMPLES,
                                           metric])
        assert WidgetRequestResponseConstants.ERROR not in result
        matrix_features = global_explanation.features[0:1]
        result = dashboard.input.matrix(matrix_features, [], [],
                                        True, 8, metric)
        assert WidgetRequestResponseConstants.ERROR not in result

    def test_error_analysis_adult_census_numeric_feature_names(self):
        X, y = shap.datasets.adult()
        categorical_features = ['Workclass',
                                'Education-Num',
                                'Marital Status',
                                'Occupation',
                                'Relationship',
                                'Race',
                                'Sex',
                                'Country']
        columns = X.columns.tolist()
        cat_idxs = [columns.index(feat) for feat in categorical_features]
        # Convert to numpy to remove features names
        X = X.values
        y = [1 if r else 0 for r in y]

        run_error_analysis_adult_census(X, y, cat_idxs)


def run_error_analysis_adult_census(X, y, categorical_features):
    X, y = sklearn.utils.resample(
        X, y, n_samples=1000, random_state=7, stratify=y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=7, stratify=y)

    knn = sklearn.neighbors.KNeighborsClassifier()
    knn.fit(X_train, y_train)

    model_task = ModelTask.Classification
    explainer = MimicExplainer(knn,
                               X_train,
                               LGBMExplainableModel,
                               augment_data=True,
                               max_num_of_augmentations=10,
                               model_task=model_task)
    global_explanation = explainer.explain_global(X_test)

    dashboard = ErrorAnalysisDashboard(
        global_explanation, knn, dataset=X_test,
        true_y=y_test, categorical_features=categorical_features)
    metric = metric_to_display_name[Metrics.ERROR_RATE]
    result = dashboard.input.debug_ml([global_explanation.features,
                                       [],
                                       [],
                                       DEFAULT_MAX_DEPTH,
                                       DEFAULT_NUM_LEAVES,
                                       DEFAULT_MIN_CHILD_SAMPLES,
                                       metric])
    assert WidgetRequestResponseConstants.ERROR not in result
    matrix_features = global_explanation.features[0:1]
    result = dashboard.input.matrix(matrix_features, [], [],
                                    True, 8, metric)
    assert WidgetRequestResponseConstants.ERROR not in result


def create_iris_data():
    # Import Iris dataset
    iris = load_iris()
    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        iris.data, iris.target, test_size=0.2, random_state=0)
    feature_names = iris.feature_names
    classes = iris.target_names
    return X_train, X_test, y_train, y_test, feature_names, classes
