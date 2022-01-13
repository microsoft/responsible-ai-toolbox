# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


class TestResponsibleaiManagersBackCompat:
    def test_responsibleai_managers_back_compat(self):
        from responsibleai._managers.base_manager import \
            BaseManager  # noqa: F401, F403
        from responsibleai._managers.causal_manager import \
            CausalManager  # noqa: F401, F403
        from responsibleai._managers.counterfactual_manager import \
            CounterfactualConfig  # noqa: F401, F403
        from responsibleai._managers.counterfactual_manager import \
            CounterfactualConstants  # noqa: F401, F403
        from responsibleai._managers.counterfactual_manager import \
            CounterfactualManager  # noqa: F401, F403
        from responsibleai._managers.error_analysis_manager import \
            ErrorAnalysisConfig  # noqa: F401, F403
        from responsibleai._managers.error_analysis_manager import \
            ErrorAnalysisManager  # noqa: F401, F403
        from responsibleai._managers.explainer_manager import \
            ExplainerManager  # noqa: F401, F403
