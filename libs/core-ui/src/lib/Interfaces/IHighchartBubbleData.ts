// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IHighchartBubbleSDKData {
  id: string;
  name: string;
  size: number;
  x: any;
  y: any;
  index_series: number[];
  x_series: any[];
  y_series: any[];
}

export interface IHighchartBubbleData {
  id: string;
  name?: string;
  z: number;
  x: any;
  y: any;
  indexSeries: number[];
  xSeries: any[];
  ySeries: any[];
}
