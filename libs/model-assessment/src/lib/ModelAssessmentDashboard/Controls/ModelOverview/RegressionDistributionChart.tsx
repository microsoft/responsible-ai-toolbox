// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DefaultButton,
  ChoiceGroup,
  IChoiceGroupOption,
  Panel,
  Stack,
  Text,
  PrimaryButton,
  getTheme
} from "@fluentui/react";
import {
  BasicHighChart,
  boxChartTooltipDefaultSetting,
  calculateBoxPlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  JointDataset,
  ModelAssessmentContext,
  setOutlierDataIfChanged,
  IBoxChartState,
  ifEnableLargeData
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
import _ from "lodash";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IRegressionDistributionChartProps {
  cohorts: ErrorCohort[];
  onChooseCohorts: () => void;
  boxPlotState: IBoxChartState;
  onBoxPlotStateUpdate: (boxPlotState: IBoxChartState) => void;
}

interface IRegressionDistributionChartState {
  targetOption?: IChoiceGroupOption;
  newlySelectedTargetOption?: IChoiceGroupOption;
  targetFlyoutIsVisible: boolean;
}

const targetOptions: IChoiceGroupOption[] = [
  {
    key: JointDataset.PredictedYLabel,
    text: localization.ModelAssessment.ModelOverview.regressionTargetOptions
      .predictedY
  },
  {
    key: JointDataset.TrueYLabel,
    text: localization.ModelAssessment.ModelOverview.regressionTargetOptions
      .trueY
  },
  {
    key: JointDataset.RegressionError,
    text: localization.ModelAssessment.ModelOverview.regressionTargetOptions
      .error
  }
];

export class RegressionDistributionChart extends React.Component<
  IRegressionDistributionChartProps,
  IRegressionDistributionChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IRegressionDistributionChartProps) {
    super(props);
    this.state = { targetFlyoutIsVisible: false };
  }

  public componentDidMount(): void {
    if (this.state.targetOption === undefined) {
      const firstOption = targetOptions[0];
      this.setState({
        newlySelectedTargetOption: firstOption,
        targetOption: firstOption
      });
    }
  }

  public async componentDidUpdate(
    prevProps: IRegressionDistributionChartProps,
    prevState: IRegressionDistributionChartState
  ): Promise<void> {
    if (
      this.props.boxPlotState.boxPlotData.length === 0 ||
      !_.isEqual(prevProps.cohorts, this.props.cohorts) ||
      prevState.targetOption !== this.state.targetOption
    ) {
      const targetOption = this.state.targetOption
        ? this.state.targetOption
        : targetOptions[0];
      const boxPlotData = this.props.cohorts.map(
        (cohort: ErrorCohort, index: number) => {
          return calculateBoxPlotDataFromErrorCohort(
            cohort,
            index,
            targetOption?.key.toString(),
            targetOption?.text,
            this.context.requestBoxPlotDistribution,
            ifEnableLargeData(this.context.dataset)
          );
        }
      );
      setOutlierDataIfChanged(
        boxPlotData,
        this.props.boxPlotState,
        this.props.onBoxPlotStateUpdate
      );
    }
  }

  public render(): React.ReactNode {
    const theme = getTheme();
    const classNames = modelOverviewChartStyles();
    if (
      !this.context.jointDataset.hasTrueY ||
      !this.context.jointDataset.hasPredictedY
    ) {
      return;
    }

    if (targetOptions.length === 0 || this.state.targetOption === undefined) {
      return React.Fragment;
    }

    const noCohortSelected = this.props.cohorts.length === 0;
    const selectedCohortNames = this.props.cohorts.map(
      (cohort) => cohort.cohort.name
    );

    return (
      <Stack
        tokens={{ childrenGap: "10px" }}
        id="modelOverviewRegressionDistributionChart"
      >
        {!noCohortSelected && (
          <Stack.Item className={classNames.cohortSelectionButton}>
            <DefaultButton
              id="modelOverviewRegressionDistributionBoxChartCohortSelectionButton"
              text={
                localization.ModelAssessment.ModelOverview.cohortSelectionButton
              }
              onClick={this.props.onChooseCohorts}
            />
          </Stack.Item>
        )}
        <Stack.Item className={classNames.chart}>
          {noCohortSelected && (
            <div className={classNames.placeholderText}>
              <Text>
                {localization.ModelAssessment.ModelOverview.boxPlotPlaceholder}
              </Text>
            </div>
          )}
          {!noCohortSelected && (
            <Stack>
              <BasicHighChart
                id={"RegressionDistributionBoxChart"}
                theme={theme}
                configOverride={{
                  chart: {
                    height: this.props.cohorts.length * 40 + 120,
                    inverted: true,
                    type: "boxplot"
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
                      data: this.props.boxPlotState.boxPlotData.map(
                        (boxData) => boxData as PointOptionsObject
                      ),
                      fillColor: theme.semanticColors.inputBackgroundChecked,
                      name: localization.ModelAssessment.ModelOverview.BoxPlot
                        .boxPlotSeriesLabel,
                      tooltip: boxChartTooltipDefaultSetting,
                      type: "boxplot"
                    },
                    {
                      data: this.props.boxPlotState.outlierData,
                      name: localization.ModelAssessment.ModelOverview.BoxPlot
                        .outlierLabel,
                      tooltip: {
                        pointFormatter(): string {
                          return `${localization.ModelAssessment.ModelOverview.BoxPlot.outlierProbability}: <b>${this.y}</b>`;
                        }
                      },
                      type: "scatter"
                    }
                  ],
                  xAxis: {
                    categories: selectedCohortNames
                  },
                  yAxis: {
                    title: {
                      text: this.state.targetOption
                        ? this.state.targetOption.text
                        : targetOptions[0].text
                    }
                  }
                }}
              />
              <Stack.Item className={classNames.horizontalAxis}>
                <DefaultButton
                  id="modelOverviewRegressionDistributionChartLabelSelectionButton"
                  text={
                    localization.ModelAssessment.ModelOverview
                      .regressionTargetSelectionButton
                  }
                  onClick={(): void =>
                    this.setState({
                      targetFlyoutIsVisible: true
                    })
                  }
                />
              </Stack.Item>
            </Stack>
          )}
        </Stack.Item>
        <Panel
          id="modelOverviewRegressionDistributionChartLabelSelectionFlyout"
          isOpen={this.state.targetFlyoutIsVisible}
          closeButtonAriaLabel="Close"
          onDismiss={(): void => {
            this.setState({ targetFlyoutIsVisible: false });
          }}
          onRenderFooterContent={this.onRenderFooterContent}
          isFooterAtBottom
        >
          <Stack tokens={{ childrenGap: "10px" }}>
            <ChoiceGroup
              className={classNames.chartConfigDropdown}
              label={
                localization.ModelAssessment.ModelOverview.targetSelectionHeader
              }
              options={targetOptions}
              onChange={this.onTargetOptionSelectionChange}
              selectedKey={this.state.newlySelectedTargetOption?.key}
            />
          </Stack>
        </Panel>
      </Stack>
    );
  }

  private onRenderFooterContent = (): JSX.Element => {
    return (
      <Stack horizontal tokens={{ childrenGap: "10px" }}>
        <PrimaryButton
          onClick={(): void => {
            if (this.state.newlySelectedTargetOption) {
              this.setState({
                targetFlyoutIsVisible: false,
                targetOption: this.state.newlySelectedTargetOption
              });
            }
          }}
          text={localization.ModelAssessment.ModelOverview.chartConfigApply}
          ariaLabel={
            localization.ModelAssessment.ModelOverview.chartConfigApply
          }
        />
        <DefaultButton
          onClick={(): void => {
            this.setState({ targetFlyoutIsVisible: false });
          }}
          text={localization.ModelAssessment.ModelOverview.chartConfigCancel}
          ariaLabel={
            localization.ModelAssessment.ModelOverview.chartConfigCancel
          }
        />
      </Stack>
    );
  };

  private onTargetOptionSelectionChange = (
    _: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
    item?: IChoiceGroupOption
  ): void => {
    if (item) {
      this.setState({ newlySelectedTargetOption: item });
    }
  };
}
