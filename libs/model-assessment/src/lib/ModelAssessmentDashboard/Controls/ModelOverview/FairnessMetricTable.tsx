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
import { IDropdownOption } from "office-ui-fabric-react";
import React from "react";
import { IFairnessStats } from "./StatsTableUtils";

interface IFairnessMetricTableProps {
  cohorts: ErrorCohort[];
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  title: string;
  fairnessStats: IFairnessStats[];
}

class IFairnessMetricTableState {}

interface FairnessMetricPointOptionsObject extends PointOptionsObject {
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
          value: Number(metricFairnessStats.difference.toFixed(3)),
          x: metricIndex,
          y: 0,
          min: metricFairnessStats.min,
          max: metricFairnessStats.max,
          minCohort: metricFairnessStats.minCohortName,
          maxCohort: metricFairnessStats.maxCohortName,
          color: "transparent"
        } as FairnessMetricPointOptionsObject;
      })
      .concat(
        this.props.fairnessStats.map((metricFairnessStats, metricIndex) => {
          return {
            value: Number(metricFairnessStats.ratio?.toFixed(3)),
            x: metricIndex,
            y: 1,
            min: metricFairnessStats.min,
            max: metricFairnessStats.max,
            minCohort: metricFairnessStats.minCohortName,
            maxCohort: metricFairnessStats.maxCohortName,
            color: "transparent"
          } as FairnessMetricPointOptionsObject;
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
                enabled: true,
                color: "black"
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

              return localization.formatString(
                point.y === 0
                  ? localization.ModelAssessment.ModelOverview
                      .tableDifferenceTooltip
                  : localization.ModelAssessment.ModelOverview
                      .tableRatioTooltip,
                // make metric name lower case in sentence
                this.series.xAxis.categories[point.x].toLowerCase(),
                pointValue,
                point.min.toFixed(3),
                point.minCohort,
                point.max.toFixed(3),
                point.maxCohort
              );
            }
          },
          xAxis: {
            categories: columns,
            opposite: true
          },
          yAxis: {
            reversed: true,
            categories: [
              localization.ModelAssessment.ModelOverview
                .fairnessMetricDifference,
              localization.ModelAssessment.ModelOverview.fairnessMetricRatio
            ],
            grid: {
              borderWidth: 2,
              enabled: true,
              columns: [
                {
                  labels: {
                    formatter: function () {
                      return `<div style='width:300px'><p>${this.value}</p></div>`;
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
