// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { IModelAssessmentDashboardProps } from "@responsible-ai/model-assessment";
import { IDropdownOption } from "office-ui-fabric-react";

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
      key: GlobalTabKeys.ModelStatisticsTab,
      text: localization.ModelAssessment.ComponentNames.ModelStatistics
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

  if (props.causalAnalysisData && props.causalAnalysisData.length > 0) {
    availableTabs.push({
      key: GlobalTabKeys.CausalAnalysisTab,
      text: localization.ModelAssessment.ComponentNames.CausalAnalysis
    });
  }

  if (props.counterfactualData && props.counterfactualData.length > 0) {
    availableTabs.push({
      key: GlobalTabKeys.CounterfactualsTab,
      text: localization.ModelAssessment.ComponentNames.Counterfactuals
    });
  }
  return availableTabs;
}
