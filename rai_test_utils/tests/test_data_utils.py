# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from rai_test_utils.datasets.tabular import (
    create_adult_census_data, create_binary_classification_dataset,
    create_cancer_data, create_diabetes_data, create_housing_data,
    create_iris_data, create_simple_titanic_data, create_wine_data)


class TestDataUtils:
    @pytest.mark.parametrize('if_small_data', [True, False])
    def test_create_housing_data(self, if_small_data):
        X_train, X_test, y_train, y_test, feature_names = \
            create_housing_data(if_small_data)
        assert X_train is not None
        assert X_test is not None
        assert y_train is not None
        assert y_test is not None
        assert feature_names is not None

    def test_create_simple_titanic_data(self):
        X_train, X_test, y_train, y_test, num_feature_names, \
            cat_feature_names = create_simple_titanic_data()
        assert X_train is not None
        assert X_test is not None
        assert y_train is not None
        assert y_test is not None
        assert num_feature_names is not None
        assert cat_feature_names is not None

    def test_create_binary_classification_dataset(self):
        X_train, X_test, y_train, y_test, classes = \
            create_binary_classification_dataset()
        assert X_train is not None
        assert X_test is not None
        assert y_train is not None
        assert y_test is not None
        assert classes is not None

    def test_create_diabetes_data(self):
        X_train, X_test, y_train, y_test, feature_names = \
            create_diabetes_data()
        assert X_train is not None
        assert X_test is not None
        assert y_train is not None
        assert y_test is not None
        assert feature_names is not None

    @pytest.mark.parametrize('return_dataframe', [True, False])
    def test_create_cancer_data(self, return_dataframe):
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_cancer_data(return_dataframe)
        assert X_train is not None
        assert X_test is not None
        assert y_train is not None
        assert y_test is not None
        assert feature_names is not None
        assert classes is not None

    def test_create_wine_data(self):
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_wine_data()
        assert X_train is not None
        assert X_test is not None
        assert y_train is not None
        assert y_test is not None
        assert feature_names is not None
        assert classes is not None

    @pytest.mark.parametrize('append_special_characters', [True, False])
    def test_create_iris_data(self, append_special_characters):
        X_train, X_test, y_train, y_test, feature_names, classes = \
            create_iris_data(append_special_characters)
        assert X_train is not None
        assert X_test is not None
        assert y_train is not None
        assert y_test is not None
        assert feature_names is not None
        assert classes is not None

    @pytest.mark.parametrize('string_labels', [True, False])
    def test_create_adult_census_data(self, string_labels):
        X_train, X_test, y_train, y_test, feature_names = \
            create_adult_census_data(string_labels)
        assert X_train is not None
        assert X_test is not None
        assert y_train is not None
        assert y_test is not None
        assert feature_names is not None
