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

// Below interface is used by UI to render highchart data. size sent by sdk is used as z to decide the size of the bubble. Since name is sent as null by sdk, it is made optional on UI side and is not used for now in plot data.
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
