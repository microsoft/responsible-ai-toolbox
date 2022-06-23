// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, IDropdownOption } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  HeatmapHighChart,
  ErrorCohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
import React from "react";

import { wrapText } from "./StatsTableUtils";

interface ICohortStatsHeatmapProps {
  cohorts: ErrorCohort[];
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  items: PointOptionsObject[];
  showColors: boolean;
  id: string;
}

class ICohortStatsHeatmapState {}

export class CohortStatsHeatmap extends React.Component<
  ICohortStatsHeatmapProps,
  ICohortStatsHeatmapState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const columns: string[] = [
      localization.ModelAssessment.ModelOverview.countColumnHeader
    ];
    columns.push(
      ...this.props.selectableMetrics
        .filter((element) =>
          this.props.selectedMetrics.includes(element.key.toString())
        )
        .map((element) => {
          return element.text;
        })
    );

    const theme = getTheme();
    const minColor = this.props.showColors
      ? theme.semanticColors.bodyBackground
      : "transparent";
    const maxColor = this.props.showColors ? theme.palette.blue : "transparent";
    const colorConfig = this.props.showColors
      ? {}
      : { color: theme.semanticColors.bodyText };

    return (
      <HeatmapHighChart
        id={this.props.id}
        configOverride={{
          chart: {
            height: this.props.cohorts.length * 40 + 120,
            type: "heatmap"
          },
          colorAxis: {
            max: 1,
            maxColor,
            min: 0,
            minColor
          },
          legend: {
            enabled: false
          },
          series: [
            {
              borderWidth: 1,
              colorKey: "colorValue",
              data: this.props.items,
              dataLabels: {
                enabled: true,
                nullFormat: "N/A",
                ...colorConfig
              },
              name: "Metrics",
              type: "heatmap"
            }
          ],
          tooltip: {
            formatter() {
              // to avoid semantic error during build cast point to any
              const pointValue = (this.point as any).value;
              if (this.point.y === undefined || pointValue === undefined) {
                return undefined;
              }

              if (this.point.x === 0) {
                // Count column
                return wrapText(
                  localization.formatString(
                    localization.ModelAssessment.ModelOverview
                      .tableCountTooltip,
                    this.series.yAxis.categories[this.point.y],
                    pointValue
                  ),
                  40,
                  10
                );
              }
              // Metric columns
              return wrapText(
                localization.formatString(
                  localization.ModelAssessment.ModelOverview.tableMetricTooltip,
                  // make metric name lower case in sentence
                  this.series.xAxis.categories[this.point.x].toLowerCase(),
                  this.series.yAxis.categories[this.point.y],
                  pointValue === null
                    ? localization.ModelAssessment.ModelOverview.nA
                    : pointValue
                ),
                40,
                10
              );
            }
          },
          xAxis: {
            categories: columns,
            opposite: true
          },
          yAxis: {
            categories: this.props.cohorts.map(
              (errorCohort) => errorCohort.cohort.name
            ),
            grid: {
              borderWidth: 2,
              columns: [
                {
                  labels: {
                    formatter() {
                      const text = wrapText(this.value.toString());
                      return `<div style='width:300px'>${text}</div>`;
                    },
                    useHTML: true
                  },
                  title: {
                    text: localization.ModelAssessment.ModelOverview
                      .dataCohortsHeatmapHeader
                  }
                }
              ],
              enabled: true
            },
            reversed: true,
            type: "category"
          }
        }}
      />
    );
  }
}
