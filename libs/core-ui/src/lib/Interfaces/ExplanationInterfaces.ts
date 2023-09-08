// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDatasetSummary } from "./IDataset";
import { Method, ModelClass } from "./IModelExplanationData";

// TODO replace all of these with classes IDataset and IModelExplanationData

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

export interface ISerializedExplanationData {
  explanationMethod?: string;
  predictedY?: any[];
  trainingData: any[][];
  isClassifier: boolean;
  trueY?: any[];
  localExplanations:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance;
  featureNames: string[];
  classNames: string[];
  probabilityY?: number[][];
  categoricalMap?: { [key: number]: string[] };
}

export interface IModelInformation {
  modelClass: ModelClass;
  method?: Method;
}

// TODO replace all of the above with classes IDataset and IModelExplanationData

export type IGlobalFeatureImportance =
  | IMultiClassGlobalFeatureImportance
  | ISingleClassGlobalFeatureImportance;

export interface IPrecomputedExplanations {
  localFeatureImportance?:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance;
  globalFeatureImportance?: IGlobalFeatureImportance;
  textFeatureImportance?: ITextFeatureImportance[];
  ebmGlobalExplanation?: IEBMGlobalExplanation;
  customVis?: string;
}

export interface ITextFeatureImportance {
  text: string[];
  localExplanations: number[][] | number[][][];
  baseValues?: number[][];
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
  featureNames?: string[];
}

export interface IMultiClassGlobalFeatureImportance {
  scores: number[][];
  intercept?: number[];
  featureNames?: string[];
}

export interface ISingleClassGlobalFeatureImportance {
  scores: number[];
  intercept?: number;
  featureNames?: string[];
}

export interface IBoundedCoordinates {
  type: string;
  names: number[] | string[];
  scores: number[] | number[][];
  scores_range?: number[];
  upper_bounds?: number[] | number[][];
  lower_bounds?: number[] | number[][];
}
