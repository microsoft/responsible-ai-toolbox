// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IModelAssessmentDashboardProps,
  IModelAssessmentData
} from "@responsible-ai/model-assessment";

import { IAppConfig } from "./config";

export interface IModelAssessmentProps {
  config: IAppConfig;
  modelData: IModelAssessmentData;
}

export type CallbackType = Pick<
  IModelAssessmentDashboardProps,
  | "requestExp"
  | "requestObjectDetectionMetrics"
  | "requestPredictions"
  | "requestQuestionAnsweringMetrics"
  | "requestDebugML"
  | "requestMatrix"
  | "requestImportances"
  | "requestCausalWhatIf"
  | "requestBoxPlotDistribution"
  | "requestDatasetAnalysisBarChart"
  | "requestDatasetAnalysisBoxChart"
  | "requestForecast"
  | "requestGlobalCausalEffects"
  | "requestGlobalCausalPolicy"
  | "requestGlobalExplanations"
  | "requestBubblePlotData"
  | "requestLocalCounterfactuals"
  | "requestLocalExplanations"
  | "requestMetrics"
  | "requestLocalCausalEffects"
  | "requestSplinePlotDistribution"
  | "requestTestDataRow"
>;
