// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  HeatmapHighChart,
  JointDataset,
  generateMetrics,
  ErrorCohort} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ActionButton,
  IDropdownOption,
  IDropdown
} from "office-ui-fabric-react";
import React from "react";

import { generateCohortsStatsTable, wrapYAxisLabels } from "./StatsTableUtils";

interface IDisaggregatedAnalysisTableProps {
  selectableMetrics: IDropdownOption[];
  selectedMetrics: string[];
  selectedFeatures: number[];
  featureBasedCohorts: ErrorCohort[];
}

interface IDisaggregatedAnalysisTableState {}

export class DisaggregatedAnalysisTable extends React.Component<
  IDisaggregatedAnalysisTableProps,
  IDisaggregatedAnalysisTableState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private featureDropdownRef = React.createRef<IDropdown>();

  constructor(props: IDisaggregatedAnalysisTableProps) {
    super(props);
    this.state = {
      selectedMetrics: [],
      selectedFeatures: [],
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

    const featureBasedCohortLabeledStatistics = generateMetrics(
      this.context.jointDataset,
      this.props.featureBasedCohorts.map((errorCohort) =>
        errorCohort.cohort.unwrap(JointDataset.IndexLabel)
      ),
      this.context.modelMetadata.modelType
    );

    let featureBasedCohortItems = generateCohortsStatsTable(
      this.props.featureBasedCohorts,
      this.props.selectableMetrics,
      featureBasedCohortLabeledStatistics,
      this.props.selectedMetrics
    );

    return (
      <>
        {this.props.selectedFeatures.length === 0 && (
          <ActionButton
            styles={{}}
            onClick={() => {
              this.featureDropdownRef.current?.focus(true);
            }}
          >
            Select features and fairness metrics to generate the disaggregated
            analysis.
          </ActionButton>
        )}
        {this.props.selectedFeatures.length > 0 && (
          <HeatmapHighChart
            configOverride={{
              chart: {
                type: "heatmap",
                height: this.props.featureBasedCohorts.length * 40 + 120
              },
              title: {
                text: localization.ModelAssessment.ModelOverview
                  .disaggregatedAnalysisHeatmapHeader,
                align: "left"
              },
              xAxis: {
                categories: columns,
                opposite: true
              },
              yAxis: {
                categories: this.props.featureBasedCohorts.map(
                  (errorCohort) => errorCohort.cohort.name
                ),
                labels: {
                  align: "left",
                  reserveSpace: true,
                  // format labels to cap the line length at 20 characters
                  formatter: function () {
                    return wrapYAxisLabels(this.value, false);
                  }
                }
              },
              series: [
                {
                  name: "Metrics",
                  colorKey: "colorValue",
                  data: featureBasedCohortItems,
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
                      this.series["xAxis"].categories[
                        this.point.x
                      ].toLowerCase() +
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
        )}
      </>
    );
  }
}
