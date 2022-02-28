# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pandas as pd
import pytest
import shap
import sklearn
from sklearn.datasets import fetch_california_housing
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

from responsibleai import RAIInsights


@pytest.fixture(scope='session')
def create_rai_insights_object_classification():
    X, y = shap.datasets.adult()
    y = [1 if r else 0 for r in y]

    X, y = sklearn.utils.resample(
        X, y, n_samples=1000, random_state=7, stratify=y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.01, random_state=7, stratify=y)

    knn = sklearn.neighbors.KNeighborsClassifier()
    knn.fit(X_train, y_train)

    X['Income'] = y
    X_test['Income'] = y_test

    ri = RAIInsights(knn, X, X_test, 'Income', 'classification',
                     categorical_features=['Workclass', 'Education-Num',
                                           'Marital Status',
                                           'Occupation', 'Relationship',
                                           'Race',
                                           'Sex', 'Country'])
    ri.explainer.add()
    ri.counterfactual.add(10, desired_class='opposite')
    ri.error_analysis.add()
    ri.causal.add(treatment_features=['Hours per week', 'Occupation'],
                  heterogeneity_features=None,
                  upper_bound_on_cat_expansion=42,
                  skip_cat_limit_checks=True)
    ri.compute()
    return ri


@pytest.fixture(scope='session')
def create_rai_insights_object_regression():
    housing = fetch_california_housing()
    X_train, X_test, y_train, y_test = train_test_split(housing.data,
                                                        housing.target,
                                                        test_size=0.005,
                                                        random_state=7)
    X_train = pd.DataFrame(X_train, columns=housing.feature_names)
    X_test = pd.DataFrame(X_test, columns=housing.feature_names)

    rfc = RandomForestRegressor(n_estimators=10, max_depth=4,
                                random_state=777)
    model = rfc.fit(X_train, y_train)

    X_train['target'] = y_train
    X_test['target'] = y_test

    ri = RAIInsights(model, X_train, X_test, 'target', 'regression')
    ri.explainer.add()
    ri.counterfactual.add(10, desired_range=[5, 10])
    ri.error_analysis.add()
    ri.causal.add(treatment_features=['AveRooms'],
                  heterogeneity_features=None,
                  upper_bound_on_cat_expansion=42,
                  skip_cat_limit_checks=True)
    ri.compute()
    return ri
