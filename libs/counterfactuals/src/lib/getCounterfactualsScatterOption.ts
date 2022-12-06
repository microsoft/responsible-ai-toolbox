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
  onClickHandler?: (data: any) => void
): any {
  const dataSeries = getCounterfactualsScatter(
    x_series,
    y_series,
    index_series,
    jointData,
    chartProps
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
              if (onClickHandler === undefined) {
                return;
              }
              console.log("!!this: ", this);
              onClickHandler(this);
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
