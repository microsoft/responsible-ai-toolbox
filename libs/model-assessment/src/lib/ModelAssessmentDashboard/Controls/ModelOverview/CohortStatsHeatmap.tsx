// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, IDropdownOption } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  HeatmapHighChart,
  ErrorCohort,
  tableStyles
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

interface ICohortStatsHeatmapState {
  key: number;
}

export class CohortStatsHeatmap extends React.Component<
  ICohortStatsHeatmapProps,
  ICohortStatsHeatmapState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ICohortStatsHeatmapProps) {
    super(props);
    this.state = { key: 0 };
  }

  public componentDidUpdate(prevProps: ICohortStatsHeatmapProps): void {
    const cohortsChanged =
      prevProps.cohorts.length !== this.props.cohorts.length ||
      prevProps.cohorts.some(
        (errorCohort, cohortIndex) =>
          this.props.cohorts[cohortIndex].cohort.getCohortID() !==
          errorCohort.cohort.getCohortID()
      );
    const metricsChanged =
      prevProps.selectedMetrics.length !== this.props.selectedMetrics.length ||
      prevProps.selectedMetrics.some(
        (metric, metricIndex) =>
          metric !== this.props.selectedMetrics[metricIndex]
      );
    if (cohortsChanged || metricsChanged) {
      this.setState({ key: this.state.key + 1 });
    }
  }

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
      <div className={tableStyles}>
        <HeatmapHighChart
          key={`heatmap${this.state.key}`}
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
            custom: {
              minHeight: 190,
              minWidth: 500
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
                  style: {
                    color: theme.semanticColors.bodyText
                  },
                  ...colorConfig
                },
                name: "Metrics",
                type: "heatmap"
              }
            ],
            tooltip: {
              formatter(): string | undefined {
                // to avoid semantic error during build cast point to any
                const pointValue = (this.point as any).value;
                if (this.point.y === undefined || pointValue === undefined) {
                  return undefined;
                }

                const cohortNameBold = `<b>${
                  this.series.yAxis.categories[this.point.y]
                }</b>`;

                if (this.point.x === 0) {
                  // Count column
                  return wrapText(
                    localization.formatString(
                      localization.ModelAssessment.ModelOverview
                        .tableCountTooltip,
                      cohortNameBold,
                      pointValue
                    ),
                    40,
                    10
                  );
                }
                // Metric columns
                return wrapText(
                  localization.formatString(
                    localization.ModelAssessment.ModelOverview
                      .tableMetricTooltip,
                    // make metric name lower case in sentence
                    this.series.xAxis.categories[this.point.x].toLowerCase(),
                    cohortNameBold,
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
                      formatter(): string {
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
      </div>
    );
  }
}
