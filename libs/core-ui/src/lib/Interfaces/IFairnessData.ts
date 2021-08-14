// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Never } from "../util/Never";

import { IDatasetSummary } from "./IDataset";

export enum PredictionTypes {
  BinaryClassification = "binaryClassification",
  Regression = "regression",
  Probability = "probability"
}

export type PredictionType =
  | PredictionTypes.BinaryClassification
  | PredictionTypes.Probability
  | PredictionTypes.Regression;

export interface IBounds {
  lower: number;
  upper: number;
}

export interface IMetricResponse {
  global: number;
  bins: number[];
  bounds?: IBounds;
  binBounds?: IBounds[];
}

export interface IMetricRequest {
  metricKey: string;
  binVector: number[];
  modelIndex: number;
  errorBarsEnabled?: boolean;
}

export interface IFairnessResponse {
  overall: number;
  bounds?: IBounds;
}

export interface IFeatureBinMeta {
  binVector: number[];
  binLabels: string[];
  // this could also be held in a 'features name' array separate with the same length.
  featureBinName?: string;
}

export interface ICustomMetric {
  name?: string;
  description?: string;
  id: string;
}

export interface IFairnessBaseData {
  dataSummary?: IDatasetSummary;
  // One array per each model;
  predictedY: number[][];
  modelNames?: string[];
  trueY: number[];
  testData?: any[][];
  errorBarsEnabled?: boolean;
}
export interface IPreComputedData {
  precomputedMetrics: Array<Array<{ [key: string]: IMetricResponse }>>;
  precomputedFeatureBins: IFeatureBinMeta[];
  predictionType: PredictionTypes;
  customMetrics?: ICustomMetric[];
}
export type IRunTimeData = Never<IPreComputedData> & {
  testData: any[][];
};
export type IPreComputedFairnessData = IFairnessBaseData & IPreComputedData;
export type IRunTimeFairnessData = IFairnessBaseData & IRunTimeData;

export type IFairnessData = IPreComputedFairnessData | IRunTimeFairnessData;
