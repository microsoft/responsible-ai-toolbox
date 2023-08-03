// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { IHighchartsConfig } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { SeriesOptionsType } from "highcharts";

export function getAUCChartOptions(
  data: SeriesOptionsType[],
  theme?: ITheme
): IHighchartsConfig {
  // Open TODO/questions:
  // 1. should user be able to select cohort ?
  // 2. support for multi class classification ?
  // 3. solidify location of chart / wording
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
      text: localization.ModelAssessment.ModelOverview.AUCChart.title
    },
    xAxis: {
      max: 1.05,
      min: -0.05,
      title: {
        text: localization.ModelAssessment.ModelOverview.AUCChart
          .falsePositiveRate
      }
    },
    yAxis: {
      max: 1.05,
      min: -0.05,
      title: {
        text: localization.ModelAssessment.ModelOverview.AUCChart
          .truePositiveRate
      }
    }
  };
}
