# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import pytest


class TestResponsibleaiManagersBackCompat:
    def test_responsibleai_managers_back_compat(self):
        with pytest.warns(
            UserWarning,
            match="The module responsibleai._managers.base_manager "
                  "is deprecated. "
                  "Please use responsibleai.managers.base_manager instead."):
            from responsibleai._managers.base_manager import \
                BaseManager  # noqa: F401, F403

        with pytest.warns(
            UserWarning,
            match="The module responsibleai._managers.causal_manager "
                  "is deprecated. "
                  "Please use responsibleai.managers.causal_manager instead."):
            from responsibleai._managers.causal_manager import \
                CausalManager  # noqa: F401, F403

        with pytest.warns(
            UserWarning,
            match="The module responsibleai._managers.counterfactual_manager "
                  "is deprecated. "
                  "Please use responsibleai.managers.counterfactual_manager "
                  "instead."):
            from responsibleai._managers.counterfactual_manager import \
                CounterfactualConfig  # noqa: F401, F403
            from responsibleai._managers.counterfactual_manager import \
                CounterfactualConstants  # noqa: F401, F403
            from responsibleai._managers.counterfactual_manager import \
                CounterfactualManager  # noqa: F401, F403

        with pytest.warns(
            UserWarning,
            match="The module responsibleai._managers.error_analysis_manager "
                  "is deprecated. "
                  "Please use responsibleai.managers.error_analysis_manager "
                  "instead."):
            from responsibleai._managers.error_analysis_manager import \
                ErrorAnalysisConfig  # noqa: F401, F403
            from responsibleai._managers.error_analysis_manager import \
                ErrorAnalysisManager  # noqa: F401, F403

        with pytest.warns(
            UserWarning,
            match="The module responsibleai._managers.explainer_manager "
                  "is deprecated. "
                  "Please use responsibleai.managers.explainer_manager "
                  "instead."):
            from responsibleai._managers.explainer_manager import \
                ExplainerManager  # noqa: F401, F403
