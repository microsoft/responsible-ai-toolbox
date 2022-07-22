# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from responsibleai import RAIInsights


class TestCausalWithDifferentDataTypes:
    def test_causal_with_object_types(self, get_adult_shap_dataset):
        data_train, data_test, treatment_features, \
            heterogeneity_features, cat_cols, \
            target_feature = get_adult_shap_dataset

        rai_i = RAIInsights(
            model=None,
            train=data_train,
            test=data_test,
            target_column=target_feature,
            task_type='classification',
            categorical_features=cat_cols,
        )

        rai_i.causal.add(
            treatment_features=treatment_features,
            heterogeneity_features=heterogeneity_features
        )

        rai_i.compute()

    def test_causal_with_categorical_types(self, get_adult_shap_dataset):
        data_train, data_test, treatment_features, \
            heterogeneity_features, cat_cols, \
            target_feature = get_adult_shap_dataset

        for c in cat_cols:
            data_train[c] = data_train[c].astype("category")
            data_test[c] = data_test[c].astype("category")

        rai_i = RAIInsights(
            model=None,
            train=data_train,
            test=data_test,
            target_column=target_feature,
            task_type='classification',
            categorical_features=cat_cols,
        )

        rai_i.causal.add(
            treatment_features=treatment_features,
            heterogeneity_features=heterogeneity_features
        )

        rai_i.compute()
