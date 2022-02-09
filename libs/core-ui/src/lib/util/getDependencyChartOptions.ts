// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { IHighchartsConfig } from "../Highchart/HighchartTypes";

export function getDependencyChartOptions(
  data: number[][],
  additionalData: any[],
  theme?: ITheme
): IHighchartsConfig {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.palette.white,
    fontColor: theme?.semanticColors.bodyText
  };
  const highchartData = data.map((p, index) => {
    return {
      custom: additionalData[index],
      x: p[0],
      y: p[1]
    };
  });
  return {
    chart: {
      type: "scatter",
      zoomType: "xy"
    },
    legend: {},
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
          states: {
            hover: {
              enabled: true,
              lineColor: "rgb(100,100,100)"
            }
          }
        },
        states: {
          hover: {
            // marker: {
            //   enabled: false
            // }
          }
        },
        tooltip: {
          headerFormat: "<b>{series.name}</b><br>",
          pointFormat: "{point.x} cm, {point.y} kg"
        }
      }
    },
    series: [
      {
        // color: 'rgba(223, 83, 83, .5)',
        data: highchartData,
        name: "",
        type: "scatter"
      }
    ],
    subtitle: {},
    title: { text: "" },
    xAxis: {
      title: {
        text: "Height (cm)"
      }
      // startOnTick: true,
      // endOnTick: true,
      // showLastLabel: true
    },
    yAxis: {
      title: {
        text: "Weight (kg)"
      }
    }
  };
}
