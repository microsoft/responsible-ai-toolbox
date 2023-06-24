# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Namespace for tabular datasets."""

from .classification_data_utils import (
    create_adult_census_data, create_binary_classification_dataset,
    create_cancer_data, create_complex_titanic_data, create_iris_data,
    create_msx_data, create_multiclass_classification_dataset,
    create_reviews_data, create_simple_titanic_data, create_wine_data)
from .regression_data_utils import (create_diabetes_data, create_energy_data,
                                    create_housing_data)
from .timeseries_data_utils import create_timeseries_data

__all__ = [
    "create_iris_data",
    "create_wine_data",
    "create_adult_census_data",
    "create_cancer_data",
    "create_diabetes_data",
    "create_binary_classification_dataset",
    "create_simple_titanic_data",
    "create_housing_data",
    "create_timeseries_data",
    "create_msx_data",
    "create_energy_data",
    "create_complex_titanic_data",
    "create_multiclass_classification_dataset",
    "create_reviews_data"
]
