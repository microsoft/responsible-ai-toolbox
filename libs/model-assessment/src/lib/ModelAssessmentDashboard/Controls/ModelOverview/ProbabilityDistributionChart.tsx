// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
import {
  DefaultButton,
  ChoiceGroup,
  getTheme,
  IChoiceGroupOption,
  Panel,
  Stack,
  Text,
  PrimaryButton
} from "office-ui-fabric-react";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IProbabilityDistributionChartProps {
  cohorts: ErrorCohort[];
  selectedCohorts: number[];
  onChooseCohorts: () => void;
}

interface IProbabilityDistributionChartState {
  probabilityOption?: IChoiceGroupOption;
  newlySelectedProbabilityOption?: IChoiceGroupOption;
  probabilityFlyoutIsVisible: boolean;
}

export class ProbabilityDistributionChart extends React.Component<
  IProbabilityDistributionChartProps,
  IProbabilityDistributionChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  constructor(props: IProbabilityDistributionChartProps) {
    super(props);
    this.state = { probabilityFlyoutIsVisible: false };
  }

  public componentDidMount(): void {
    if (this.state.probabilityOption === undefined) {
      const probabilityOptions = this.getProbabilityOptions();
      if (probabilityOptions.length > 0) {
        const firstOption = probabilityOptions[0];
        this.setState({
          newlySelectedProbabilityOption: firstOption,
          probabilityOption: firstOption
        });
      }
    }
  }

  public render(): React.ReactNode {
    const classNames = modelOverviewChartStyles();
    if (!this.context.jointDataset.hasPredictedProbabilities) {
      return;
    }
    const theme = getTheme();

    const selectedCohorts = this.props.cohorts.filter((_cohort, index) => {
      return this.props.selectedCohorts.includes(index);
    });
    const selectedCohortNames = selectedCohorts.map(
      (cohort) => cohort.cohort.name
    );

    const probabilityOptions = this.getProbabilityOptions();

    if (probabilityOptions.length === 0) {
      return React.Fragment;
    }

    if (this.state.probabilityOption === undefined) {
      this.setState({ probabilityOption: probabilityOptions[0] });
      return React.Fragment;
    }

    const boxPlotData = selectedCohorts.map((cohort, index) => {
      return calculateBoxPlotDataFromErrorCohort(
        cohort,
        index,
        this.state.probabilityOption!.key.toString()
      );
    });
    const outlierData = boxPlotData
      .map((cohortBoxPlotData) => cohortBoxPlotData?.outliers)
      .map((outlierProbs, cohortIndex) => {
        return outlierProbs?.map((prob) => [cohortIndex, prob]);
      })
      .filter((list) => list !== undefined)
      .reduce((list1, list2) => list1!.concat(list2!), []);

    const noCohortSelected = this.props.selectedCohorts.length === 0;

    return (
      <>
        <Stack horizontal>
          {!noCohortSelected && (
            <Stack.Item className={classNames.verticalAxis}>
              <DefaultButton
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
                  id={"ProbabilityDistributionChart"}
                  theme={theme}
                  configOverride={{
                    chart: {
                      height: selectedCohorts.length * 40 + 120,
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
                        fillColor: "#b2d6f2",
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
                      title: { text: this.state.probabilityOption!.text }
                    }
                  }}
                />
                <Stack.Item className={classNames.horizontalAxis}>
                  <DefaultButton
                    text={
                      localization.ModelAssessment.ModelOverview
                        .probabilityLabelSelectionButton
                    }
                    onClick={() =>
                      this.setState({
                        probabilityFlyoutIsVisible: true
                      })
                    }
                  />
                </Stack.Item>
              </Stack>
            )}
          </Stack.Item>
        </Stack>
        <Panel
          isOpen={this.state.probabilityFlyoutIsVisible}
          closeButtonAriaLabel="Close"
          onDismiss={() => {
            this.setState({ probabilityFlyoutIsVisible: false });
          }}
        >
          <Stack tokens={{ childrenGap: "10px" }}>
            <ChoiceGroup
              className={classNames.chartConfigDropdown}
              label={
                localization.ModelAssessment.ModelOverview
                  .probabilityForClassSelectionHeader
              }
              options={probabilityOptions}
              onChange={this.onProbabilityOptionSelectionChange}
              selectedKey={this.state.newlySelectedProbabilityOption?.key}
            />
            <Stack horizontal tokens={{ childrenGap: "10px" }}>
              <PrimaryButton
                onClick={() => {
                  if (this.state.newlySelectedProbabilityOption)
                    this.setState({
                      probabilityFlyoutIsVisible: false,
                      probabilityOption:
                        this.state.newlySelectedProbabilityOption
                    });
                }}
                text={
                  localization.ModelAssessment.ModelOverview.chartConfigConfirm
                }
              />
              <DefaultButton
                onClick={() => {
                  this.setState({ probabilityFlyoutIsVisible: false });
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

  private onProbabilityOptionSelectionChange = (
    _: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
    item?: IChoiceGroupOption
  ): void => {
    if (item) {
      this.setState({ newlySelectedProbabilityOption: item });
    }
  };

  private getProbabilityOptions(): IChoiceGroupOption[] {
    return new Array(this.context.jointDataset.predictionClassCount)
      .fill(0)
      .map((_, index) => {
        const key = JointDataset.ProbabilityYRoot + index.toString();
        return {
          key,
          text: this.context.jointDataset.metaDict[key].label
        };
      });
  }
}
