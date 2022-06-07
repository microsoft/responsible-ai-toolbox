// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IChartColorNames } from "./getHighchartsTheme";

export type {
  Chart as Highchart,
  ChartSelectionContextObject as HighchartSelectionContext
} from "highcharts";

export type HighchartsModuleNames = "heatmap" | "gantt" | "pattern-fill";

export type { IChartColorNames };
