// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ISelectorConfig } from "./NewExplanationDashboard";
import { ChartTypes } from "./ChartTypes";

export interface IGenericChartProps {
  chartType: ChartTypes;
  xAxis: ISelectorConfig;
  yAxis: ISelectorConfig;
  colorAxis?: ISelectorConfig;
  selectedCohortIndex?: number;
}
