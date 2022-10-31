# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from rai_test_utils.datasets.tabular import (create_housing_data,
                                             create_iris_data)
from rai_test_utils.models import (create_models_classification,
                                   create_models_regression)


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
