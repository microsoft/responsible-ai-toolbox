// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IDropdownOption } from "office-ui-fabric-react";

import { IModelAssessmentDashboardProps } from "./ModelAssessmentDashboardProps";
import { GlobalTabKeys } from "./ModelAssessmentEnums";

export function getAvailableTabs(
  props: IModelAssessmentDashboardProps,
  jointDataset: JointDataset,
  excludeErrorAnalysis: boolean
): IDropdownOption[] {
  const availableTabs: IDropdownOption[] = [];
  if (
    !excludeErrorAnalysis &&
    props.requestDebugML &&
    props.requestMatrix &&
    props.requestImportances
  ) {
    availableTabs.push({
      key: GlobalTabKeys.ErrorAnalysisTab,
      text: localization.ModelAssessment.ComponentNames.ErrorAnalysis
    });
  }

  if (jointDataset.hasPredictedY && jointDataset.hasTrueY) {
    availableTabs.push({
      key: GlobalTabKeys.ModelStatisticsTab,
      text: localization.ModelAssessment.ComponentNames.ModelStatistics
    });
  }

  if (jointDataset.hasDataset) {
    availableTabs.push({
      key: GlobalTabKeys.DataExplorerTab,
      text: localization.ModelAssessment.ComponentNames.DataExplorer
    });
  }

  if (
    props.requestPredictions &&
    props.requestImportances &&
    props.modelExplanationData &&
    props.modelExplanationData.length > 0
  ) {
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
