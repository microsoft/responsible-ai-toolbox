// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IHighchartBoxData {
  min: number;
  lowerPercentile: number;
  median: number;
  upperPercentile: number;
  max: number;
  mean: number;
  outliers?: number[];
}
