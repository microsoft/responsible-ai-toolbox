// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ITextExplanationDashboardData {
  classNames: string[];
  localExplanations: number[][] | number[][][];
  prediction: number[];
  text: string[];
  baseValues?: number[][];
  predictedY?: number[] | number[][] | string[] | string | number;
  trueY?: number[] | number[][] | string[] | string | number;
}
