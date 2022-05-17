// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationModelMetadata,
  IGenericChartProps,
  ICohortBasedComponentState
} from "@responsible-ai/core-ui";
import { ErrorAnalysisOptions } from "@responsible-ai/error-analysis";

import { GlobalTabKeys } from "./ModelAssessmentEnums";

export interface IModelAssessmentDashboardState
  extends ICohortBasedComponentState {
  activeGlobalTabs: IModelAssessmentDashboardTab[];
  customPoints: Array<{ [key: string]: any }>;
  modelMetadata: IExplanationModelMetadata;
  modelChartConfig?: IGenericChartProps;
  dataChartConfig?: IGenericChartProps;
  dependenceProps?: IGenericChartProps;
  globalImportanceIntercept: number[];
  globalImportance: number[][];
  isGlobalImportanceDerivedFromLocal: boolean;
  sortVector?: number[];
  editingCohortIndex?: number;
  selectedWhatIfIndex: number | undefined;
  errorAnalysisOption: ErrorAnalysisOptions;
  saveCohortVisible: boolean;
}

export interface IModelAssessmentDashboardTab {
  key: GlobalTabKeys;
  dataCount: number;
  name: string;
}
