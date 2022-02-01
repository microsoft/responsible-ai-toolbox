// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationModelMetadata,
  IGenericChartProps,
  WeightVectorOption,
  ICohortBasedComponentState
} from "@responsible-ai/core-ui";
import { ErrorAnalysisOptions } from "@responsible-ai/error-analysis";
import { Dictionary } from "lodash";

import { GlobalTabKeys } from "./ModelAssessmentEnums";

export interface IModelAssessmentDashboardState
  extends ICohortBasedComponentState {
  activeGlobalTabs: IModelAssessmentDashboardTab[];
  customPoints: Array<{ [key: string]: any }>;
  modelMetadata: IExplanationModelMetadata;
  modelChartConfig?: IGenericChartProps;
  dataChartConfig?: IGenericChartProps;
  whatIfChartConfig?: IGenericChartProps;
  dependenceProps?: IGenericChartProps;
  globalImportanceIntercept: number[];
  globalImportance: number[][];
  importances: number[];
  isGlobalImportanceDerivedFromLocal: boolean;
  sortVector?: number[];
  editingCohortIndex?: number;
  mapShiftErrorAnalysisOption: ErrorAnalysisOptions;
  mapShiftVisible: boolean;
  selectedWhatIfIndex: number | undefined;
  selectedFeatures: string[];
  errorAnalysisOption: ErrorAnalysisOptions;
  selectedWeightVector: WeightVectorOption;
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
  saveCohortVisible: boolean;
}

export interface IModelAssessmentDashboardTab {
  key: GlobalTabKeys;
  dataCount: number;
  name: string;
}
