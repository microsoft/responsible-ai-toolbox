# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Namespace for tabular datasets."""

from .tabular_data_utils import (create_adult_census_data,
                                 create_binary_classification_dataset,
                                 create_cancer_data, create_diabetes_data,
                                 create_housing_data, create_iris_data,
                                 create_simple_titanic_data, create_wine_data)

__all__ = [
    create_iris_data,
    create_wine_data,
    create_adult_census_data,
    create_cancer_data,
    create_diabetes_data,
    create_binary_classification_dataset,
    create_simple_titanic_data,
    create_housing_data
]
