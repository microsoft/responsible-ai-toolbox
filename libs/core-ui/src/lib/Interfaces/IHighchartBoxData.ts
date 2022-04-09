// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IHighchartBoxData {
  min: number;
  lowerQuartile: number;
  median: number;
  upperQuartile: number;
  max: number;
  mean: number;
  outliers: number[];
  upperFence: number;
  lowerFence: number;
  x?: number;
}
