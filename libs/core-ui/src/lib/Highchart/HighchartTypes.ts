// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IChartColorNames } from "./getHighchartsTheme";

export type {
  Chart as Highchart,
  ChartSelectionContextObject as HighchartSelectionContext
} from "highcharts";

export interface IHighchartsCustomConfig {
  /**
   * Max color name for color axis. Min is white.
   */
  colorAxisMaxColor?: keyof IChartColorNames;

  /**
   * Disables chart update and rerenders chart when parent component
   * of the chart is rerendered
   */
  disableUpdate?: boolean;

  /**
   * Disables zooming for chart. Default zooming behavior is "xy".
   * To keep zooming enabled but specify a different value then default,
   * use "chartOptions.chart.zoomType"
   */
  disableZoom?: boolean;

  /**
   * If set true, makes chart background transparent. Default behavior is making
   * chart background color same as theme background color
   */
  transparentBackground?: boolean;

  /**
   * Gets called when parent component is rerendered and chart is updated
   *
   * @param chart Chart reference
   */
  onUpdate?(chart: Highcharts.Chart): void;

  /**
   * Delegate which enables to change the order of the colors.
   * This is the current order:
   *      primary
   *      blueMid
   *      teal
   *      purple
   *      purpleLight
   *      magentaDark
   *      magentaLight
   *      black
   *      orangeLighter
   *      redDark
   *      red
   *      neutral
   *
   * @param colors Currently sorted colors
   * @returns New sorted colors
   */
  onSortColors?(
    colors: Array<keyof IChartColorNames>
  ): Array<keyof IChartColorNames>;
}

export interface IHighchartsConfig extends Highcharts.Options {
  custom?: IHighchartsCustomConfig;
}

export type HighchartsModuleNames = "heatmap";

export type { IChartColorNames };
