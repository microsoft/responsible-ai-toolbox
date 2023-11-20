// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IDropdownOption,
  IChoiceGroupOption,
  Stack,
  DefaultButton,
  Panel,
  ChoiceGroup,
  PrimaryButton
} from "@fluentui/react";
import {
  BasicHighChart,
  defaultModelAssessmentContext,
  ErrorCohort,
  ILabeledStatistic,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IModelOverviewMetricChartProps {
  onChooseCohorts: () => void;
  onApplyMetric: (metric: string) => void;
  cohorts: ErrorCohort[];
  cohortStats: ILabeledStatistic[][];
  selectableMetrics: IDropdownOption[];
  selectedMetric: string;
}

interface IModelOverviewMetricChartState {
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

  public constructor(props: IModelOverviewMetricChartProps) {
    super(props);
    const firstMetric = this.props.selectableMetrics[0].key.toString();
    this.state = {
      metricSelectionFlyoutIsVisible: false,
      newlySelectedMetric: firstMetric
    };
    if (this.props.selectedMetric.length === 0) {
      this.props.onApplyMetric(firstMetric);
    }
  }

  public render(): React.ReactNode {
    const theme = getTheme();

    const classNames = modelOverviewChartStyles();

    const selectedCohortNames = this.props.cohorts.map(
      (cohort) => cohort.cohort.name
    );
    const selectedCohortStats = this.props.cohortStats.map((labeledStats) => {
      const stat = labeledStats.find(
        (stat) => stat.key === this.props.selectedMetric
      );
      return stat ? Number(stat.stat.toFixed(3)) : Number.NaN;
    });

    return (
      <>
        <Stack id="modelOverviewMetricChart">
          <Stack.Item className={classNames.cohortSelectionButton}>
            <DefaultButton
              id="modelOverviewMetricChartCohortSelectionButton"
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
                          metricOption.key === this.props.selectedMetric
                      )?.text,
                      type: "bar"
                    }
                  ],
                  xAxis: {
                    categories: selectedCohortNames
                  },
                  yAxis: {
                    title: this.props.selectableMetrics.find(
                      (option) => option.key === this.props.selectedMetric
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
                  onClick={(): void =>
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
          onDismiss={(): void => {
            this.setState({ metricSelectionFlyoutIsVisible: false });
          }}
          onRenderFooterContent={this.onRenderFooterContent}
          isFooterAtBottom
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
          </Stack>
        </Panel>
      </>
    );
  }

  private onRenderFooterContent = (): React.ReactElement => {
    return (
      <Stack horizontal tokens={{ childrenGap: "10px" }}>
        <PrimaryButton
          onClick={(): void => {
            this.setState({
              metricSelectionFlyoutIsVisible: false
            });
            this.props.onApplyMetric(this.state.newlySelectedMetric);
          }}
          text={localization.ModelAssessment.ModelOverview.chartConfigApply}
          ariaLabel={
            localization.ModelAssessment.ModelOverview.chartConfigApply
          }
        />
        <DefaultButton
          onClick={(): void => {
            this.setState({ metricSelectionFlyoutIsVisible: false });
          }}
          text={localization.ModelAssessment.ModelOverview.chartConfigCancel}
          ariaLabel={
            localization.ModelAssessment.ModelOverview.chartConfigCancel
          }
        />
      </Stack>
    );
  };

  private onMetricSelectionChange = (
    _: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
    item?: IChoiceGroupOption
  ): void => {
    if (item) {
      this.setState({ newlySelectedMetric: item.key.toString() });
    }
  };
}
