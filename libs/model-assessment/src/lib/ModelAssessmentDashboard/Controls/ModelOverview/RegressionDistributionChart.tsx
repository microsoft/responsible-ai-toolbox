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
  calculateBoxPlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  ErrorCohort,
  JointDataset,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IRegressionDistributionChartProps {
  cohorts: ErrorCohort[];
  onChooseCohorts: () => void;
}

interface IRegressionDistributionChartState {
  targetOption?: IChoiceGroupOption;
  newlySelectedTargetOption?: IChoiceGroupOption;
  targetFlyoutIsVisible: boolean;
}

export class RegressionDistributionChart extends React.Component<
  IRegressionDistributionChartProps,
  IRegressionDistributionChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  constructor(props: IRegressionDistributionChartProps) {
    super(props);
    this.state = { targetFlyoutIsVisible: false };
  }

  public componentDidMount(): void {
    if (this.state.targetOption === undefined) {
      const targetOptions = this.getTargetOptions();
      if (targetOptions.length > 0) {
        const firstOption = targetOptions[0];
        this.setState({
          newlySelectedTargetOption: firstOption,
          targetOption: firstOption
        });
      }
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

    const targetOptions = this.getTargetOptions();

    if (targetOptions.length === 0) {
      return React.Fragment;
    }

    if (this.state.targetOption === undefined) {
      this.setState({ targetOption: targetOptions[0] });
      return React.Fragment;
    }

    const noCohortSelected = this.props.cohorts.length === 0;

    const selectedCohortNames = this.props.cohorts.map(
      (cohort) => cohort.cohort.name
    );

    const boxPlotData = this.props.cohorts.map((cohort, index) => {
      return calculateBoxPlotDataFromErrorCohort(
        cohort,
        index,
        this.state.targetOption!.key.toString()
      );
    });
    const outlierData = boxPlotData
      .map((cohortBoxPlotData) => cohortBoxPlotData?.outliers)
      .map((outlierValues, cohortIndex) => {
        return outlierValues?.map((val) => [cohortIndex, val]);
      })
      .filter((list) => list !== undefined)
      .reduce((list1, list2) => list1!.concat(list2!), []);

    return (
      <Stack
        tokens={{ childrenGap: "10px" }}
        id="modelOverviewRegressionDistributionChart"
      >
        <Stack horizontal>
          {!noCohortSelected && (
            <Stack.Item className={classNames.verticalAxis}>
              <DefaultButton
                id="modelOverviewRegressionDistributionBoxChartCohortSelectionButton"
                className={classNames.rotatedVerticalBox}
                text={
                  localization.ModelAssessment.ModelOverview
                    .cohortSelectionButton
                }
                onClick={this.props.onChooseCohorts}
              />
            </Stack.Item>
          )}
          <Stack.Item className={classNames.chart}>
            {noCohortSelected && (
              <div className={classNames.placeholderText}>
                <Text>
                  {
                    localization.ModelAssessment.ModelOverview
                      .boxPlotPlaceholder
                  }
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
                        data: boxPlotData.map(
                          (boxData) => boxData as PointOptionsObject
                        ),
                        fillColor: theme.semanticColors.inputBackgroundChecked,
                        name: localization.ModelAssessment.ModelOverview.BoxPlot
                          .boxPlotSeriesLabel,
                        type: "boxplot"
                      },
                      {
                        data: outlierData,
                        name: localization.ModelAssessment.ModelOverview.BoxPlot
                          .outlierLabel,
                        tooltip: {
                          pointFormatter() {
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
                      title: { text: this.state.targetOption!.text }
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
                    onClick={() =>
                      this.setState({
                        targetFlyoutIsVisible: true
                      })
                    }
                  />
                </Stack.Item>
              </Stack>
            )}
          </Stack.Item>
        </Stack>
        <Panel
          id="modelOverviewRegressionDistributionChartLabelSelectionFlyout"
          isOpen={this.state.targetFlyoutIsVisible}
          closeButtonAriaLabel="Close"
          onDismiss={() => {
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

  private onRenderFooterContent = () => {
    return (
      <Stack horizontal tokens={{ childrenGap: "10px" }}>
        <PrimaryButton
          onClick={() => {
            if (this.state.newlySelectedTargetOption)
              this.setState({
                targetFlyoutIsVisible: false,
                targetOption: this.state.newlySelectedTargetOption
              });
          }}
          text={localization.ModelAssessment.ModelOverview.chartConfigApply}
        />
        <DefaultButton
          onClick={() => {
            this.setState({ targetFlyoutIsVisible: false });
          }}
          text={localization.ModelAssessment.ModelOverview.chartConfigCancel}
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

  private getTargetOptions(): IChoiceGroupOption[] {
    return [
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
  }
}
