// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorAnalysisOptions } from "@responsible-ai/error-analysis";
import { localization } from "@responsible-ai/localization";

import { GlobalTabKeys } from "../../ModelAssessmentEnums";
import { FeatureImportancesTabOptions } from "../FeatureImportances";

import { ITabsViewProps } from "./TabsViewProps";

export function getInfo(
  tabKey: GlobalTabKeys,
  props?: ITabsViewProps,
  errorAnalysisOption?: ErrorAnalysisOptions,
  featureImportanceOption?: FeatureImportancesTabOptions
): string[] {
  let infoBody = "";
  let infoTitle = "";
  if (tabKey === GlobalTabKeys.ErrorAnalysisTab) {
    if (errorAnalysisOption === ErrorAnalysisOptions.HeatMap) {
      infoBody = props?.requestMatrix
        ? localization.ErrorAnalysis.MatrixSummary.heatMapDescription
        : localization.ErrorAnalysis.MatrixSummary.heatMapStaticDescription;
      infoTitle = localization.ErrorAnalysis.MatrixSummary.heatMapInfoTitle;
    } else {
      infoBody = props?.requestDebugML
        ? localization.ErrorAnalysis.TreeView.treeDescription
        : localization.ErrorAnalysis.TreeView.treeStaticDescription;
      infoTitle = localization.ErrorAnalysis.TreeView.treeMapInfoTitle;
    }
  } else if (tabKey === GlobalTabKeys.FeatureImportancesTab) {
    if (
      featureImportanceOption === FeatureImportancesTabOptions.GlobalExplanation
    ) {
      infoTitle = localization.Interpret.GlobalTab.infoTitle;
      infoBody = localization.Interpret.GlobalTab.helperText;
    } else {
      infoTitle = localization.ModelAssessment.FeatureImportances.InfoTitle;
      infoBody =
        localization.ModelAssessment.FeatureImportances.IndividualFeature;
    }
  }
  return [infoBody, infoTitle];
}
