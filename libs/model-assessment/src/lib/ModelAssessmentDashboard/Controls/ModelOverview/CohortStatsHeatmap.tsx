// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  HeatmapHighChart,
  ErrorCohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IDropdownOption } from "office-ui-fabric-react";
import React from "react";
import { PointOptionsObject } from "highcharts";
import { wrapYAxisLabels } from "./StatsTableUtils";

interface ICohortStatsHeatmapProps {
  cohorts: ErrorCohort[];
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  title: string;
  items: PointOptionsObject[];
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

    return (
      <HeatmapHighChart
        configOverride={{
          chart: {
            height: this.props.cohorts.length * 40 + 120,
            type: "heatmap"
          },
          colorAxis: {
            max: 1,
            maxColor: "#0078D4",
            min: 0,
            minColor: "#FFFFFF"
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
                nullFormat: 'N/A'
              },
              name: "Metrics",
              type: "heatmap"
            }
          ],
          title: {
            align: "left",
            text: this.props.title
          },
          tooltip: {
            formatter() {
              // to avoid semantic error during build cast point to any
              const pointValue = (this.point as any).value;
              if (
                this.point.y === undefined ||
                pointValue === undefined
              ) {
                return undefined;
              }

              if (this.point.x === 0) {
                // Count column
                return localization.formatString(
                  localization.ModelAssessment.ModelOverview.tableCountTooltip,
                  this.series.yAxis.categories[this.point.y],
                  pointValue
                );
              }
              // Metric columns
              return localization.formatString(
                localization.ModelAssessment.ModelOverview.tableMetricTooltip,
                // make metric name lower case in sentence
                this.series.xAxis.categories[this.point.x].toLowerCase(),
                this.series.yAxis.categories[this.point.y],
                pointValue === null ? "N/A" : pointValue
              );
            }
          },
          xAxis: {
            categories: columns,
            opposite: true
          },
          yAxis: {
            reversed: true,
            categories: this.props.cohorts.map(
              (errorCohort) => errorCohort.cohort.name
            ),
            grid: {
              borderWidth: 2,
              enabled: true,
              columns: [
                {
                  labels: {
                    formatter: function () {
                      const text = wrapYAxisLabels(this.value.toString());
                      return `<div style='width:300px'>${text}</div>`;
                    },
                    useHTML: true
                  }
                }
              ]
            },
            type: "category"
          }
        }}
      />
    );
  }
}
