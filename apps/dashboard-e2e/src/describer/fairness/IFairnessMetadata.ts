// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PredictionType } from "@responsible-ai/fairness";

export interface IFairnessMetadata {
  errorMessage?: string;
  predictionType: PredictionType;
  sensitiveFeatures: { [key: string]: string[] };
  performanceMetrics: string[];
  fairnessMetrics: string[];
  numberOfModels: number;
  charts: string[];
}
