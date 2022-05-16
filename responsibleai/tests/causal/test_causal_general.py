# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from ..common_utils import create_adult_income_dataset
from ..causal_manager_validator import validate_causal


from responsibleai import RAIInsights


def test_causal_classification_01():
    # This test works with SciKit-Learn 1.1.0
    # See PR #1429
    data_train, data_test, _, _, categorical_features, \
        _, target_name, classes = create_adult_income_dataset()

    rai_i = RAIInsights(
        model=None,
        train=data_train,
        test=data_test,
        task_type='classification',
        target_column=target_name,
        categorical_features=categorical_features,
        classes=classes
    )
    assert rai_i is not None

    treatment_features = ["age", "gender"]
    rai_i.causal.add(treatment_features=treatment_features)

    rai_i.compute()

    assert rai_i is not None
    validate_causal(rai_i, data_train, target_name,
                    treatment_features, 50)


def test_causal_classification_02():
    # This test gets stuck on SciKit-Learn v1.1.0
    # See PR #1429
    data_train, data_test, _, _, categorical_features, \
        _, target_name, classes = create_adult_income_dataset()

    rai_i = RAIInsights(
        model=None,
        train=data_train,
        test=data_test,
        task_type='classification',
        target_column=target_name,
        categorical_features=categorical_features,
        classes=classes
    )
    assert rai_i is not None

    treatment_features = ["age", "gender"]
    cat_expansion = 49
    rai_i.causal.add(treatment_features=treatment_features,
                     heterogeneity_features=["marital_status"],
                     nuisance_model="automl",
                     heterogeneity_model="forest",
                     alpha=0.06,
                     upper_bound_on_cat_expansion=cat_expansion,
                     treatment_cost=[0.1, 0.2],
                     min_tree_leaf_samples=2,
                     skip_cat_limit_checks=False,
                     categories="auto",
                     n_jobs=1,
                     verbose=1,
                     random_state=100,
                     )

    rai_i.compute()

    assert rai_i is not None
    validate_causal(rai_i, data_train, target_name,
                    treatment_features, cat_expansion)
