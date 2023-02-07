# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from rai_test_utils.datasets.tabular import (create_housing_data,
                                             create_iris_data,
                                             create_simple_titanic_data)
from rai_test_utils.models import (create_models_classification,
                                   create_models_regression)
from rai_test_utils.models.sklearn import \
    create_complex_classification_pipeline


class TestModelUtils:

    def test_regression_models(self):
        X_train, X_test, y_train, _, _ = create_housing_data()

        model_list = create_models_regression(X_train, y_train)
        for model in model_list:
            assert model.predict(X_test) is not None

    def test_classification_models(self):
        X_train, X_test, y_train, _, _, _ = create_iris_data()

        model_list = create_models_classification(X_train, y_train)
        for model in model_list:
            assert model.predict(X_test) is not None

    def test_create_complex_classification_pipeline(self):
        X_train, X_test, y_train, _, num_feature_names, \
            cat_feature_names = create_simple_titanic_data()
        pipeline = create_complex_classification_pipeline(
            X_train, y_train, num_feature_names, cat_feature_names)
        assert pipeline.predict(X_test) is not None
