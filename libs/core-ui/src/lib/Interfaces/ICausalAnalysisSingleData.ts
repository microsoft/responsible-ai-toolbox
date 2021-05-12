// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICausalAnalysisSingleData {
  name: string[];
  point: number[][][];
  pValue: number[][][];
  stderr: number[][][];
  zstat: number[][][];
  ciLower: number[][][];
  ciUpper: number[][][];
}
