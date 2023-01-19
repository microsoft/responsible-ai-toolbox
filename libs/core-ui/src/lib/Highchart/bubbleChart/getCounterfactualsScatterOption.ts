// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Point } from "highcharts";

import { IGenericChartProps } from "../../util/IGenericChartProps";
import { JointDataset } from "../../util/JointDataset";
import { IHighchartsConfig } from "../IHighchartsConfig";

import { ICustomData } from "./buildScatterTemplate";
import { getCounterfactualsScatter } from "./getCounterfactualsScatter";

export interface IScatterPoint extends Point {
  customData: ICustomData;
}

export function getCounterfactualsScatterOption(
  xSeries: number[],
  ySeries: number[],
  indexSeries: number[],
  chartProps: IGenericChartProps,
  jointData: JointDataset,
  selectedPointsIndexes: number[],
  customPoints?: Array<{ [key: string]: any }>,
  isCounterfactualsDataLoading?: boolean,
  showColorAxis?: boolean,
  useDifferentColorForScatterPoints?: boolean,
  selectPointFromChartLargeData?: (data: IScatterPoint) => void
): IHighchartsConfig {
  const dataSeries = getCounterfactualsScatter(
    xSeries,
    ySeries,
    indexSeries,
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
        cursor: isCounterfactualsDataLoading ? "wait" : "pointer",
        lineWidth: 0,
        point: {
          events: {
            click(): void {
              if (!isCounterfactualsDataLoading) {
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
