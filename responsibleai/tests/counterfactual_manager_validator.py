# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
from responsibleai import ModelTask
from responsibleai.exceptions import (
    DuplicateManagerConfigException, UserConfigValidationException
)
from dice_ml.utils.exception import (
    UserConfigValidationException as DiceException
)


def verify_counterfactual_object(counterfactual_obj, feature_importance=False):
    counterfactual_obj.cf_examples_list is not None
    if feature_importance:
        assert counterfactual_obj.local_importance is not None
        assert counterfactual_obj.summary_importance is not None
    else:
        assert counterfactual_obj.local_importance is None
        assert counterfactual_obj.summary_importance is None


def validate_counterfactual(cf_analyzer, X_train, target_column,
                            desired_class=None, desired_range=None,
                            feature_importance=False):
    continuous_features = list(set(X_train.columns) - set([target_column]))

    # Add the first configuration
    cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                   total_CFs=10,
                                   method='random',
                                   desired_class=desired_class,
                                   desired_range=desired_range,
                                   feature_importance=feature_importance)
    cf_analyzer.counterfactual.compute()
    assert cf_analyzer.counterfactual.get() is not None
    assert isinstance(cf_analyzer.counterfactual.get(), list)
    assert len(cf_analyzer.counterfactual.get()) == 1
    verify_counterfactual_object(cf_analyzer.counterfactual.get()[0],
                                 feature_importance=feature_importance)

    # Add a duplicate configuration
    with pytest.raises(DuplicateManagerConfigException):
        cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                       total_CFs=10,
                                       method='random',
                                       desired_class=desired_class,
                                       desired_range=desired_range,
                                       feature_importance=feature_importance)

    # Add the second configuration
    cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                   total_CFs=20,
                                   method='random',
                                   desired_class=desired_class,
                                   desired_range=desired_range,
                                   feature_importance=feature_importance)
    cf_analyzer.counterfactual.compute()
    assert cf_analyzer.counterfactual.get() is not None
    assert isinstance(cf_analyzer.counterfactual.get(), list)
    assert len(cf_analyzer.counterfactual.get()) == 2
    verify_counterfactual_object(cf_analyzer.counterfactual.get()[0],
                                 feature_importance=feature_importance)
    verify_counterfactual_object(cf_analyzer.counterfactual.get()[1],
                                 feature_importance=feature_importance)

    # Add a bad configuration
    with pytest.raises(DiceException):
        cf_analyzer.counterfactual.add(continuous_features=continuous_features,
                                       total_CFs=-20,
                                       method='random',
                                       desired_class=desired_class,
                                       desired_range=desired_range,
                                       feature_importance=feature_importance)
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
                desired_range=None,
                feature_importance=feature_importance)
    else:
        with pytest.raises(UserConfigValidationException):
            cf_analyzer.counterfactual.add(
                continuous_features=continuous_features,
                total_CFs=10,
                method='random',
                desired_class=None,
                feature_importance=feature_importance)
