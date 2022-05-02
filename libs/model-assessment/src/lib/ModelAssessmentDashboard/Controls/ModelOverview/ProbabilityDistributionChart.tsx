// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ErrorCohort,
  JointDataset,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  DefaultButton,
  ChoiceGroup,
  IChoiceGroupOption,
  Panel,
  Stack,
  Text,
  PrimaryButton,
  Toggle
} from "office-ui-fabric-react";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";
import { ProbabilityDistributionBoxChart } from "./ProbabilityDistributionBoxChart";
import { ProbabilityDistributionLineChart } from "./ProbabilityDistributionLineChart";

interface IProbabilityDistributionChartProps {
  cohorts: ErrorCohort[];
  selectedCohorts: number[];
  onChooseCohorts: () => void;
}

interface IProbabilityDistributionChartState {
  probabilityOption?: IChoiceGroupOption;
  newlySelectedProbabilityOption?: IChoiceGroupOption;
  probabilityFlyoutIsVisible: boolean;
  showLineChart: boolean;
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
    this.state = { probabilityFlyoutIsVisible: false, showLineChart: false };
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

    const selectedCohorts = this.props.cohorts.filter((_cohort, index) => {
      return this.props.selectedCohorts.includes(index);
    });

    const probabilityOptions = this.getProbabilityOptions();

    if (probabilityOptions.length === 0) {
      return React.Fragment;
    }

    if (this.state.probabilityOption === undefined) {
      this.setState({ probabilityOption: probabilityOptions[0] });
      return React.Fragment;
    }

    const noCohortSelected = this.props.selectedCohorts.length === 0;

    return (
      <Stack tokens={{ childrenGap: "10px" }}>
        <Stack
          horizontal
          tokens={{ childrenGap: "10px", padding: "10px 0 0 0" }}
        >
          <Stack.Item className={classNames.chartToggle}>
            <Toggle
              label={
                localization.ModelAssessment.ModelOverview
                  .probabilityLineChartToggleLabel
              }
              inlineLabel
              onChange={this.onLineChartToggleChange}
            />
          </Stack.Item>
          {this.state.showLineChart && (
            <DefaultButton
              text={
                localization.ModelAssessment.ModelOverview.cohortSelectionButton
              }
              onClick={this.props.onChooseCohorts}
            />
          )}
        </Stack>
        <Stack horizontal>
          {!noCohortSelected && !this.state.showLineChart && (
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
                {this.state.showLineChart ? (
                  <ProbabilityDistributionLineChart
                    selectedCohorts={selectedCohorts}
                    probabilityOption={this.state.probabilityOption}
                  />
                ) : (
                  <ProbabilityDistributionBoxChart
                    selectedCohorts={selectedCohorts}
                    probabilityOption={this.state.probabilityOption}
                  />
                )}
                <Stack.Item
                  className={
                    this.state.showLineChart
                      ? classNames.horizontalAxisNoExtraLeftPadding
                      : classNames.horizontalAxis
                  }
                >
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
      </Stack>
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

  private onLineChartToggleChange = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    checked?: boolean | undefined
  ) => {
    if (checked !== undefined) {
      this.setState({ showLineChart: checked });
    }
  };
}
