# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest

from responsibleai import ModelTask
from responsibleai._internal.constants import ListProperties, ManagerNames
from responsibleai.exceptions import UserConfigValidationException

LIGHTGBM_METHOD = 'mimic.lightgbm'


def setup_explainer(rai_insights, add_explainer=True):
    if add_explainer:
        if rai_insights.model is None:
            with pytest.raises(
                    UserConfigValidationException,
                    match='Model is required for model explanations'):
                rai_insights.explainer.add()
            return
        else:
            rai_insights.explainer.add()
        # Validate calling add multiple times prints a warning
        with pytest.warns(
            UserWarning,
            match="DUPLICATE-EXPLAINER-CONFIG: Ignoring. "
                  "Explanation has already been added, "
                  "currently limited to one explainer type."):
            rai_insights.explainer.add()
    rai_insights.explainer.compute()


def validate_explainer(rai_insights, X_train, X_test, classes):
    if rai_insights.model is None:
        return
    explanations = rai_insights.explainer.get()
    assert isinstance(explanations, list)
    assert len(explanations) == 1
    explanation = explanations[0]
    if rai_insights._feature_metadata is not None and \
            rai_insights._feature_metadata.dropped_features is not None:
        num_cols = len(X_train.columns) - 1 - len(
            rai_insights._feature_metadata.dropped_features)
    else:
        num_cols = len(X_train.columns) - 1
    if classes is not None:
        assert len(explanation.local_importance_values) == len(classes)
        assert len(explanation.local_importance_values[0]) == len(X_test)
        assert len(explanation.local_importance_values[0][0]) == num_cols
    else:
        assert len(explanation.local_importance_values) == len(X_test)
        assert len(explanation.local_importance_values[0]) == num_cols

    properties = rai_insights.explainer.list()
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

    # Check the internal state of explainer manager
    assert rai_insights.explainer._is_added
    assert rai_insights.explainer._is_run
