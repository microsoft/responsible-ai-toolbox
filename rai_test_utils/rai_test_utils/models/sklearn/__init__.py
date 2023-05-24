# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Namespace for sklearn models."""

from .sklearn_model_utils import (create_complex_classification_pipeline,
                                  create_kneighbors_classifier,
                                  create_sklearn_logistic_regressor,
                                  create_sklearn_random_forest_classifier,
                                  create_sklearn_random_forest_regressor,
                                  create_sklearn_svm_classifier,
                                  create_titanic_pipeline)

__all__ = [
    create_kneighbors_classifier,
    create_sklearn_logistic_regressor,
    create_sklearn_random_forest_classifier,
    create_sklearn_random_forest_regressor,
    create_sklearn_svm_classifier,
    create_titanic_pipeline,
    create_complex_classification_pipeline
]
