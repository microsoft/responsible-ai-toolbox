// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from "@fluentui/react";
import {
  ErrorCohort,
  CohortSource,
  IModelExplanationData,
  IDataset,
  IErrorAnalysisData,
  ICausalAnalysisData,
  ICounterfactualData,
  IErrorAnalysisTreeNode,
  IErrorAnalysisMatrix,
  IPreBuiltCohort,
  JointDataset,
  IFilter,
  ICompositeFilter,
  MetricCohortStats,
  IExplanationModelMetadata,
  ITelemetryEvent
} from "@responsible-ai/core-ui";
import { IStringsParam } from "@responsible-ai/error-analysis";

import { IModelAssessmentDashboardTab } from "../../ModelAssessmentDashboardState";
import { GlobalTabKeys } from "../../ModelAssessmentEnums";

export interface ITabsViewProps {
  modelExplanationData?: Array<
    Omit<IModelExplanationData, "method" | "predictedY" | "probabilityY">
  >;
  causalAnalysisData?: ICausalAnalysisData[];
  counterfactualData?: ICounterfactualData[];
  errorAnalysisData?: IErrorAnalysisData[];
  cohortData?: IPreBuiltCohort[];
  cohorts: ErrorCohort[];
  jointDataset: JointDataset;
  activeGlobalTabs: IModelAssessmentDashboardTab[];
  baseCohort: ErrorCohort;
  selectedCohort: ErrorCohort;
  dataset: IDataset;
  onClearCohortSelectionClick: () => void;
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

  requestPredictions?: (
    request: any[],
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
  requestDebugML?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<IErrorAnalysisTreeNode[]>;
  requestImportances?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  requestMatrix?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<IErrorAnalysisMatrix>;
  stringParams?: IStringsParam;
  telemetryHook?: (message: ITelemetryEvent) => void;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: CohortSource,
    cells: number,
    cohortStats: MetricCohortStats | undefined
  ) => void;
  setSaveCohortVisible: () => void;
  setSelectedCohort: (cohort: ErrorCohort) => void;
  modelMetadata: IExplanationModelMetadata;
  addTabDropdownOptions: IDropdownOption[];
  addTab: (index: number, tab: GlobalTabKeys) => void;
}
