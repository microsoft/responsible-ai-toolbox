// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorAnalysisOptions } from "@responsible-ai/error-analysis";
import { localization } from "@responsible-ai/localization";

import { GlobalTabKeys } from "../../ModelAssessmentEnums";
import { FeatureImportancesTabOptions } from "../FeatureImportances";

import { ITabsViewProps } from "./TabsViewProps";

interface IInfo {
  body: string;
  title: string;
}

export function getInfo(
  tabKey: GlobalTabKeys,
  props?: ITabsViewProps,
  errorAnalysisOption?: ErrorAnalysisOptions,
  featureImportanceOption?: FeatureImportancesTabOptions
): IInfo {
  let body = "";
  let title = "";
  if (tabKey === GlobalTabKeys.ErrorAnalysisTab) {
    if (errorAnalysisOption === ErrorAnalysisOptions.HeatMap) {
      body = props?.requestMatrix
        ? localization.ErrorAnalysis.MatrixSummary.heatMapDescription
        : localization.ErrorAnalysis.MatrixSummary.heatMapStaticDescription;
      title = localization.ErrorAnalysis.MatrixSummary.heatMapInfoTitle;
    } else {
      body = props?.requestDebugML
        ? localization.ErrorAnalysis.TreeView.treeDescription
        : localization.ErrorAnalysis.TreeView.treeStaticDescription;
      title = localization.ErrorAnalysis.TreeView.treeMapInfoTitle;
    }
  } else if (tabKey === GlobalTabKeys.FeatureImportancesTab) {
    if (
      featureImportanceOption === FeatureImportancesTabOptions.GlobalExplanation
    ) {
      title = localization.Interpret.GlobalTab.infoTitle;
      body = localization.Interpret.GlobalTab.helperText;
    } else {
      title = localization.ModelAssessment.FeatureImportances.InfoTitle;
      body = localization.ModelAssessment.FeatureImportances.IndividualFeature;
    }
  }
  return { body, title };
}
