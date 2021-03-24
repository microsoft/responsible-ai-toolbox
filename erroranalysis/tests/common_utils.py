# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

# Defines common utilities for error analysis tests
import numpy as np
import pandas as pd
from sklearn import svm
from sklearn.datasets import load_iris, load_breast_cancer, make_classification
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from lightgbm import LGBMClassifier
from xgboost import XGBClassifier

from pandas import read_csv


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


def create_sklearn_logistic_regressor(X, y, pipeline=False):
    lin = LogisticRegression(solver='liblinear')
    if pipeline:
        lin = Pipeline([('lin', lin)])
    model = lin.fit(X, y)
    return model


def create_iris_data():
    # Import Iris dataset
    iris = load_iris()
    # Split data into train and test
    x_train, x_test, y_train, y_validation = train_test_split(
        iris.data, iris.target, test_size=0.2, random_state=0)
    feature_names = [name.replace(' (cm)', '') for name in iris.feature_names]
    classes = iris.target_names
    return x_train, x_test, y_train, y_validation, feature_names, classes


def create_cancer_data():
    breast_cancer_data = load_breast_cancer()
    classes = breast_cancer_data.target_names.tolist()

    # Split data into train and test
    x_train, x_test, y_train, y_test = train_test_split(
        breast_cancer_data.data, breast_cancer_data.target,
        test_size=0.2, random_state=0)
    feature_names = breast_cancer_data.feature_names
    classes = breast_cancer_data.target_names.tolist()
    return x_train, x_test, y_train, y_test, feature_names, classes


def create_binary_classification_dataset():
    X, y = make_classification()

    # Split data into train and test
    x_train, x_test, y_train, y_test = train_test_split(X,
                                                        y,
                                                        test_size=0.2,
                                                        random_state=0)
    classes = np.unique(y_train).tolist()
    feature_names = ["col" + str(i) for i in list(range(x_train.shape[1]))]
    x_train = pd.DataFrame(x_train, columns=feature_names)
    x_test = pd.DataFrame(x_test, columns=feature_names)
    return x_train, y_train, x_test, y_test, classes


def create_simple_titanic_data():
    titanic_url = ('https://raw.githubusercontent.com/amueller/'
                   'scipy-2017-sklearn/091d371/notebooks/'
                   'datasets/titanic3.csv')
    data = read_csv(titanic_url)
    # fill missing values
    data = data.fillna(method="ffill")
    data = data.fillna(method="bfill")
    num_features = ['age', 'fare']
    cat_features = ['embarked', 'sex', 'pclass']

    y = data['survived'].values
    X = data[cat_features + num_features]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)
    return X_train, X_test, y_train, y_test, num_features, cat_features


def create_models(x_train, y_train):
    svm_model = create_sklearn_svm_classifier(x_train, y_train)
    log_reg_model = create_sklearn_logistic_regressor(x_train, y_train)
    xgboost_model = create_xgboost_classifier(x_train, y_train)
    lgbm_model = create_lightgbm_classifier(x_train, y_train)
    rf_model = create_sklearn_random_forest_classifier(x_train, y_train)

    return [svm_model, log_reg_model, xgboost_model, lgbm_model, rf_model]
