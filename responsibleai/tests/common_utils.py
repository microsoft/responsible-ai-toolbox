# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
# Defines common utilities for responsibleai tests
from dice_ml.utils import helpers
from lightgbm import LGBMClassifier
from sklearn import svm
from sklearn.compose import ColumnTransformer
from sklearn.datasets import (fetch_california_housing, load_breast_cancer,
                              load_iris, make_classification)
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
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


def create_iris_data():
    # Import Iris dataset
    iris = load_iris()
    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        iris.data, iris.target, test_size=0.2, random_state=0)
    feature_names = [name.replace(' (cm)', '') for name in iris.feature_names]
    classes = iris.target_names
    X_train = pd.DataFrame(X_train, columns=feature_names)
    X_test = pd.DataFrame(X_test, columns=feature_names)

    # create duplicate index
    test_index_list = X_test.index.tolist()
    test_index_list.append(test_index_list[0])
    X_test = X_test.reindex(test_index_list)
    y_test_list = y_test.tolist()
    y_test_list.append(y_test[0])
    y_test = np.array(y_test_list)

    return X_train, X_test, y_train, y_test, feature_names, classes


def create_cancer_data():
    breast_cancer_data = load_breast_cancer()
    classes = breast_cancer_data.target_names.tolist()

    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        breast_cancer_data.data, breast_cancer_data.target,
        test_size=0.2, random_state=0)
    feature_names = breast_cancer_data.feature_names
    classes = breast_cancer_data.target_names.tolist()
    X_train = pd.DataFrame(X_train, columns=feature_names)
    X_test = pd.DataFrame(X_test, columns=feature_names)
    return X_train, X_test, y_train, y_test, feature_names, classes


def create_binary_classification_dataset():
    X, y = make_classification(random_state=777)

    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(X,
                                                        y,
                                                        test_size=0.2,
                                                        random_state=0)
    classes = np.unique(y_train).tolist()
    feature_names = ["col" + str(i) for i in list(range(X_train.shape[1]))]
    X_train = pd.DataFrame(X_train, columns=feature_names)
    X_test = pd.DataFrame(X_test, columns=feature_names)
    return X_train, y_train, X_test, y_test, classes


def create_housing_data():
    # Import California housing dataset
    housing = fetch_california_housing()
    # Split data into train and test
    x_train, x_test, y_train, y_test = train_test_split(housing.data,
                                                        housing.target,
                                                        test_size=0.2,
                                                        random_state=7)
    return x_train, x_test, y_train, y_test, housing.feature_names


def create_adult_income_dataset():
    dataset = helpers.load_adult_income_dataset()
    continuous_features = ['age', 'hours_per_week']
    target_name = 'income'
    target = dataset[target_name]
    classes = list(np.unique(target))
    categorical_features = list(set(dataset.columns) -
                                set(continuous_features) -
                                set([target_name]))
    # Split data into train and test
    data_train, data_test, y_train, y_test = train_test_split(
        dataset, target,
        test_size=5000, random_state=7, stratify=target)
    return data_train, data_test, y_train, y_test, categorical_features, \
        continuous_features, target_name, classes


def create_complex_classification_pipeline(
        X_train, y_train, continuous_features, categorical_features):
    # We create the preprocessing pipelines for both
    # numeric and categorical data.
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())])

    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore'))])

    transformations = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, continuous_features),
            ('cat', categorical_transformer, categorical_features)])

    # Append classifier to preprocessing pipeline.
    # Now we have a full prediction pipeline.
    pipeline = Pipeline(steps=[('preprocessor', transformations),
                               ('classifier', RandomForestClassifier())])
    return pipeline.fit(X_train, y_train)


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
