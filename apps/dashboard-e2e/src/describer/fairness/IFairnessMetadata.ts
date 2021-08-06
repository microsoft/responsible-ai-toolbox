// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IFairnessMetadata {
  errorMessage?: string;
  predictionType: PredictionType;
  sensitiveFeatures: { [key: string]: string[] };
  performanceMetrics: string[];
  defaultPerformanceMetric: string;
  fairnessMetrics: string[];
  defaultFairnessMetric: string;
  defaultErrorMetric: string;
  numberOfModels: number;
  charts: string[];
}

export enum PredictionTypes {
  BinaryClassification = "binaryClassification",
  BinaryClassificationWithError = "binaryClassificationWithError",
  Regression = "regression",
  Probability = "probability"
}

export type PredictionType =
  | PredictionTypes.BinaryClassification
  | PredictionTypes.BinaryClassificationWithError
  | PredictionTypes.Probability
  | PredictionTypes.Regression;
