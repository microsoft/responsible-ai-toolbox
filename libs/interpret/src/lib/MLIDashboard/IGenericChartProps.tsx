// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ChartTypes } from "./ChartTypes";
import { ISelectorConfig } from "./NewExplanationDashboard";

export interface IGenericChartProps {
  chartType: ChartTypes;
  xAxis: ISelectorConfig;
  yAxis: ISelectorConfig;
  colorAxis?: ISelectorConfig;
  selectedCohortIndex?: number;
}
