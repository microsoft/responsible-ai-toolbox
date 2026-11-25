# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from responsibleai.managers.counterfactual_manager import CounterfactualConfig
from responsibleai.managers.error_analysis_manager import ErrorAnalysisConfig


def create_counterfactual_config():
    return CounterfactualConfig(
        method='random', continuous_features=[], total_CFs=10,
        desired_class='opposite')


@pytest.mark.parametrize(
    'other', [None, 1, ErrorAnalysisConfig(3, 31, 20, None)])
def test_counterfactual_config_not_equal_to_other_types(other):
    config = create_counterfactual_config()

    assert config != other
    assert config in [other, config]


@pytest.mark.parametrize('other', [None, 'error analysis',
                                   create_counterfactual_config()])
def test_error_analysis_config_not_equal_to_other_types(other):
    config = ErrorAnalysisConfig(3, 31, 20, None)

    assert config != other
    assert config.is_duplicate([other, config])
