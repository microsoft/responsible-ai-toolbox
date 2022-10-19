# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from rai_test_utils.models.lightgbm.lightgbm_model_utils import \
    create_lightgbm_classifier
from rai_test_utils.models.sklearn.sklearn_model_utils import (
    create_sklearn_logistic_regressor, create_sklearn_random_forest_classifier,
    create_sklearn_random_forest_regressor, create_sklearn_svm_classifier)
from rai_test_utils.models.xgboost.xgboost_model_utils import \
    create_xgboost_classifier


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
