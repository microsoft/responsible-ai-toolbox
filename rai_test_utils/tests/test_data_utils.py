# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from rai_test_utils.datasets.tabular.tabular_data_utils import \
    create_housing_data


class TestDataUtils:
    def test_create_housing_data(self):
        X_train, X_test, y_train, y_test, feature_names = create_housing_data()
        assert X_train is not None
