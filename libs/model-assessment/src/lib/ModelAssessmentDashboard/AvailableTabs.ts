// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { IDropdownOption } from "office-ui-fabric-react";

import { IModelAssessmentDashboardProps } from "./ModelAssessmentDashboardProps";
import { GlobalTabKeys } from "./ModelAssessmentEnums";

export function getAvailableTabs(
  props: IModelAssessmentDashboardProps,
  excludeErrorAnalysis: boolean
): IDropdownOption[] {
  const availableTabs: IDropdownOption[] = [];
  if (
    !excludeErrorAnalysis &&
    (props.requestDebugML || props.errorAnalysisData?.[0]?.tree)
  ) {
    availableTabs.push({
      key: GlobalTabKeys.ErrorAnalysisTab,
      text: localization.ModelAssessment.ComponentNames.ErrorAnalysis
    });
  }

  if (props.dataset.predicted_y) {
    availableTabs.push({
      key: GlobalTabKeys.ModelOverviewTab,
      text: localization.ModelAssessment.ComponentNames.ModelOverview
    });
  }
  availableTabs.push({
    key: GlobalTabKeys.DataExplorerTab,
    text: localization.ModelAssessment.ComponentNames.DataExplorer
  });

  if (props.modelExplanationData && props.modelExplanationData.length > 0) {
    availableTabs.push({
      key: GlobalTabKeys.FeatureImportancesTab,
      text: localization.ModelAssessment.ComponentNames.FeatureImportances
    });
  }

  if (props.counterfactualData && props.counterfactualData.length > 0) {
    availableTabs.push({
      key: GlobalTabKeys.CounterfactualsTab,
      text: localization.ModelAssessment.ComponentNames.Counterfactuals
    });
  }

  if (props.causalAnalysisData && props.causalAnalysisData.length > 0) {
    availableTabs.push({
      key: GlobalTabKeys.CausalAnalysisTab,
      text: localization.ModelAssessment.ComponentNames.CausalAnalysis
    });
  }

  return availableTabs;
}
