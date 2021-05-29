# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
import pandas as pd

from responsibleai.exceptions import (
    DuplicateManagerConfigException,
    UserConfigValidationException)


def validate_causal(model_analysis, data, target_column):
    # Add the first configuration
    model_analysis.causal.add(nuisance_model='automl')
    model_analysis.causal.compute()
    results = model_analysis.causal.get()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 1
    causal_analysis = results[0]
    _check_causal_analysis(causal_analysis)

    # Add a duplicate configuration
    message = "Duplicate causal configuration detected."
    with pytest.raises(DuplicateManagerConfigException, match=message):
        model_analysis.causal.add(nuisance_model='automl')

    # Add the second configuration
    model_analysis.causal.add(nuisance_model='linear')
    model_analysis.causal.compute()
    results = model_analysis.causal.get()
    assert results is not None
    assert isinstance(results, list)
    assert len(results) == 2

    # Add a bad configuration
    model_analysis.causal.add(nuisance_model='fake_model')
    with pytest.raises(UserConfigValidationException):
        model_analysis.causal.compute()


def _check_causal_analysis(causal_analysis):
    assert isinstance(causal_analysis["global_causal_effects"], pd.DataFrame)
    assert isinstance(causal_analysis["local_causal_effects"], pd.DataFrame)
