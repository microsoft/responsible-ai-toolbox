# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
from responsibleai import ModelTask
from responsibleai.exceptions import (
    DuplicateManagerConfigException, UserConfigValidationException
)


def validate_counterfactual(cf_analyzer, X_train, target_column,
                            desired_class=None, desired_range=None):
    continuous_features = list(set(X_train.columns) - set([target_column]))

    # Add the first configuration
    cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                   total_CFs=10,
                                   method='random',
                                   desired_class=desired_class,
                                   desired_range=desired_range)
    cf_analyzer.counterfactual.compute()
    assert cf_analyzer.counterfactual.get() is not None
    assert isinstance(cf_analyzer.counterfactual.get(), list)
    assert len(cf_analyzer.counterfactual.get()) == 1

    # Add a duplicate configuration
    with pytest.raises(DuplicateManagerConfigException):
        cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                       total_CFs=10,
                                       method='random',
                                       desired_class=desired_class,
                                       desired_range=desired_range)

    # Add the second configuration
    cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                   total_CFs=1,
                                   method='random',
                                   desired_class=desired_class,
                                   desired_range=desired_range)
    cf_analyzer.counterfactual.compute()
    assert cf_analyzer.counterfactual.get() is not None
    assert isinstance(cf_analyzer.counterfactual.get(), list)
    assert len(cf_analyzer.counterfactual.get()) == 2

    # Add a bad configuration
    cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                   total_CFs=-1,
                                   method='random',
                                   desired_class=desired_class,
                                   desired_range=desired_range)
    cf_analyzer.counterfactual.compute()
    assert cf_analyzer.counterfactual.get() is not None
    assert isinstance(cf_analyzer.counterfactual.get(), list)
    assert len(cf_analyzer.counterfactual.get()) == 2
    assert len(cf_analyzer.counterfactual.get(failed_to_compute=True)) == 1

    task_type = cf_analyzer.task_type
    if task_type == ModelTask.REGRESSION:
        with pytest.raises(UserConfigValidationException):
            cf_analyzer.counterfactual.add(
                continuous_features=continuous_features,
                total_CFs=10,
                method='random',
                desired_range=None)
    else:
        with pytest.raises(UserConfigValidationException):
            cf_analyzer.counterfactual.add(
                continuous_features=continuous_features,
                total_CFs=10,
                method='random',
                desired_class=None)
