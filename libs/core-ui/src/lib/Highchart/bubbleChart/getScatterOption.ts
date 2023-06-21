// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { Point } from "highcharts";

import { IGenericChartProps } from "../../util/IGenericChartProps";
import { JointDataset } from "../../util/JointDataset";
import { IHighchartsConfig } from "../IHighchartsConfig";

import { ICustomData } from "./buildScatterTemplate";
import { IClusterData } from "./ChartUtils";
import { getScatterPlot } from "./getScatterPlot";

export interface IScatterPoint extends Point {
  customData: ICustomData;
}

export function getScatterOption(
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
  const dataSeries = getScatterPlot(
    clusterData,
    jointData,
    selectedPointsIndexes,
    chartProps,
    customPoints,
    showColorAxis,
    useDifferentColorForScatterPoints
  );
  const theme = getTheme();

  return {
    chart: {
      backgroundColor: theme.semanticColors.bodyBackground,
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
