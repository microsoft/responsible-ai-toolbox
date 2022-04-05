// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  HeatmapHighChart,
  JointDataset,
  generateMetrics,
  ErrorCohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IDropdownOption } from "office-ui-fabric-react";
import React from "react";

import { generateCohortsStatsTable, wrapYAxisLabels } from "./StatsTableUtils";

interface ICohortStatsHeatmapProps {
  cohorts: ErrorCohort[];
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
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

    // generate table contents
    const cohortLabeledStatistics = generateMetrics(
      this.context.jointDataset,
      this.props.cohorts.map((errorCohort) =>
        errorCohort.cohort.unwrap(JointDataset.IndexLabel)
      ),
      this.context.modelMetadata.modelType
    );

    const items = generateCohortsStatsTable(
      this.props.cohorts,
      this.props.selectableMetrics,
      cohortLabeledStatistics,
      this.props.selectedMetrics
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
            maxColor: "#1634F6",
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
              data: items,
              dataLabels: {
                enabled: true
              },
              name: "Metrics",
              type: "heatmap"
            }
          ],
          title: {
            align: "left",
            text: localization.ModelAssessment.ModelOverview
              .dataCohortsHeatmapHeader
          },
          tooltip: {
            formatter() {
              // to avoid semantic error during build cast point to any
              if (
                this.point.y === undefined ||
                (this.point as any).value === undefined ||
                (this.point as any).value === null
              ) {
                return undefined;
              }
              const value = (this.point as any).value;
              if (this.point.x === 0) {
                // Count column
                return localization.formatString(
                  localization.ModelAssessment.ModelOverview.tableCountTooltip,
                  this.series.yAxis.categories[this.point.y],
                  value
                );
              }
              // Metric columns
              return localization.formatString(
                localization.ModelAssessment.ModelOverview.tableMetricTooltip,
                this.series.xAxis.categories[this.point.x].toLowerCase(),
                this.series.yAxis.categories[this.point.y],
                value
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
            labels: {
              align: "left",
              // format labels to cap the line length
              formatter() {
                return wrapYAxisLabels(this.value.toString(), true);
              },

              reserveSpace: true
            }
          }
        }}
      />
    );
  }
}
