// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PredictionType } from "@responsible-ai/fairness";

export interface IFairnessData {
  errorMessage?: string;
  predictionType: PredictionType;
  sensitiveFeatures: { [key: string]: string[] };
  performanceMetrics: string[];
  fairnessMetrics: string[];
  numberOfModels: number;
}
