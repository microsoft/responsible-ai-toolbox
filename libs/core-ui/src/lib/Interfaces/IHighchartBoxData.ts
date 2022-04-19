// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IHighchartBoxData {
  low: number;
  median: number;
  high: number;
  outliers: number[];
  q1: number;
  q3: number;
  x?: number;
}
