// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IConfusionMatrixData {
  confusionMatrix: number[][];
  labels: string[];
  selectedLabels: string[];
}
