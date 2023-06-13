// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { IHighchartsConfig } from "../Highchart/IHighchartsConfig";

import { AxisTypes } from "./IGenericChartProps";

export interface IDependenceData {
  x: number;
  y: number;
  customData: any[];
}

export function getDependencyChartOptions(
  data: IDependenceData[],
  xLabels: string[] | undefined,
  pointColor: string,
  logarithmicScaling: boolean,
  theme?: ITheme
): IHighchartsConfig {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.semanticColors.bodyBackground,
    fontColor: theme?.semanticColors.bodyText
  };
  return {
    chart: {
      backgroundColor: colorTheme.backgroundColor,
      type: "scatter",
      zoomType: "xy"
    },
    custom: {
      disableUpdate: true
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
          pointFormat: "{point.customData.template}"
        }
      },
      series: {
        turboThreshold: 0
      }
    },
    series: [
      {
        color: pointColor,
        data,
        name: "",
        turboThreshold: 0,
        type: "scatter"
      }
    ],
    xAxis: {
      categories: xLabels,
      type: logarithmicScaling ? AxisTypes.Logarithmic : undefined
    }
  };
}
