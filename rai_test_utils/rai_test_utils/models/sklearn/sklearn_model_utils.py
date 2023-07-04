# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
from sklearn import svm
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (FunctionTransformer, OneHotEncoder,
                                   StandardScaler)


def create_sklearn_random_forest_classifier(X, y):
    """Create a sklearn random forest classifier.

    param X: The training data.
    type X: numpy.ndarray or pandas.DataFrame
    param y: The training labels.
    type y: numpy.ndarray or pandas.DataFrame
    return: A sklearn random forest classifier.
    rtype: sklearn.ensemble.RandomForestClassifier
    """
    rfc = RandomForestClassifier(n_estimators=10, max_depth=4,
                                 random_state=777)
    model = rfc.fit(X, y)
    return model


def create_sklearn_svm_classifier(X, y, probability=True):
    """Create a sklearn svm classifier.

    param X: The training data.
    type X: numpy.ndarray or pandas.DataFrame
    param y: The training labels.
    type y: numpy.ndarray or pandas.DataFrame
    param probability: Whether to enable probability estimates.
    type probability: bool
    return: A sklearn svm classifier.
    rtype: sklearn.svm.SVC
    """
    clf = svm.SVC(gamma=0.001, C=100., probability=probability,
                  random_state=777)
    model = clf.fit(X, y)
    return model


def create_kneighbors_classifier(X, y):
    """Create a sklearn k-neighbors classifier.

    param X: The training data.
    type X: numpy.ndarray or pandas.DataFrame
    param y: The training labels.
    type y: numpy.ndarray or pandas.DataFrame
    return: A sklearn k-neighbors classifier.
    rtype: sklearn.neighbors.KNeighborsClassifier
    """
    knn = KNeighborsClassifier()
    model = knn.fit(X, y)
    return model


def create_sklearn_logistic_regressor(X, y, pipeline=False):
    """Create a sklearn logistic regressor.

    param X: The training data.
    type X: numpy.ndarray or pandas.DataFrame
    param y: The training labels.
    type y: numpy.ndarray or pandas.DataFrame
    param pipeline: Whether to wrap the model in a pipeline.
    type pipeline: bool
    return: A sklearn logistic regressor.
    rtype: sklearn.linear_model.LogisticRegression
    """
    lin = LogisticRegression(solver='liblinear', random_state=777)
    if pipeline:
        lin = Pipeline([('lin', lin)])
    model = lin.fit(X, y)
    return model


def create_sklearn_random_forest_regressor(X, y):
    """Create a sklearn random forest regressor.

    param X: The training data.
    type X: numpy.ndarray or pandas.DataFrame
    param y: The training labels.
    type y: numpy.ndarray or pandas.DataFrame
    return: A sklearn random forest regressor.
    rtype: sklearn.ensemble.RandomForestRegressor
    """
    rfc = RandomForestRegressor(n_estimators=10, max_depth=4,
                                random_state=777)
    model = rfc.fit(X, y)
    return model


def create_titanic_pipeline(X_train, y_train):
    """Create a sklearn pipeline for the titanic dataset.

    param X_train: The training data.
    type X_train: numpy.ndarray or pandas.DataFrame
    param y_train: The training labels.
    type y_train: numpy.ndarray or pandas.DataFrame
    return: A sklearn pipeline for the titanic dataset.
    rtype: sklearn.pipeline.Pipeline
    """
    def conv(X):
        """Convert a pandas series to a numpy array.

        param X: The data.
        type X: pandas.Series
        return: The data as a numpy array.
        rtype: numpy.ndarray
        """
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


def create_complex_classification_pipeline(
        X_train, y_train, continuous_features, categorical_features):
    """Create a complex sklearn pipeline for classification.

    param X_train: The training data.
    type X_train: numpy.ndarray or pandas.DataFrame
    param y_train: The training labels.
    type y_train: numpy.ndarray or pandas.DataFrame
    param continuous_features: The continuous features.
    type continuous_features: list
    param categorical_features: The categorical features.
    type categorical_features: list
    return: A complex sklearn pipeline for classification.
    rtype: sklearn.pipeline.Pipeline
    """
    # We create the preprocessing pipelines for both
    # numeric and categorical data.
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy='median')),
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
