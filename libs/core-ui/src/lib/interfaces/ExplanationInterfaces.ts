// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IExplanationDashboardData {
  modelInformation: IModelInformation;
  dataSummary: IDatasetSummary;
  testData?: any[][];
  predictedY?: number[];
  probabilityY?: number[][];
  trueY?: number[];
  explanationMethod?: string;

  precomputedExplanations?: IPrecomputedExplanations;
}

export interface IModelInformation {
  modelClass: "Tree" | "EBM" | "blackbox";
  method?: "classifier" | "regressor";
}

export interface IDatasetSummary {
  featureNames?: string[];
  classNames?: string[];
  categoricalMap?: { [key: number]: string[] };
}

export interface IPrecomputedExplanations {
  localFeatureImportance?:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance;
  globalFeatureImportance?:
    | IMultiClassGlobalFeatureImportance
    | ISingleClassGlobalFeatureImportance;
  ebmGlobalExplanation?: IEBMGlobalExplanation;
  customVis?: string;
}

export interface IEBMGlobalExplanation {
  feature_list: IBoundedCoordinates[];
}

export interface IMultiClassLocalFeatureImportance {
  scores: number[][][];
  intercept?: number[];
}

export interface ISingleClassLocalFeatureImportance {
  scores: number[][];
  intercept?: number;
}

export interface IMultiClassGlobalFeatureImportance {
  scores: number[][];
  intercept?: number[];
}

export interface ISingleClassGlobalFeatureImportance {
  scores: number[];
  intercept?: number;
}

export interface IBoundedCoordinates {
  type: string;
  names: number[] | string[];
  scores: number[] | number[][];
  scores_range?: number[];
  upper_bounds?: number[] | number[][];
  lower_bounds?: number[] | number[][];
}
