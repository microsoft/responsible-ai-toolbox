// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";

import { IHighchartsConfig } from "../Highchart/HighchartTypes";
import { ICausalAnalysisSingleData } from "../Interfaces/ICausalAnalysisData";

import { getCausalDisplayFeatureName } from "./getCausalDisplayFeatureName";

export function getErrorBarChartOptions(
  data: ICausalAnalysisSingleData[],
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
      type: "lowmedhigh",
      zoomType: "xy"
    },
    series: [
      {
        color: colorTheme.fontColor,
        data: data.map((d) => d.point),
        showInLegend: false,
        tooltip: {
          pointFormat: `${localization.CausalAnalysis.AggregateView.causalPoint}: {point.y:.6f}<br>`
        },
        type: "spline"
      },
      {
        color: colorTheme.fontColor,
        data: data.map((d) => [d.ci_lower, d.ci_upper]),
        tooltip: {
          pointFormat:
            `${localization.CausalAnalysis.AggregateView.confidenceUpper}: {point.high:.6f}<br>` +
            `${localization.CausalAnalysis.AggregateView.confidenceLower}: {point.low:.6f}<br><extra></extra>`
        },
        type: "errorbar"
      }
    ],
    xAxis: [
      {
        categories: data.map((d) => getCausalDisplayFeatureName(d)),
        labels: {
          format: "{value}",
          style: {
            color: colorTheme.fontColor,
            fontSize: "14px"
          }
        }
      }
    ],
    yAxis: [
      {
        labels: {
          format: "{value}",
          style: {
            color: colorTheme.fontColor,
            fontSize: "14px"
          }
        }
      }
    ]
  };
}
