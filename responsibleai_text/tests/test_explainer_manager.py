# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import shap

from responsibleai_text.common.constants import ModelTask
from responsibleai_text.managers.explainer_manager import ExplainerManager


class TestExplainerManager:

    def test_compute_global_importances_with_variable_length_text(self):
        values = np.empty(2, dtype=object)
        values[:] = [
            np.ones((2, 2)),
            np.full((3, 2), 2.0)
        ]
        feature_names = np.empty(2, dtype=object)
        feature_names[:] = [
            ['first', 'second'],
            ['first', 'second', 'third']
        ]
        explanation = shap.Explanation(
            values=values,
            base_values=np.zeros((2, 2)),
            data=feature_names,
            feature_names=feature_names)
        manager = ExplainerManager.__new__(ExplainerManager)
        manager._task_type = ModelTask.TEXT_CLASSIFICATION

        features, scores, intercept = manager._compute_global_importances(
            explanation)

        assert features == ['first', 'second', 'third']
        assert scores == [1.5, 1.5, 2.0]
        assert intercept == 0.0
