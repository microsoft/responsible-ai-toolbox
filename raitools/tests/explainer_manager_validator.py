# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
from raitools._internal.constants import ManagerNames, ListProperties
from raitools import ModelTask

LIGHTGBM_METHOD = 'mimic.lightgbm'


def setup_explainer(rai_analyzer, add_explainer=True):
    if add_explainer:
        rai_analyzer.explainer.add()
        # Validate calling add multiple times prints a warning
        with pytest.warns(UserWarning):
            rai_analyzer.explainer.add()
    rai_analyzer.explainer.compute()


def validate_explainer(rai_analyzer, x_train, x_test, classes):
    explanations = rai_analyzer.explainer.get()
    assert isinstance(explanations, list)
    assert len(explanations) == 1
    explanation = explanations[0]
    assert len(explanation.local_importance_values) == len(classes)
    assert len(explanation.local_importance_values[0]) == len(x_test)
    num_cols = len(x_train.columns) - 1
    assert len(explanation.local_importance_values[0][0]) == num_cols
    properties = rai_analyzer.explainer.list()
    assert properties[ListProperties.MANAGER_TYPE] == ManagerNames.EXPLAINER
    assert 'id' in properties
    assert properties['method'] == LIGHTGBM_METHOD
    assert properties['model_task'] == ModelTask.CLASSIFICATION
    assert properties['model_type'] is None
    assert properties['is_raw'] is False
    assert properties['is_engineered'] is False
