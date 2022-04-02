// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  defaultModelAssessmentContext,
  ErrorCohort,
  ILabeledStatistic,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { getTheme, IDropdownOption, Dropdown } from "office-ui-fabric-react";
import React from "react";

interface IModelOverviewMetricChartProps {
  datasetCohorts: ErrorCohort[];
  featureBasedCohorts: ErrorCohort[];
  datasetCohortStats: ILabeledStatistic[][];
  featureBasedCohortStats: ILabeledStatistic[][];
  selectableMetrics: IDropdownOption[];
}

interface IModelOverviewMetricChartState {
  selectedDatasetCohorts: number[];
  selectedFeatureBasedCohorts: number[];
  selectedMetric: string;
}

export class ModelOverviewMetricChart extends React.Component<
  IModelOverviewMetricChartProps,
  IModelOverviewMetricChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  constructor(props: IModelOverviewMetricChartProps) {
    super(props);
    this.state = {
      selectedDatasetCohorts: this.props.datasetCohorts.map(
        (_cohort, index) => {
          return index;
        }
      ),
      selectedFeatureBasedCohorts: this.props.featureBasedCohorts.map(
        (_cohort, index) => {
          return index;
        }
      ),
      selectedMetric: this.props.selectableMetrics[0].key.toString()
    };
  }

  public render(): React.ReactNode {
    const theme = getTheme();

    const selectedDatasetCohorts = this.props.datasetCohorts.filter(
      (_cohort, index) => {
        return this.state.selectedDatasetCohorts.includes(index);
      }
    );
    const selectedFeatureBasedCohorts = this.props.featureBasedCohorts.filter(
      (_cohort, index) => {
        return this.state.selectedFeatureBasedCohorts.includes(index);
      }
    );
    const selectedCohortNames = selectedDatasetCohorts
      .map((cohort) => cohort.cohort.name)
      .concat(selectedFeatureBasedCohorts.map((cohort) => cohort.cohort.name));
    const selectedCohortStats = this.props.datasetCohortStats
      .filter((_, index) => this.state.selectedDatasetCohorts.includes(index))
      .concat(
        this.props.featureBasedCohortStats.filter((_, index) =>
          this.state.selectedFeatureBasedCohorts.includes(index)
        )
      )
      .map((labeledStats) => {
        const stat = labeledStats.find(
          (stat) => stat.key == this.state.selectedMetric
        );
        return stat ? Number(stat.stat.toFixed(3)) : Number.NaN;
      });

    return (
      <>
        <Dropdown
          label={
            localization.ModelAssessment.ModelOverview
              .metricChartDropdownSelectionHeader
          }
          options={this.props.selectableMetrics}
          styles={{ dropdown: { width: 400 } }}
          onChange={this.onMetricSelectionChange}
          selectedKey={this.state.selectedMetric}
        />
        <BasicHighChart
          id={"ModelOverviewMetricChart"}
          theme={theme}
          configOverride={{
            chart: {
              type: "bar"
            },
            xAxis: {
              categories: selectedCohortNames
            },
            plotOptions: {
              bar: {
                dataLabels: {
                  enabled: true
                }
              }
            },
            series: [
              {
                name: this.props.selectableMetrics.find(
                  (metricOption) =>
                    metricOption.key === this.state.selectedMetric
                )?.text,
                data: selectedCohortStats,
                type: "bar"
              }
            ]
          }}
        />
      </>
    );
  }

  private onMetricSelectionChange = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item) {
      this.setState({ selectedMetric: item.key.toString() });
    }
  };
}
