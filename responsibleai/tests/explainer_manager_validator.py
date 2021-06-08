# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest
from responsibleai._internal.constants import ManagerNames, ListProperties
from responsibleai import ModelTask

LIGHTGBM_METHOD = 'mimic.lightgbm'


def setup_explainer(model_analysis, add_explainer=True):
    if add_explainer:
        model_analysis.explainer.add()
        # Validate calling add multiple times prints a warning
        with pytest.warns(UserWarning):
            model_analysis.explainer.add()
    model_analysis.explainer.compute()


def validate_explainer(model_analysis, X_train, X_test, classes):
    explanations = model_analysis.explainer.get()
    assert isinstance(explanations, list)
    assert len(explanations) == 1
    explanation = explanations[0]
    num_cols = len(X_train.columns) - 1
    if classes is not None:
        assert len(explanation.local_importance_values) == len(classes)
        assert len(explanation.local_importance_values[0]) == len(X_test)
        assert len(explanation.local_importance_values[0][0]) == num_cols
    else:
        assert len(explanation.local_importance_values) == len(X_test)
        assert len(explanation.local_importance_values[0]) == num_cols

    properties = model_analysis.explainer.list()
    assert properties[ListProperties.MANAGER_TYPE] == ManagerNames.EXPLAINER
    assert 'id' in properties
    assert properties['method'] == LIGHTGBM_METHOD
    if classes is not None:
        assert properties['model_task'] == ModelTask.CLASSIFICATION
    else:
        assert properties['model_task'] == ModelTask.REGRESSION
    assert properties['model_type'] is None
    assert properties['is_raw'] is False
    assert properties['is_engineered'] is False
