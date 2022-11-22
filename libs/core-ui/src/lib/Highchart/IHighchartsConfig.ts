// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as Highcharts from "highcharts";

import { IColorNames } from "../util/FluentUIStyles";

export interface IHighchartsCustomConfig {
  /**
   * Max color name for color axis. Min is white.
   */
  colorAxisMaxColor?: keyof IColorNames;

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
   * An explicit minimum height for the chart.
   */
  minHeight?: number | string | null;

  /**
   * An explicit minimum width for the chart.
   */
  minWidth?: number | string | null;

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
  onSortColors?(colors: Array<keyof IColorNames>): Array<keyof IColorNames>;
}

export interface IHighchartsConfig extends Highcharts.Options {
  custom?: IHighchartsCustomConfig;
}
