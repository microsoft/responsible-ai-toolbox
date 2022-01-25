// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IExplanationModelMetadata,
  WeightVectorOption,
  IGenericChartProps,
  ErrorCohort,
  ICohortBasedComponentState
} from "@responsible-ai/core-ui";
import { Dictionary } from "lodash";

import {
  GlobalTabKeys,
  ViewTypeKeys,
  ErrorAnalysisOptions,
  PredictionTabKeys
} from "../ErrorAnalysisEnums";
import { IMatrixAreaState, IMatrixFilterState } from "../MatrixFilterState";

export interface IErrorAnalysisDashboardState
  extends ICohortBasedComponentState {
  activeGlobalTab: GlobalTabKeys;
  customPoints: Array<{ [key: string]: any }>;
  viewType: ViewTypeKeys;
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
  openInfoPanel: boolean;
  openCohortListPanel: boolean;
  openEditCohort: boolean;
  openFeatureList: boolean;
  openMapShift: boolean;
  openSaveCohort: boolean;
  openShiftCohort: boolean;
  openWhatIf: boolean;
  predictionTab: PredictionTabKeys;
  selectedWhatIfIndex: number | undefined;
  editedCohort: ErrorCohort;
  selectedFeatures: string[];
  showMessageBar: boolean;
  matrixAreaState: IMatrixAreaState;
  matrixFilterState: IMatrixFilterState;
  errorAnalysisOption: ErrorAnalysisOptions;
  selectedWeightVector: WeightVectorOption;
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
}
