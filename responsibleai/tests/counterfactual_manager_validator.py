# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
from dice_ml.utils.exception import \
    UserConfigValidationException as DiceException

from responsibleai._internal.constants import (CounterfactualManagerKeys,
                                               ListProperties, ManagerNames)
from responsibleai.exceptions import (DuplicateManagerConfigException,
                                      UserConfigValidationException)


def verify_counterfactual_object(counterfactual_obj, feature_importance=False):
    counterfactual_obj.cf_examples_list is not None
    if feature_importance:
        assert counterfactual_obj.local_importance is not None
        assert counterfactual_obj.summary_importance is not None
    else:
        assert counterfactual_obj.local_importance is None
        assert counterfactual_obj.summary_importance is None


def verify_counterfactual_properties(
        counterfactual_props, expected_counterfactuals):
    assert counterfactual_props[ListProperties.MANAGER_TYPE] == \
        ManagerNames.COUNTERFACTUAL
    assert counterfactual_props[
        CounterfactualManagerKeys.COUNTERFACTUALS] is not None
    assert len(
        counterfactual_props[CounterfactualManagerKeys.COUNTERFACTUALS]) == \
        expected_counterfactuals


def validate_counterfactual(cf_analyzer,
                            desired_class=None, desired_range=None,
                            feature_importance=False):
    if cf_analyzer.model is None:
        with pytest.raises(UserConfigValidationException,
                           match='Model is required for counterfactual '
                                 'example generation and feature importances'):
            cf_analyzer.counterfactual.add(
                total_CFs=10,
                method='random',
                desired_class=desired_class,
                desired_range=desired_range,
                feature_importance=feature_importance)
        return

    # Add the first configuration
    cf_analyzer.counterfactual.add(total_CFs=10,
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
    verify_counterfactual_properties(
        counterfactual_props=cf_analyzer.counterfactual.list(),
        expected_counterfactuals=1)

    # Add a duplicate configuration
    with pytest.raises(DuplicateManagerConfigException):
        cf_analyzer.counterfactual.add(total_CFs=10,
                                       method='random',
                                       desired_class=desired_class,
                                       desired_range=desired_range,
                                       feature_importance=feature_importance)

    # Add the second configuration
    cf_analyzer.counterfactual.add(total_CFs=20,
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
    verify_counterfactual_properties(
        counterfactual_props=cf_analyzer.counterfactual.list(),
        expected_counterfactuals=2)

    # Add a bad configuration
    if feature_importance:
        with pytest.raises(UserConfigValidationException):
            cf_analyzer.counterfactual.add(
                total_CFs=2,
                method='random',
                desired_class=desired_class,
                desired_range=desired_range,
                feature_importance=feature_importance)
        assert cf_analyzer.counterfactual.get() is not None
        assert isinstance(cf_analyzer.counterfactual.get(), list)
        assert len(cf_analyzer.counterfactual.get()) == 2
        verify_counterfactual_properties(
            counterfactual_props=cf_analyzer.counterfactual.list(),
            expected_counterfactuals=2)
    else:
        with pytest.raises(DiceException):
            cf_analyzer.counterfactual.add(
                total_CFs=-2,
                method='random',
                desired_class=desired_class,
                desired_range=desired_range,
                feature_importance=feature_importance)
            cf_analyzer.counterfactual.compute()
        assert cf_analyzer.counterfactual.get() is not None
        assert isinstance(cf_analyzer.counterfactual.get(), list)
        assert len(cf_analyzer.counterfactual.get()) == 2
        assert len(cf_analyzer.counterfactual.get(failed_to_compute=True)) == 1
        verify_counterfactual_properties(
            counterfactual_props=cf_analyzer.counterfactual.list(),
            expected_counterfactuals=3)
