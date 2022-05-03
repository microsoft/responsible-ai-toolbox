// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  HeatmapHighChart,
  ErrorCohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
import { getTheme, IDropdownOption } from "office-ui-fabric-react";
import React from "react";

import { IFairnessStats, wrapText } from "./StatsTableUtils";

interface IFairnessMetricTableProps {
  cohorts: ErrorCohort[];
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  title: string;
  fairnessStats: IFairnessStats[];
}

class IFairnessMetricTableState {}

interface IFairnessMetricPointOptionsObject extends PointOptionsObject {
  min?: number;
  max?: number;
  minCohort?: string;
  maxCohort?: string;
}

export class FairnessMetricTable extends React.Component<
  IFairnessMetricTableProps,
  IFairnessMetricTableState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const theme = getTheme();

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

    const items = this.props.fairnessStats
      .map((metricFairnessStats, metricIndex) => {
        return {
          color: "transparent",
          max: metricFairnessStats.max,
          maxCohort: metricFairnessStats.maxCohortName,
          min: metricFairnessStats.min,
          minCohort: metricFairnessStats.minCohortName,
          value: Number(metricFairnessStats.difference.toFixed(3)),
          x: metricIndex,
          y: 0
        } as IFairnessMetricPointOptionsObject;
      })
      .concat(
        this.props.fairnessStats.map((metricFairnessStats, metricIndex) => {
          return {
            color: "transparent",
            max: metricFairnessStats.max,
            maxCohort: metricFairnessStats.maxCohortName,
            min: metricFairnessStats.min,
            minCohort: metricFairnessStats.minCohortName,
            value: Number(metricFairnessStats.ratio?.toFixed(3)),
            x: metricIndex,
            y: 1
          } as IFairnessMetricPointOptionsObject;
        })
      );

    return (
      <HeatmapHighChart
        configOverride={{
          chart: {
            height: 200,
            type: "heatmap"
          },
          legend: {
            enabled: false
          },
          series: [
            {
              borderWidth: 1,
              data: items,
              dataLabels: {
                color: theme.semanticColors.bodyText,
                enabled: true
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
              const point = this.point as any;
              const pointValue = point.value;
              if (
                point.x === undefined ||
                point.y === undefined ||
                pointValue === undefined ||
                pointValue === null
              ) {
                return undefined;
              }

              let min = point.min.toFixed(3);
              let max = point.max.toFixed(3);
              if (point.x === 0) {
                // Don't show 3 decimals in the count column
                min = point.min;
                max = point.max;
              }

              return wrapText(
                localization.formatString(
                  point.y === 0
                    ? localization.ModelAssessment.ModelOverview
                        .tableDifferenceTooltip
                    : localization.ModelAssessment.ModelOverview
                        .tableRatioTooltip,
                  // make metric name lower case in sentence
                  this.series.xAxis.categories[point.x].toLowerCase(),
                  pointValue,
                  min,
                  `<b>${point.minCohort}</b>`,
                  max,
                  `<b>${point.maxCohort}</b>`
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
            categories: [
              localization.ModelAssessment.ModelOverview.metrics
                .fairnessMetricDifference,
              localization.ModelAssessment.ModelOverview.metrics
                .fairnessMetricRatio
            ],
            grid: {
              borderWidth: 2,
              columns: [
                {
                  labels: {
                    formatter() {
                      return `<div style='width:300px'>${this.value}</div>`;
                    },
                    useHTML: true
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
