// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { IHighchartsConfig } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Point, PointOptionsObject } from "highcharts";

import { wrapText } from "./StatsTableUtils";

export function getHeatmapPointDescription(
  point: Point,
  selectedClasses: string[]
): string {
  return localization.formatString(
    localization.ModelAssessment.ModelOverview.confusionMatrix
      .confusionMatrixHeatmapTooltip,
    `<b>${(point as Point & { value: number }).value} </b>`,
    `<b>${selectedClasses[point.y ?? 0]}</b>`,
    `<b>${selectedClasses[point.x ?? 0]}</b>`
  );
}

export function getHeatmapConfig(
  confusionMatrix: PointOptionsObject[],
  selectedClasses: string[],
  theme: ITheme
): IHighchartsConfig {
  const confusionMatrixLocString =
    localization.ModelAssessment.ModelOverview.confusionMatrix;
  return {
    accessibility: {
      keyboardNavigation: {
        enabled: true
      },
      point: {
        descriptionFormatter(point: Point): string {
          return getHeatmapPointDescription(point, selectedClasses);
        }
      }
    },
    chart: {
      height: selectedClasses.length * 40 + 200,
      marginBottom: 80,
      marginTop: 80,
      plotBorderWidth: 1,
      type: "heatmap",
      width: selectedClasses.length * 100 + 200
    },
    colorAxis: {
      maxColor: theme.palette.blue,
      min: 0,
      minColor: theme.palette.white
    },
    custom: {
      minHeight: 300
    },
    legend: {
      align: "right",
      enabled: true,
      layout: "vertical",
      symbolHeight: selectedClasses.length * 40 + 40,
      verticalAlign: "middle"
    },
    series: [
      {
        borderWidth: 1,
        data: confusionMatrix,
        dataLabels: {
          color: theme.palette.black,
          enabled: true,
          style: {
            color: theme.semanticColors.bodyText
          }
        },
        type: "heatmap"
      }
    ],
    tooltip: {
      formatter(): string | undefined {
        return wrapText(
          getHeatmapPointDescription(this.point, selectedClasses),
          40,
          10
        );
      }
    },
    xAxis: {
      categories: selectedClasses,
      title: {
        style: {
          fontWeight: "bold"
        },
        text: `${confusionMatrixLocString.confusionMatrixXAxisLabel}`
      }
    },
    yAxis: {
      categories: selectedClasses,
      title: {
        text: `<b>${confusionMatrixLocString.confusionMatrixYAxisLabel}</b>`
      }
    }
  };
}
