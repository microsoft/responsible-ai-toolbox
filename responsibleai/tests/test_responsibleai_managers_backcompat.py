# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.


class TestResponsibleaiManagersBackCompat:
    def test_responsibleai_managers_back_compat(self):
        from responsibleai._managers.base_manager import BaseManager

        from responsibleai._managers.causal_manager import CausalManager

        from responsibleai._managers.counterfactual_manager import CounterfactualConstants
        from responsibleai._managers.counterfactual_manager import CounterfactualConfig
        from responsibleai._managers.counterfactual_manager import CounterfactualManager

        from responsibleai._managers.error_analysis_manager import ErrorAnalysisConfig
        from responsibleai._managers.error_analysis_manager import ErrorAnalysisManager

        from responsibleai._managers.explainer_manager import ExplainerManager
