# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

# Defines common utilities for error analysis tests
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn import svm
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (FunctionTransformer, OneHotEncoder,
                                   StandardScaler)
from xgboost import XGBClassifier


def create_sklearn_random_forest_classifier(X, y):
    rfc = RandomForestClassifier(n_estimators=10, max_depth=4,
                                 random_state=777)
    model = rfc.fit(X, y)
    return model


def create_lightgbm_classifier(X, y):
    lgbm = LGBMClassifier(boosting_type='gbdt', learning_rate=0.1,
                          max_depth=5, n_estimators=200, n_jobs=1,
                          random_state=777)
    model = lgbm.fit(X, y)
    return model


def create_xgboost_classifier(X, y):
    xgb = XGBClassifier(learning_rate=0.1, max_depth=3, n_estimators=100,
                        n_jobs=1, random_state=777)
    model = xgb.fit(X, y)
    return model


def create_sklearn_svm_classifier(X, y, probability=True):
    clf = svm.SVC(gamma=0.001, C=100., probability=probability,
                  random_state=777)
    model = clf.fit(X, y)
    return model


def create_kneighbors_classifier(X, y):
    knn = KNeighborsClassifier()
    model = knn.fit(X, y)
    return model


def create_sklearn_logistic_regressor(X, y, pipeline=False):
    lin = LogisticRegression(solver='liblinear', random_state=777)
    if pipeline:
        lin = Pipeline([('lin', lin)])
    model = lin.fit(X, y)
    return model


def create_sklearn_random_forest_regressor(X, y):
    rfc = RandomForestRegressor(n_estimators=10, max_depth=4,
                                random_state=777)
    model = rfc.fit(X, y)
    return model


def create_models_classification(X_train, y_train):
    svm_model = create_sklearn_svm_classifier(X_train, y_train)
    log_reg_model = create_sklearn_logistic_regressor(X_train, y_train)
    xgboost_model = create_xgboost_classifier(X_train, y_train)
    lgbm_model = create_lightgbm_classifier(X_train, y_train)
    rf_model = create_sklearn_random_forest_classifier(X_train, y_train)

    return [svm_model, log_reg_model, xgboost_model, lgbm_model, rf_model]


def create_models_regression(X_train, y_train):
    rf_model = create_sklearn_random_forest_regressor(X_train, y_train)

    return [rf_model]


def create_titanic_pipeline(X_train, y_train):
    def conv(X):
        if isinstance(X, pd.Series):
            return X.values
        return X

    many_to_one_transformer = \
        FunctionTransformer(lambda x: conv(x.sum(axis=1)).reshape(-1, 1))
    many_to_many_transformer = \
        FunctionTransformer(lambda x: np.hstack(
            (conv(np.prod(x, axis=1)).reshape(-1, 1),
                conv(np.prod(x, axis=1)**2).reshape(-1, 1))
        ))
    transformations = ColumnTransformer([
        ("age_fare_1", Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ]), ["age", "fare"]),
        ("age_fare_2", many_to_one_transformer, ["age", "fare"]),
        ("age_fare_3", many_to_many_transformer, ["age", "fare"]),
        ("embarked", Pipeline(steps=[
            ("imputer",
                SimpleImputer(strategy='constant', fill_value='missing')),
            ("encoder", OneHotEncoder(sparse=False))]), ["embarked"]),
        ("sex_pclass", OneHotEncoder(sparse=False), ["sex", "pclass"])
    ])
    clf = Pipeline(steps=[('preprocessor', transformations),
                          ('classifier',
                           LogisticRegression(solver='lbfgs'))])
    clf.fit(X_train, y_train)
    return clf
