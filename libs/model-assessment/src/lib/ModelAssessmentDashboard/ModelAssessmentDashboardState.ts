// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationModelMetadata,
  IGenericChartProps,
  ICohortBasedComponentState,
  ModelTypes
} from "@responsible-ai/core-ui";
import { ErrorAnalysisOptions } from "@responsible-ai/error-analysis";
import { IColumnRange } from "@responsible-ai/mlchartlib";

import { GlobalTabKeys } from "./ModelAssessmentEnums";

export interface IModelAssessmentDashboardState
  extends ICohortBasedComponentState {
  activeGlobalTabs: IModelAssessmentDashboardTab[];
  customPoints: Array<{ [key: string]: any }>;
  columnRanges?: {
    [key: string]: IColumnRange;
  };
  modelMetadata: IExplanationModelMetadata;
  modelType: ModelTypes;
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
  onAddMessage: string;
}

export interface IModelAssessmentDashboardTab {
  key: GlobalTabKeys;
  dataCount: number;
  name: string;
}
