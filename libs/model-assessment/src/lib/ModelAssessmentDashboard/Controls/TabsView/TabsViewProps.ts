// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
  IExplanationModelMetadata
} from "@responsible-ai/core-ui";
import { IStringsParam } from "@responsible-ai/error-analysis";
import { IDropdownOption } from "office-ui-fabric-react";

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
  requestPredictions?: (
    request: any[],
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
