// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Point } from "highcharts";

import { IGenericChartProps } from "../../util/IGenericChartProps";
import { JointDataset } from "../../util/JointDataset";
import { IHighchartsConfig } from "../IHighchartsConfig";

import { ICustomData } from "./buildScatterTemplate";
import { IClusterData } from "./ChartUtils";
import { getScatterPlot, getScatterPlotNew } from "./getScatterPlot";

export interface IScatterPoint extends Point {
  customData: ICustomData;
}

export function getScatterOption(
  xSeries: number[],
  ySeries: number[],
  indexSeries: number[],
  chartProps: IGenericChartProps,
  jointData: JointDataset,
  selectedPointsIndexes: number[],
  customPoints?: Array<{ [key: string]: any }>,
  isScatterPlotDataLoading?: boolean,
  showColorAxis?: boolean,
  useDifferentColorForScatterPoints?: boolean,
  xMap?: { [key: number]: string },
  yMap?: { [key: number]: string },
  selectPointFromChartLargeData?: (data: IScatterPoint) => void
): IHighchartsConfig {
  const dataSeries = getScatterPlot(
    xSeries,
    ySeries,
    indexSeries,
    jointData,
    selectedPointsIndexes,
    chartProps,
    customPoints,
    showColorAxis,
    useDifferentColorForScatterPoints,
    xMap,
    yMap
  );

  return {
    chart: {
      type: "scatter",
      zoomType: "xy"
    },
    plotOptions: {
      scatter: {
        tooltip: {
          headerFormat: "",
          pointFormat: "{point.customData.template}"
        }
      },
      series: {
        cursor: isScatterPlotDataLoading ? "wait" : "pointer",
        lineWidth: 0,
        point: {
          events: {
            click(): void {
              if (!isScatterPlotDataLoading) {
                if (selectPointFromChartLargeData === undefined) {
                  return;
                }
                selectPointFromChartLargeData(this as IScatterPoint);
              }
            }
          }
        },
        states: {
          hover: {
            lineWidthPlus: 0
          }
        },
        turboThreshold: 0
      }
    },
    series: dataSeries,
    tooltip: {
      shared: true
    },
    xAxis: {
      type: chartProps?.xAxis.type
    },
    yAxis: {
      type: chartProps?.yAxis.type
    }
  };
}

export function getScatterOptionNew(
  clusterData: IClusterData,
  chartProps: IGenericChartProps,
  jointData: JointDataset,
  selectedPointsIndexes: number[],
  customPoints?: Array<{ [key: string]: any }>,
  isScatterPlotDataLoading?: boolean,
  showColorAxis?: boolean,
  useDifferentColorForScatterPoints?: boolean,
  selectPointFromChartLargeData?: (data: IScatterPoint) => void
): IHighchartsConfig {
  const dataSeries = getScatterPlotNew(
    clusterData,
    jointData,
    selectedPointsIndexes,
    chartProps,
    customPoints,
    showColorAxis,
    useDifferentColorForScatterPoints
  );

  return {
    chart: {
      type: "scatter",
      zoomType: "xy"
    },
    plotOptions: {
      scatter: {
        tooltip: {
          headerFormat: "",
          pointFormat: "{point.customData.template}"
        }
      },
      series: {
        cursor: isScatterPlotDataLoading ? "wait" : "pointer",
        lineWidth: 0,
        point: {
          events: {
            click(): void {
              if (!isScatterPlotDataLoading) {
                if (selectPointFromChartLargeData === undefined) {
                  return;
                }
                selectPointFromChartLargeData(this as IScatterPoint);
              }
            }
          }
        },
        states: {
          hover: {
            lineWidthPlus: 0
          }
        },
        turboThreshold: 0
      }
    },
    series: dataSeries,
    tooltip: {
      shared: true
    },
    xAxis: {
      type: chartProps?.xAxis.type
    },
    yAxis: {
      type: chartProps?.yAxis.type
    }
  };
}
