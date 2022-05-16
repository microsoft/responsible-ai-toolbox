# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import shap
from sklearn.model_selection import train_test_split

from responsibleai import RAIInsights


def get_adult_data():
    X, y = shap.datasets.adult()
    target_feature = "income"
    y = [1 if y_i else 0 for y_i in y]

    full_data = X.copy()
    full_data[target_feature] = y

    data_train, data_test = train_test_split(
        full_data, test_size=1000, random_state=96132, stratify=full_data[target_feature]
    )

    categorical_columns = ["Race", "Sex", "Workclass",
                           "Marital Status", "Country", "Occupation"]

    return target_feature, categorical_columns, data_train, data_test


def test_causal_classification_01():
    X, y = shap.datasets.adult()
    target_feature = "income"
    y = [1 if y_i else 0 for y_i in y]

    full_data = X.copy()
    full_data[target_feature] = y

    target_feature, categorical_columns, data_train, data_test = get_adult_data()

    rai_i_01 = RAIInsights(
        model=None,
        train=data_train,
        test=data_test,
        task_type='classification',
        target_column=target_feature,
        categorical_features=categorical_columns
    )
    assert rai_i_01 is not None

    rai_i_01.causal.add(treatment_features=["Age", "Sex"])

    rai_i_01.compute()

    assert rai_i_01 is not None


def test_causal_classification_02():
    X, y = shap.datasets.adult()
    target_feature = "income"
    y = [1 if y_i else 0 for y_i in y]

    full_data = X.copy()
    full_data[target_feature] = y

    target_feature, categorical_columns, data_train, data_test = get_adult_data()

    rai_i = RAIInsights(
        model=None,
        train=data_train,
        test=data_test,
        task_type='classification',
        target_column=target_feature,
        categorical_features=categorical_columns
    )
    assert rai_i is not None

    rai_i.causal.add(treatment_features=["Age", "Sex"],
                     heterogeneity_features=["Marital Status"],
                     nuisance_model="automl",
                     heterogeneity_model="forest",
                     alpha=0.06,
                     upper_bound_on_cat_expansion=49,
                     treatment_cost=[0.1, 0.2],
                     min_tree_leaf_samples=2,
                     max_tree_depth=1,
                     skip_cat_limit_checks=False,
                     categories="auto",
                     n_jobs=1,
                     verbose=1,
                     random_state=100,
                     )

    rai_i.compute()

    assert rai_i is not None
