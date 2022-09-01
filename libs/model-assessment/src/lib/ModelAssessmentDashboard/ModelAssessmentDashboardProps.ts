// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IOfficeFabricProps,
  IModelExplanationData,
  ITelemetryEvent,
  IDataset,
  IErrorAnalysisData,
  ICausalAnalysisData,
  ICounterfactualData,
  ICausalWhatIfData,
  IErrorAnalysisTreeNode,
  IErrorAnalysisMatrix,
  IPreBuiltCohort
} from "@responsible-ai/core-ui";
import { IStringsParam } from "@responsible-ai/error-analysis";

export interface IModelAssessmentData {
  dataset: IDataset;
  modelExplanationData?: Array<
    Omit<IModelExplanationData, "method" | "predictedY" | "probabilityY">
  >;
  causalAnalysisData?: ICausalAnalysisData[];
  counterfactualData?: ICounterfactualData[];
  errorAnalysisData?: IErrorAnalysisData[];
  cohortData?: IPreBuiltCohort[];
}

export interface IModelAssessmentDashboardProps
  extends IOfficeFabricProps,
    IModelAssessmentData {
  locale?: string;
  featureFlights?: string[];
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
  ) => Promise<IErrorAnalysisTreeNode[]>;
  requestMatrix?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<IErrorAnalysisMatrix>;
  requestImportances?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestCausalWhatIf?: (
    id: string,
    features: unknown[],
    featureName: string,
    newValue: unknown[],
    target: unknown[],
    abortSignal: AbortSignal
  ) => Promise<ICausalWhatIfData[]>;
  requestExp?: (index: number, abortSignal: AbortSignal) => Promise<any[]>;
  localUrl?: string;

  telemetryHook?: (message: ITelemetryEvent) => void;

  // TODO figure out how to persist starting tab for fairness
  startingTabIndex?: number;
}
