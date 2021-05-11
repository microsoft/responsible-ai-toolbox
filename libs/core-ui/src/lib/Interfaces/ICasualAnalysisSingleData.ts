// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICasualAnalysisSingleData {
  name: string[];
  point: number[][][];
  pValue: number[][][];
  stderr: number[][][];
  zstat: number[][][];
  ciLower: number[][][];
  ciUpper: number[][][];
}
