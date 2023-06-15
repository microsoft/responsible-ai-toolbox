// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { SeriesOptionsType } from "highcharts";

import { IHighchartsConfig } from "@responsible-ai/core-ui";

export function getAUCChartOptions(
  data: SeriesOptionsType[],
  theme?: ITheme
): IHighchartsConfig {
  // Open questions:
  // 1. select cohort ?
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
    series: data,
    title: {
      // TODO: localize
      text: "AUC"
    },
    xAxis: {
      max: 1.05,
      min: -0.05,
      title: {
        // TODO: localize
        text: "False Positive Rate"
      }
    },
    yAxis: {
      max: 1.05,
      min: -0.05,
      title: {
        // TODO: localize
        text: "True Positive Rate"
      }
    }
  };
}
