// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IHighchartBubbleSDKData {
  id: string;
  name: string;
  size: number;
  x: number;
  y: number;
  index_series: number[];
  x_series: number[];
  y_series: number[];
}

export interface IHighchartBubbleData {
  id: string;
  name: string;
  z: number;
  x: number;
  y: number;
  index_series: number[];
  x_series: number[];
  y_series: number[];
}
