// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CausalAnalysisOptions } from "@responsible-ai/causality";
import { DataAnalysisTabOptions } from "@responsible-ai/dataset-explorer";
import { ErrorAnalysisOptions } from "@responsible-ai/error-analysis";
import { localization } from "@responsible-ai/localization";

import { GlobalTabKeys } from "../../ModelAssessmentEnums";

import { ITabsViewProps } from "./TabsViewProps";

interface IInfo {
  body: string;
  title: string;
}

export function getInfo(
  tabKey: GlobalTabKeys,
  props?: ITabsViewProps,
  errorAnalysisOption?: ErrorAnalysisOptions,
  dataAnalysisOption?: DataAnalysisTabOptions,
  causalAnalysisOption?: CausalAnalysisOptions
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
  } else if (tabKey === GlobalTabKeys.DataAnalysisTab) {
    if (dataAnalysisOption === DataAnalysisTabOptions.ChartView) {
      body = localization.Interpret.DatasetExplorer.helperText;
      title = localization.Interpret.DatasetExplorer.infoTitle;
    } else if (dataAnalysisOption === DataAnalysisTabOptions.TableView) {
      title = localization.ModelAssessment.FeatureImportances.InfoTitle;
      let hasTextImportances = false;
      if (props?.modelExplanationData) {
        hasTextImportances =
          !!props.modelExplanationData[0]?.precomputedExplanations
            ?.textFeatureImportance;
      }
      body = hasTextImportances
        ? localization.ModelAssessment.FeatureImportances.IndividualFeatureText
        : localization.ModelAssessment.FeatureImportances
            .IndividualFeatureTabular;
    }
  } else if (tabKey === GlobalTabKeys.CausalAnalysisTab) {
    if (causalAnalysisOption === CausalAnalysisOptions.Aggregate) {
      body = localization.CausalAnalysis.AggregateView.description;
      title = localization.CausalAnalysis.AggregateView.infoTitle;
    } else if (causalAnalysisOption === CausalAnalysisOptions.Individual) {
      body = localization.CausalAnalysis.IndividualView.description;
      title = localization.CausalAnalysis.IndividualView.infoTitle;
    } else {
      body = localization.CausalAnalysis.TreatmentPolicy.header;
      title = localization.CausalAnalysis.TreatmentPolicy.infoTitle;
    }
  }
  return { body, title };
}
