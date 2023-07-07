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
  IHighchartBoxData,
  IPreBuiltCohort,
  IHighchartBubbleSDKClusterData,
  ILocalExplanations
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
  requestBoxPlotDistribution?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<IHighchartBoxData>;
  requestGlobalCausalEffects?: (
    id: string,
    filter: unknown[],
    compositeFilter: unknown[],
    abortSignal: AbortSignal
  ) => Promise<ICausalAnalysisData>;
  requestGlobalCausalPolicy?: (
    id: string,
    filter: unknown[],
    compositeFilter: unknown[],
    abortSignal: AbortSignal
  ) => Promise<ICausalAnalysisData>;
  requestDatasetAnalysisBarChart?: (
    filter: unknown[],
    compositeFilter: unknown[],
    columnNameX: string,
    treatColumnXAsCategorical: boolean,
    columnNameY: string,
    treatColumnYAsCategorical: boolean,
    numBins: number,
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestDatasetAnalysisBoxChart?: (
    filter: unknown[],
    compositeFilter: unknown[],
    columnNameX: string,
    columnNameY: string,
    numBins: number,
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestGlobalExplanations?: (
    filter: unknown[],
    compositeFilter: unknown[],
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestMetrics?: (
    filter: unknown[],
    compositeFilter: unknown[],
    metric: string,
    abortSignal: AbortSignal
  ) => Promise<any>;
  requestExp?: (
    index: number | number[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestObjectDetectionMetrics?: (
    selectionIndexes: number[][],
    aggregateMethod: string,
    className: string,
    iouThreshold: number,
    objectDetectionCache: Map<string, [number, number, number]>,
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestQuestionAnsweringMetrics?: (
    selectionIndexes: number[][],
    questionAnsweringCache: Map<
      string,
      [number, number, number, number, number, number]
    >,
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestBubblePlotData?: (
    filter: unknown[],
    compositeFilter: unknown[],
    xAxis: string,
    yAxis: string,
    abortSignal: AbortSignal
  ) => Promise<IHighchartBubbleSDKClusterData>;
  requestLocalCounterfactuals?: (
    counterfactualsId: string,
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<ICounterfactualData>;
  requestLocalExplanations?: (
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<ILocalExplanations>;
  requestLocalCausalEffects?: (
    causalId: string,
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<ICausalAnalysisData>;
  requestTestDataRow?: (
    absoluteIndex: number,
    abortSignal: AbortSignal
  ) => Promise<any>;
  localUrl?: string;
  requestForecast?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestSplinePlotDistribution?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>;
  telemetryHook?: (message: ITelemetryEvent) => void;

  // TODO figure out how to persist starting tab for fairness
  startingTabIndex?: number;
}
