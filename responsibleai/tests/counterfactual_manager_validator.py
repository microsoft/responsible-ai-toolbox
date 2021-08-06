# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
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

    # Add a bad configuration
    with pytest.raises(DiceException):
        cf_analyzer.counterfactual.add(total_CFs=-20,
                                       method='random',
                                       desired_class=desired_class,
                                       desired_range=desired_range,
                                       feature_importance=feature_importance)
        cf_analyzer.counterfactual.compute()
    assert cf_analyzer.counterfactual.get() is not None
    assert isinstance(cf_analyzer.counterfactual.get(), list)
    assert len(cf_analyzer.counterfactual.get()) == 2
    assert len(cf_analyzer.counterfactual.get(failed_to_compute=True)) == 1
