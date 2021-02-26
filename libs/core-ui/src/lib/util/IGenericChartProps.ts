// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ChartTypes {
  Scatter = "scatter",
  Histogram = "histogram",
  Box = "box",
  Bar = "bar"
}

export interface IGenericChartProps {
  chartType: ChartTypes;
  xAxis: ISelectorConfig;
  yAxis: ISelectorConfig;
  colorAxis?: ISelectorConfig;
  selectedCohortIndex?: number;
}

export interface ISelectorConfig {
  property: string;
  index?: number;
  options: {
    dither?: boolean;
    // this is only used in the ambiguous case of numeric values on color axis for scatter chart, when binned or unbinned are valid
    bin?: boolean;
  };
}
