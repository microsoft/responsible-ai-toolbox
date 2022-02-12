// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { IHighchartsConfig } from "../Highchart/HighchartTypes";

export interface IDependenceData {
  x: number;
  y: number;
  customData: any[];
}

export function getDependencyChartOptions(
  data: IDependenceData[],
  xLabels: string[] | undefined,
  theme?: ITheme
): IHighchartsConfig {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.palette.white,
    fontColor: theme?.semanticColors.bodyText
  };
  return {
    chart: {
      type: "scatter",
      zoomType: "xy"
    },
    plotOptions: {
      scatter: {
        marker: {
          states: {
            hover: {
              enabled: true,
              lineColor: colorTheme.axisColor
            }
          }
        },
        tooltip: {
          headerFormat: "",
          pointFormat: `{point.customData.template}`
        }
      }
    },
    series: [
      {
        color: colorTheme.fontColor,
        data,
        name: "",
        type: "scatter"
      }
    ],
    xAxis: {
      categories: xLabels
    }
  };
}
