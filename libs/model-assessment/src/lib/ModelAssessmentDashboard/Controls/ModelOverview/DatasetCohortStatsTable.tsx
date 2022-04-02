// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  HeatmapHighChart,
  JointDataset,
  generateMetrics
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IDropdownOption } from "office-ui-fabric-react";
import React from "react";
import { generateCohortsStatsTable, wrapYAxisLabels } from "./StatsTableUtils";

interface IDatasetCohortStatsTableProps {
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
}

class IDatasetCohortStatsTableState {}

export class DatasetCohortStatsTable extends React.Component<
  IDatasetCohortStatsTableProps,
  IDatasetCohortStatsTableState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  constructor(props: IDatasetCohortStatsTableProps) {
    super(props);
    this.state = {
      selectedMetrics: [],
      isFeaturePickerLimitExceededDialogOpen: false
    };
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

    // generate table contents for dataset cohorts
    const datasetCohortLabeledStatistics = generateMetrics(
      this.context.jointDataset,
      this.context.errorCohorts.map((errorCohort) =>
        errorCohort.cohort.unwrap(JointDataset.IndexLabel)
      ),
      this.context.modelMetadata.modelType
    );

    let datasetCohortItems = generateCohortsStatsTable(
      this.context.errorCohorts,
      this.props.selectableMetrics,
      datasetCohortLabeledStatistics,
      this.props.selectedMetrics
    );

    return (
      <HeatmapHighChart
        configOverride={{
          chart: { type: "heatmap", spacingLeft: 50 },
          title: {
            text: localization.ModelAssessment.ModelOverview
              .dataCohortsHeatmapHeader,
            align: "left"
          },
          xAxis: {
            categories: columns,
            opposite: true
          },
          yAxis: {
            categories: this.context.errorCohorts.map(
              (errorCohort) => errorCohort.cohort.name
            ),
            labels: {
              align: "left",
              reserveSpace: true,
              // format labels to cap the line length at 20 characters
              formatter: function () {
                return wrapYAxisLabels(this.value, true);
              }
            }
          },
          series: [
            {
              name: "Metrics",
              colorKey: "colorValue",
              data: datasetCohortItems,
              type: "heatmap",
              dataLabels: {
                enabled: true
              },
              borderWidth: 1
            }
          ],
          colorAxis: {
            min: 0,
            max: 1,
            minColor: "#FFFFFF",
            maxColor: "#1634F6"
          },
          legend: {
            enabled: false
          },
          tooltip: {
            formatter: function () {
              if (
                this.point.y === undefined ||
                this.point.value === undefined
              ) {
                return undefined;
              }
              if (this.point.x === 0) {
                // Count column
                return (
                  "Cohort " +
                  this.series["yAxis"].categories[this.point.y] +
                  " contains " +
                  this.point.value +
                  " instances."
                );
              } else {
                // Metric columns
                return (
                  "The model's " +
                  this.series["xAxis"].categories[this.point.x].toLowerCase() +
                  " on cohort " +
                  this.series["yAxis"].categories[this.point.y] +
                  " is " +
                  this.point.value
                );
              }
            }
          }
        }}
      />
    );
  }
}
