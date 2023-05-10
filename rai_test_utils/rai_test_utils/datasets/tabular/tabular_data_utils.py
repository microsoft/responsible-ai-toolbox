# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd
import shap
from pandas import read_csv
from sklearn.datasets import (fetch_california_housing, load_breast_cancer,
                              load_diabetes, load_iris, load_wine,
                              make_classification)
from sklearn.model_selection import train_test_split


def create_iris_data(append_special_characters=False):
    """Create Iris dataset for classification.

    param append_special_characters: Whether to append special characters
        to feature names.
    type append_special_characters: bool
    return: Tuple of X_train, X_test, y_train, y_test, feature_names, classes.
    rtype: Tuple of pandas.DataFrame, pandas.DataFrame, numpy.ndarray,
           numpy.ndarray, list, list
    """
    # Import Iris dataset
    iris = load_iris()
    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        iris.data, iris.target, test_size=0.2, random_state=0)
    feature_names = [
        name.replace(' (cm)', '-' if append_special_characters else '')
        for name in iris.feature_names]

    X_train = pd.DataFrame(X_train, columns=feature_names)
    X_test = pd.DataFrame(X_test, columns=feature_names)
    classes = iris.target_names
    return X_train, X_test, y_train, y_test, feature_names, classes


def create_wine_data():
    """Create Wine dataset for classification.

    return: Tuple of X_train, X_test, y_train, y_test, feature_names, classes.
    rtype: Tuple of pandas.DataFrame, pandas.DataFrame,
           numpy.ndarray, numpy.ndarray, list, list
    """
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
    """Create Adult census dataset for classification.

    param string_labels: Whether to return labels as strings.
    type string_labels: bool
    return: Tuple of X_train, X_test, y_train, y_test, categorical_features.
    rtype: Tuple of pandas.DataFrame, pandas.DataFrame, numpy.ndarray,
           numpy.ndarray, list
    """
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


def create_cancer_data(return_dataframe=False):
    """Create Breast Cancer dataset for classification.

    param return_dataframe: Whether to return data as pandas DataFrame.
    type return_dataframe: bool
    return: Tuple of X_train, X_test, y_train, y_test, feature_names, classes.
    rtype: Tuple of pandas.DataFrame, pandas.DataFrame, numpy.ndarray,
           numpy.ndarray, list, list
    """
    breast_cancer_data = load_breast_cancer()
    classes = breast_cancer_data.target_names.tolist()

    # Split data into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        breast_cancer_data.data, breast_cancer_data.target,
        test_size=0.2, random_state=0)
    feature_names = breast_cancer_data.feature_names
    classes = breast_cancer_data.target_names.tolist()

    if return_dataframe:
        X_train = pd.DataFrame(X_train, columns=feature_names)
        X_test = pd.DataFrame(X_test, columns=feature_names)

    return X_train, X_test, y_train, y_test, feature_names, classes


def create_diabetes_data():
    """Create Diabetes dataset for regression.

    return: Tuple of X_train, X_test, y_train, y_test, feature_names.
    rtype: Tuple of numpy.ndarray, numpy.ndarray, numpy.ndarray,
           numpy.ndarray, list
    """
    diabetes_data = load_diabetes()
    X = diabetes_data.data
    y = diabetes_data.target
    feature_names = diabetes_data.feature_names

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=0)
    return X_train, X_test, y_train, y_test, feature_names


def create_binary_classification_dataset(n_samples=100):
    """Create a binary classification dataset.

    param n_samples: Number of samples.
    type n_samples: int
    return: Tuple of X_train, y_train, X_test, y_test, classes.
    rtype: Tuple of pandas.DataFrame, pandas.DataFrame, numpy.ndarray,
           numpy.ndarray, list
    """
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


def create_simple_titanic_data():
    """Create simple Titanic dataset for classification.

    return: Tuple of X_train, X_test, y_train, y_test, num_features,
            cat_features.
    rtype: Tuple of pd.DataFrame, pd.DataFrame, numpy.ndarray, numpy.ndarray,
           list, list
    """
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


def create_housing_data(create_small_dataset=True):
    """Create California housing dataset for regression.

    param create_small_dataset: Whether to create a small dataset or not.
    type create_small_dataset: bool
    return: Tuple of x_train, x_test, y_train, y_test, feature_names.
    rtype: Tuple of numpy.ndarray, numpy.ndarray, numpy.ndarray,
           numpy.ndarray, list
    """
    # Import California housing dataset
    housing = fetch_california_housing()
    # Split data into train and test
    if create_small_dataset:
        x_train, x_test, y_train, y_test = train_test_split(housing.data,
                                                            housing.target,
                                                            train_size=500,
                                                            test_size=50,
                                                            random_state=7)
    else:
        x_train, x_test, y_train, y_test = train_test_split(housing.data,
                                                            housing.target,
                                                            test_size=0.2,
                                                            random_state=7)
    return x_train, x_test, y_train, y_test, housing.feature_names
