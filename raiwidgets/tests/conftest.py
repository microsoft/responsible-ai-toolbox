# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import pytest
import shap
import sklearn
from ml_wrappers.model.predictions_wrapper import (
    PredictionsModelWrapperClassification, PredictionsModelWrapperRegression)
from sklearn.datasets import fetch_california_housing, load_iris
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

from responsibleai import RAIInsights


def verify_predict_outputs(model, model_wrapper, test_data):
    model_predict_output = model.predict(test_data)
    model_wrapper_predict_output = model_wrapper.predict(test_data)
    np.all(model_predict_output == model_wrapper_predict_output)


def verify_predict_proba_outputs(model, model_wrapper, test_data):
    model_predict_proba_output = model.predict_proba(test_data)
    model_wrapper_predict_proba_output = model_wrapper.predict_proba(test_data)
    np.all(model_predict_proba_output == model_wrapper_predict_proba_output)


def create_rai_insights_object_classification(with_model=True):
    X, y = shap.datasets.adult()
    y = [1 if r else 0 for r in y]

    X, y = sklearn.utils.resample(
        X, y, n_samples=1000, random_state=7, stratify=y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.01, random_state=7, stratify=y)
    categorical_features = ['Workclass', 'Education-Num',
                            'Marital Status',
                            'Occupation', 'Relationship',
                            'Race',
                            'Sex', 'Country']

    knn = sklearn.neighbors.KNeighborsClassifier()
    knn.fit(X_train, y_train)

    if not with_model:
        all_data = pd.concat(
            [X_test, X_train])
        model_predict_output = knn.predict(all_data)
        model_predict_proba_output = knn.predict_proba(all_data)
        knn_wrapper = PredictionsModelWrapperClassification(
            all_data,
            model_predict_output,
            model_predict_proba_output)
        verify_predict_outputs(knn, knn_wrapper, all_data)
        verify_predict_proba_outputs(knn, knn_wrapper, all_data)
        knn = knn_wrapper

    X['Income'] = y
    X_test['Income'] = y_test

    ri = RAIInsights(knn, X, X_test, 'Income', 'classification',
                     categorical_features=categorical_features)
    ri.explainer.add()
    if with_model:
        ri.counterfactual.add(10, desired_class='opposite')
    ri.error_analysis.add()
    ri.causal.add(treatment_features=['Hours per week', 'Occupation'],
                  heterogeneity_features=None,
                  upper_bound_on_cat_expansion=42,
                  skip_cat_limit_checks=True)
    ri.compute()
    return ri


def create_rai_insights_object_regression(with_model=True):
    housing = fetch_california_housing()
    X_train, X_test, y_train, y_test = train_test_split(housing.data,
                                                        housing.target,
                                                        train_size=500,
                                                        test_size=50,
                                                        random_state=7)
    X_train = pd.DataFrame(X_train, columns=housing.feature_names)
    X_test = pd.DataFrame(X_test, columns=housing.feature_names)

    rfc = RandomForestRegressor(n_estimators=10, max_depth=4,
                                random_state=777)
    model = rfc.fit(X_train, y_train)

    if not with_model:
        all_data = pd.concat(
            [X_test, X_train])
        model_predict_output = model.predict(all_data)
        model_wrapper = PredictionsModelWrapperRegression(
            all_data,
            model_predict_output)
        verify_predict_outputs(model, model_wrapper, all_data)
        model = model_wrapper

    X_train['target'] = y_train
    X_test['target'] = y_test

    ri = RAIInsights(model, X_train, X_test, 'target', 'regression')
    ri.explainer.add()
    if with_model:
        ri.counterfactual.add(10, desired_range=[3, 5])
    ri.error_analysis.add()
    ri.causal.add(treatment_features=['AveRooms'],
                  heterogeneity_features=None,
                  upper_bound_on_cat_expansion=42,
                  skip_cat_limit_checks=True)
    ri.compute()
    return ri


def create_rai_insights_object_multiclass_classification(with_model=True):
    # Import Iris dataset
    iris = load_iris()
    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        iris.data, iris.target, test_size=0.2, random_state=0)
    feature_names = [name.replace(' (cm)', '') for name in iris.feature_names]
    X_train = pd.DataFrame(X_train, columns=feature_names)
    X_test = pd.DataFrame(X_test, columns=feature_names)

    knn = sklearn.neighbors.KNeighborsClassifier()
    knn.fit(X_train, y_train)

    if not with_model:
        all_data = pd.concat(
            [X_test, X_train])
        model_predict_output = knn.predict(all_data)
        model_predict_proba_output = knn.predict_proba(all_data)
        knn_wrapper = PredictionsModelWrapperClassification(
            all_data,
            model_predict_output,
            model_predict_proba_output)
        verify_predict_outputs(knn, knn_wrapper, all_data)
        verify_predict_proba_outputs(knn, knn_wrapper, all_data)
        knn = knn_wrapper

    X_train['target'] = y_train
    X_test['target'] = y_test

    ri = RAIInsights(knn, X_train, X_test, 'target', 'classification')
    ri.explainer.add()
    if with_model:
        ri.counterfactual.add(10, desired_class=2)
    ri.error_analysis.add()
    ri.compute()
    return ri


@pytest.fixture(scope='session')
def create_rai_insights_object_classification_with_model():
    return create_rai_insights_object_classification()


@pytest.fixture(scope='session')
def create_rai_insights_object_classification_with_predictions():
    return create_rai_insights_object_classification(with_model=False)


@pytest.fixture(scope='session')
def create_rai_insights_object_regression_with_model():
    return create_rai_insights_object_regression()


@pytest.fixture(scope='session')
def create_rai_insights_object_regression_with_predictions():
    return create_rai_insights_object_regression(with_model=False)


@pytest.fixture(scope='session')
def create_rai_insights_object_multiclass_with_model():
    return create_rai_insights_object_multiclass_classification()


@pytest.fixture(scope='session')
def create_rai_insights_object_multiclass_with_predictions():
    return create_rai_insights_object_multiclass_classification(
        with_model=False)
