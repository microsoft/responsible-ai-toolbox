# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from test_rai_utilities.data_utils import create_housing_data
from test_rai_utilities.model_utils import create_models_regression


class TestModelUtils:

    def test_regression_models(self):
        X_train, X_test, y_train, _, _ = create_housing_data()

        model_list = create_models_regression(X_train, y_train)
        for model in model_list:
            model.predict(X_test)
