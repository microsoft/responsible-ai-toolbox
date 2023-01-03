// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps, JointDataset } from "@responsible-ai/core-ui";
import { getCounterfactualsScatter } from "./getCounterfactualsScatter";

export function getCounterfactualsScatterOption(
  x_series: number[],
  y_series: number[],
  index_series: number[],
  chartProps: IGenericChartProps,
  jointData: JointDataset,
  selectedPointsIndexes: number[],
  customPoints?: Array<{ [key: string]: any }>,
  selectPointFromChartLargeData?: (data: any) => void
): any {
  console.log(
    "!!selectPointFromChartLargeData: ",
    selectPointFromChartLargeData
  );
  const dataSeries = getCounterfactualsScatter(
    x_series,
    y_series,
    index_series,
    jointData,
    selectedPointsIndexes,
    chartProps,
    customPoints
  );
  console.log("!!dataseries: ", dataSeries);
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
        cursor: "pointer",
        point: {
          events: {
            click(): void {
              if (selectPointFromChartLargeData === undefined) {
                return;
              }
              console.log(
                "!!getCounterfactualsScatterOption this: ",
                this,
                selectPointFromChartLargeData
              );
              selectPointFromChartLargeData(this);
            }
          }
        },
        turboThreshold: 0
      }
    },
    series: dataSeries,
    xAxis: {
      type: chartProps?.xAxis.type
    },
    yAxis: {
      type: chartProps?.yAxis.type
    }
  };
}
