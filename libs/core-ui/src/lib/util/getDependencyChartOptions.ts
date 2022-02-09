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
  xLabel: string,
  _yLabel: string,
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
      backgroundColor: colorTheme.backgroundColor,
      type: "scatter",
      zoomType: "xy"
    },
    legend: {},
    plotOptions: {
      scatter: {
        marker: {
          radius: 2,
          states: {
            hover: {
              enabled: true,
              lineColor: colorTheme.axisColor
            }
          }
        },
        tooltip: {
          headerFormat: "",
          pointFormat: `${xLabel}: {point.x}<br>`
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
    subtitle: {},
    title: { text: "" },
    xAxis: {
      labels: {
        style: {
          color: colorTheme.fontColor
        }
      },
      title: {
        text: ""
      }
    },
    yAxis: {
      labels: {
        style: {
          color: colorTheme.fontColor
        }
      },
      title: {
        text: ""
      }
    }
  };
}
