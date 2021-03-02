// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  JointDataset,
  IExplanationModelMetadata,
  WeightVectorOption,
  IGenericChartProps
} from "@responsible-ai/core-ui";
import { Dictionary } from "lodash";

import {
  GlobalTabKeys,
  ViewTypeKeys,
  ErrorAnalysisOptions,
  PredictionTabKeys
} from "../ErrorAnalysisEnums";
import { ErrorCohort } from "../ErrorCohort";
import { IMatrixAreaState, IMatrixFilterState } from "../MatrixFilterState";
import { ITreeViewRendererState } from "../TreeViewState";

export interface IErrorAnalysisDashboardState {
  activeGlobalTab: GlobalTabKeys;
  cohorts: ErrorCohort[];
  customPoints: Array<{ [key: string]: any }>;
  viewType: ViewTypeKeys;
  jointDataset: JointDataset;
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
  selectedCohort: ErrorCohort;
  selectedWhatIfIndex: number | undefined;
  editedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  selectedFeatures: string[];
  treeViewState: ITreeViewRendererState;
  matrixAreaState: IMatrixAreaState;
  matrixFilterState: IMatrixFilterState;
  errorAnalysisOption: ErrorAnalysisOptions;
  selectedWeightVector: WeightVectorOption;
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
}
