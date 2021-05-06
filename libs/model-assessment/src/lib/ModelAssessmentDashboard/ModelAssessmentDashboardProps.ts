// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IOfficeFabricProps,
  IModelExplanationData,
  IMetricRequest,
  IMetricResponse,
  ICohortBasedComponentProps,
  ITelemetryMessage,
  ICasualAnalysisData
} from "@responsible-ai/core-ui";
import { IStringsParam } from "@responsible-ai/error-analysis";

export interface IModelAssessmentDashboardProps
  extends IOfficeFabricProps,
    ICohortBasedComponentProps {
  locale?: string;
  stringParams?: IStringsParam;

  modelExplanationData: IModelExplanationData;
  casualAnalysisData: ICasualAnalysisData;

  requestPredictions?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestLocalFeatureExplanations?: (
    request: any[],
    abortSignal: AbortSignal,
    explanationAlgorithm?: string
  ) => Promise<any[]>;
  requestDebugML?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  requestMatrix?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  requestImportances?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestMetrics?: (
    request: IMetricRequest,
    abortSignal?: AbortSignal
  ) => Promise<IMetricResponse>;
  localUrl: string;

  telemetryHook?: (message: ITelemetryMessage) => void;

  // TODO figure out how to persist starting tab for fairness
  startingTabIndex?: number;

  supportedBinaryClassificationPerformanceKeys: string[];
  supportedRegressionPerformanceKeys: string[];
  supportedProbabilityPerformanceKeys: string[];
}
