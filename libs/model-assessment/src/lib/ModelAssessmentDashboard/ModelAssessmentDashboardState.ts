// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationModelMetadata,
  IGenericChartProps,
  WeightVectorOption,
  ICohortBasedComponentState
} from "@responsible-ai/core-ui";
import {
  ErrorAnalysisOptions,
  PredictionTabKeys,
  ITreeViewRendererState,
  IMatrixAreaState,
  IMatrixFilterState
} from "@responsible-ai/error-analysis";
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
  predictionTab: PredictionTabKeys;
  selectedWhatIfIndex: number | undefined;
  selectedFeatures: string[];
  treeViewState: ITreeViewRendererState;
  matrixAreaState: IMatrixAreaState;
  matrixFilterState: IMatrixFilterState;
  errorAnalysisOption: ErrorAnalysisOptions;
  selectedWeightVector: WeightVectorOption;
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
}

export interface IModelAssessmentDashboardTab {
  key: GlobalTabKeys;
  dataCount: number;
}
