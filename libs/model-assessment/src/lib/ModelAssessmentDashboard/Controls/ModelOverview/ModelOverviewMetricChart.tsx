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
import {
  getTheme,
  IDropdownOption,
  Dropdown,
  Stack,
  DefaultButton,
  Panel
} from "office-ui-fabric-react";
import React from "react";
import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IModelOverviewMetricChartProps {
  onChooseCohorts: () => void;
  datasetCohorts: ErrorCohort[];
  featureBasedCohorts: ErrorCohort[];
  datasetCohortStats: ILabeledStatistic[][];
  featureBasedCohortStats: ILabeledStatistic[][];
  selectableMetrics: IDropdownOption[];
  selectedDatasetCohorts: number[];
  selectedFeatureBasedCohorts: number[];
}

interface IModelOverviewMetricChartState {
  selectedMetric: string;
  metricSelectionFlyoutIsVisible: boolean;
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
      metricSelectionFlyoutIsVisible: false,
      selectedMetric: this.props.selectableMetrics[0].key.toString()
    };
  }

  public render(): React.ReactNode {
    const theme = getTheme();

    const classNames = modelOverviewChartStyles();

    const selectedDatasetCohorts = this.props.datasetCohorts.filter(
      (_cohort, index) => {
        return this.props.selectedDatasetCohorts.includes(index);
      }
    );
    const selectedFeatureBasedCohorts = this.props.featureBasedCohorts.filter(
      (_cohort, index) => {
        return this.props.selectedFeatureBasedCohorts.includes(index);
      }
    );
    const selectedCohortNames = selectedDatasetCohorts
      .map((cohort) => cohort.cohort.name)
      .concat(selectedFeatureBasedCohorts.map((cohort) => cohort.cohort.name));
    const selectedCohortStats = this.props.datasetCohortStats
      .filter((_, index) => this.props.selectedDatasetCohorts.includes(index))
      .concat(
        this.props.featureBasedCohortStats.filter((_, index) =>
          this.props.selectedFeatureBasedCohorts.includes(index)
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
        <Stack horizontal grow>
          <Stack.Item className={classNames.verticalAxis}>
            <DefaultButton
              className={classNames.rotatedVerticalBox}
              text={
                localization.ModelAssessment.ModelOverview.cohortSelectionButton
              }
              onClick={this.props.onChooseCohorts}
            />
          </Stack.Item>
          <Stack.Item className={classNames.chart}>
            <Stack>
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
                  yAxis: {
                    title: this.props.selectableMetrics.find(
                      (option) => option.key === this.state.selectedMetric
                    )
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
              <Stack.Item className={classNames.horizontalAxis}>
                <DefaultButton
                  text={
                    localization.ModelAssessment.ModelOverview
                      .metricSelectionButton
                  }
                  onClick={() =>
                    this.setState({
                      metricSelectionFlyoutIsVisible: true
                    })
                  }
                />
              </Stack.Item>
            </Stack>
          </Stack.Item>
        </Stack>
        <Panel
          isOpen={this.state.metricSelectionFlyoutIsVisible}
          closeButtonAriaLabel="Close"
          onDismiss={() => {
            this.setState({ metricSelectionFlyoutIsVisible: false });
          }}
        >
          <Dropdown
            label={
              localization.ModelAssessment.ModelOverview
                .metricChartDropdownSelectionHeader
            }
            options={this.props.selectableMetrics}
            styles={{ dropdown: { width: 250 } }}
            onChange={this.onMetricSelectionChange}
            selectedKey={this.state.selectedMetric}
          />
        </Panel>
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
