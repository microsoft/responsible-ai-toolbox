// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IOfficeFabricProps,
  IModelExplanationData,
  ITelemetryMessage,
  IDataset,
  IErrorAnalysisConfig,
  ICausalAnalysisData,
  ICounterfactualData
} from "@responsible-ai/core-ui";
import { IRequestNode, IStringsParam } from "@responsible-ai/error-analysis";

export interface IModelAssessmentData {
  dataset: IDataset;
  modelExplanationData?: Array<
    Omit<IModelExplanationData, "method" | "predictedY" | "probabilityY">
  >;
  causalAnalysisData?: ICausalAnalysisData[];
  counterfactualData?: ICounterfactualData[];
  errorAnalysisConfig?: IErrorAnalysisConfig[];
}

export interface IModelAssessmentDashboardProps
  extends IOfficeFabricProps,
    IModelAssessmentData {
  locale?: string;
  stringParams?: IStringsParam;
  classDimension?: 1 | 2 | 3;
  requestPredictions?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestLocalFeatureExplanations?: (
    request: any[],
    abortSignal: AbortSignal,
    explanationAlgorithm?: string
  ) => Promise<any[]>;
  requestDebugML?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<IRequestNode[]>;
  requestMatrix?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  requestImportances?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  localUrl?: string;

  telemetryHook?: (message: ITelemetryMessage) => void;

  // TODO figure out how to persist starting tab for fairness
  startingTabIndex?: number;
}
