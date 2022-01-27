# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

# Defines common utilities for error analysis tests
import numpy as np
import pandas as pd
import shap
from lightgbm import LGBMClassifier
from pandas import read_csv
from sklearn import svm
from sklearn.compose import ColumnTransformer
from sklearn.datasets import (load_boston, load_breast_cancer, load_iris,
                              load_wine, make_classification)
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
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


def create_iris_data(append_special_characters=False):
    # Import Iris dataset
    iris = load_iris()
    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        iris.data, iris.target, test_size=0.2, random_state=0)
    feature_names = [
        name.replace(' (cm)', '-' if append_special_characters else '')
        for name in iris.feature_names]

    classes = iris.target_names
    return X_train, X_test, y_train, y_test, feature_names, classes


def create_wine_data():
    wine = load_wine()
    X = wine.data
    y = wine.target
    classes = wine.target_names
    feature_names = wine.feature_names
    X_train, X_test, y_train, y_test = train_test_split(X,
                                                        y,
                                                        test_size=0.5,
                                                        random_state=0)
    return X_train, X_test, y_train, y_test, feature_names, classes


def create_adult_census_data(string_labels=False):
    X, y = shap.datasets.adult()
    if string_labels:
        y = [">=50K" if r else "<50K" for r in y]
    else:
        y = [1 if r else 0 for r in y]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=7, stratify=y)

    categorical_features = ['Workclass',
                            'Education-Num',
                            'Marital Status',
                            'Occupation',
                            'Relationship',
                            'Race',
                            'Sex',
                            'Country']
    return X_train, X_test, y_train, y_test, categorical_features


def create_cancer_data():
    breast_cancer_data = load_breast_cancer()
    classes = breast_cancer_data.target_names.tolist()

    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        breast_cancer_data.data, breast_cancer_data.target,
        test_size=0.2, random_state=0)
    feature_names = breast_cancer_data.feature_names
    classes = breast_cancer_data.target_names.tolist()
    return X_train, X_test, y_train, y_test, feature_names, classes


def create_binary_classification_dataset(n_samples=100):
    X, y = make_classification(n_samples=n_samples, random_state=777)

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


def replicate_dataset(X, y, replications=16):
    for _ in range(replications):
        X = pd.concat([X, X], ignore_index=True)
        y = np.concatenate([y, y])
    return X, y


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


def create_boston_data(test_size=0.2):
    # Import Boston housing dataset
    boston = load_boston()
    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        boston.data, boston.target,
        test_size=test_size, random_state=7)
    return X_train, X_test, y_train, y_test, boston.feature_names


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


def create_dataframe(data, feature_names):
    return pd.DataFrame(data, columns=feature_names)
