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
  IChoiceGroupOption,
  Stack,
  DefaultButton,
  Panel,
  ChoiceGroup,
  PrimaryButton
} from "office-ui-fabric-react";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IModelOverviewMetricChartProps {
  onChooseCohorts: () => void;
  cohorts: ErrorCohort[];
  cohortStats: ILabeledStatistic[][];
  selectableMetrics: IDropdownOption[];
  selectedCohorts: number[];
}

interface IModelOverviewMetricChartState {
  selectedMetric: string;
  newlySelectedMetric: string;
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
    const firstMetric = this.props.selectableMetrics[0].key.toString();
    this.state = {
      metricSelectionFlyoutIsVisible: false,
      newlySelectedMetric: firstMetric,
      selectedMetric: firstMetric
    };
  }

  public render(): React.ReactNode {
    const theme = getTheme();

    const classNames = modelOverviewChartStyles();

    let cohorts = this.props.cohorts.filter((_cohort, index) => {
      return this.props.selectedCohorts.includes(index);
    });

    const selectedCohortNames = cohorts.map((cohort) => cohort.cohort.name);
    const selectedCohortStats = this.props.cohortStats
      .filter((_, index) => this.props.selectedCohorts.includes(index))
      .map((labeledStats) => {
        const stat = labeledStats.find(
          (stat) => stat.key === this.state.selectedMetric
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
                    height: 100 + 40 * selectedCohortNames.length,
                    type: "bar"
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
                      data: selectedCohortStats,
                      name: this.props.selectableMetrics.find(
                        (metricOption) =>
                          metricOption.key === this.state.selectedMetric
                      )?.text,
                      type: "bar"
                    }
                  ],
                  xAxis: {
                    categories: selectedCohortNames
                  },
                  yAxis: {
                    title: this.props.selectableMetrics.find(
                      (option) => option.key === this.state.selectedMetric
                    )
                  }
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
          <Stack tokens={{ childrenGap: "10px" }}>
            <ChoiceGroup
              className={classNames.chartConfigDropdown}
              label={
                localization.ModelAssessment.ModelOverview
                  .metricChartDropdownSelectionHeader
              }
              options={this.props.selectableMetrics.map((metricOption) => {
                return {
                  key: metricOption.key,
                  text: metricOption.text
                } as IChoiceGroupOption;
              })}
              onChange={this.onMetricSelectionChange}
              selectedKey={this.state.newlySelectedMetric}
            />
            <Stack horizontal tokens={{ childrenGap: "10px" }}>
              <PrimaryButton
                onClick={() => {
                  this.setState({
                    metricSelectionFlyoutIsVisible: false,
                    selectedMetric: this.state.newlySelectedMetric
                  });
                }}
                text={
                  localization.ModelAssessment.ModelOverview.chartConfigConfirm
                }
              />
              <DefaultButton
                onClick={() => {
                  this.setState({ metricSelectionFlyoutIsVisible: false });
                }}
                text={
                  localization.ModelAssessment.ModelOverview.chartConfigCancel
                }
              />
            </Stack>
          </Stack>
        </Panel>
      </>
    );
  }

  private onMetricSelectionChange = (
    _: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
    item?: IChoiceGroupOption
  ): void => {
    if (item) {
      this.setState({ newlySelectedMetric: item.key.toString() });
    }
  };
}
