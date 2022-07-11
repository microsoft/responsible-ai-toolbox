# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


from responsibleai import RAIInsights

from ..causal_manager_validator import _check_causal_result
from ..common_utils import create_adult_income_dataset


def test_causal_classification_scikitlearn_issue():
    # This test gets stuck on SciKit-Learn v1.1.0
    # See PR #1429
    data_train, data_test, _, _, categorical_features, \
        _, target_name, classes, _, _ = \
        create_adult_income_dataset()

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

    results = rai_i.causal.get()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 1
    _check_causal_result(results[0])
