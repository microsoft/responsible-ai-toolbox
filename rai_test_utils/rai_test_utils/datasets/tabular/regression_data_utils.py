# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
from sklearn.datasets import fetch_california_housing, load_diabetes
from sklearn.model_selection import train_test_split

from rai_test_utils.utilities import retrieve_dataset


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


def create_energy_data():
    """Create energy efficiency dataset for regression.

    return: Tuple of x_train, x_test, y_train, y_test, feature_names.
    rtype: Tuple of numpy.ndarray, numpy.ndarray, numpy.ndarray,
              numpy.ndarray, list
    """
    # Import energy data
    energy_data = retrieve_dataset('energyefficiency2012_data.train.csv')
    # Get the Y1 column
    target = energy_data.iloc[:, len(energy_data.columns) - 2]
    energy_data = energy_data.iloc[:, :len(energy_data.columns) - 3]
    feature_names = energy_data.columns.values
    # Split data into train and test
    x_train, x_test, y_train, y_validation = train_test_split(
        energy_data, target,
        test_size=0.2, random_state=0
    )
    return x_train, x_test, y_train, y_validation, feature_names
