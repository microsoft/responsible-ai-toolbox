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
  Toggle
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ErrorCohort,
  ITelemetryEvent,
  JointDataset,
  ModelAssessmentContext,
  TelemetryEventName,
  TelemetryLevels,
  IBoxChartState
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";
import { ProbabilityDistributionBoxChart } from "./ProbabilityDistributionBoxChart";
import { ProbabilityDistributionSplineChart } from "./ProbabilityDistributionSplineChart";

interface IProbabilityDistributionChartProps {
  boxPlotState: IBoxChartState;
  cohorts: ErrorCohort[];
  showSplineChart: boolean;
  onBoxPlotStateUpdate: (boxPlotState: IBoxChartState) => void;
  onChooseCohorts: () => void;
  onToggleChange: (checked: boolean) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
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

  public constructor(props: IProbabilityDistributionChartProps) {
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
      return React.Fragment;
    }

    const probabilityOptions = this.getProbabilityOptions();

    if (probabilityOptions.length === 0) {
      return React.Fragment;
    }

    if (this.state.probabilityOption === undefined) {
      return React.Fragment;
    }

    const noCohortSelected = this.props.cohorts.length === 0;
    const showChooseCohortsButton =
      this.props.showSplineChart ||
      (!noCohortSelected && !this.props.showSplineChart);

    return (
      <Stack
        tokens={{ childrenGap: "10px" }}
        id="modelOverviewProbabilityDistributionChart"
      >
        <Stack
          horizontal
          tokens={{ childrenGap: "10px", padding: "10px 0 0 0" }}
          className={classNames.splineButtons}
        >
          <Stack.Item className={classNames.chartToggle}>
            <Toggle
              id="modelOverviewProbabilityDistributionChartToggle"
              label={
                localization.ModelAssessment.ModelOverview
                  .probabilitySplineChartToggleLabel
              }
              inlineLabel
              onChange={this.onSplineChartToggleChange}
              checked={this.props.showSplineChart}
            />
          </Stack.Item>
          {showChooseCohortsButton && (
            <DefaultButton
              id="modelOverviewProbabilityDistributionCohortSelectionButton"
              text={
                localization.ModelAssessment.ModelOverview.cohortSelectionButton
              }
              onClick={this.props.onChooseCohorts}
            />
          )}
        </Stack>
        <Stack className={classNames.chart}>
          {noCohortSelected && (
            <div className={classNames.placeholderText}>
              <Text>
                {localization.ModelAssessment.ModelOverview.boxPlotPlaceholder}
              </Text>
            </div>
          )}
          {!noCohortSelected && (
            <Stack>
              {this.props.showSplineChart ? (
                <ProbabilityDistributionSplineChart
                  selectedCohorts={this.props.cohorts}
                  probabilityOption={this.state.probabilityOption}
                />
              ) : (
                <ProbabilityDistributionBoxChart
                  boxPlotState={this.props.boxPlotState}
                  selectedCohorts={this.props.cohorts}
                  probabilityOption={this.state.probabilityOption}
                  onBoxPlotStateUpdate={this.props.onBoxPlotStateUpdate}
                />
              )}
              <Stack.Item
                className={
                  this.props.showSplineChart
                    ? classNames.horizontalAxisNoExtraLeftPadding
                    : classNames.horizontalAxis
                }
              >
                <DefaultButton
                  id="modelOverviewProbabilityDistributionChartLabelSelectionButton"
                  text={
                    localization.ModelAssessment.ModelOverview
                      .probabilityLabelSelectionButton
                  }
                  onClick={(): void =>
                    this.setState({
                      probabilityFlyoutIsVisible: true
                    })
                  }
                />
              </Stack.Item>
            </Stack>
          )}
        </Stack>
        <Panel
          id="modelOverviewProbabilityDistributionChartLabelSelectionFlyout"
          isOpen={this.state.probabilityFlyoutIsVisible}
          closeButtonAriaLabel="Close"
          onDismiss={(): void => {
            this.setState({ probabilityFlyoutIsVisible: false });
          }}
          onRenderFooterContent={this.onRenderFooterContent}
          isFooterAtBottom
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
          </Stack>
        </Panel>
      </Stack>
    );
  }

  private onRenderFooterContent = (): React.ReactElement => {
    return (
      <Stack horizontal tokens={{ childrenGap: "10px" }}>
        <PrimaryButton
          onClick={(): void => {
            if (this.state.newlySelectedProbabilityOption) {
              this.setState({
                probabilityFlyoutIsVisible: false,
                probabilityOption: this.state.newlySelectedProbabilityOption
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
            this.setState({ probabilityFlyoutIsVisible: false });
          }}
          text={localization.ModelAssessment.ModelOverview.chartConfigCancel}
          ariaLabel={
            localization.ModelAssessment.ModelOverview.chartConfigCancel
          }
        />
      </Stack>
    );
  };

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
          id: index.toString(),
          key,
          text: this.context.jointDataset.metaDict[key].label
        };
      });
  }

  private onSplineChartToggleChange = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    checked?: boolean | undefined
  ): void => {
    if (checked !== undefined) {
      this.props.onToggleChange(checked);
      this.props.telemetryHook?.({
        level: TelemetryLevels.ButtonClick,
        type: TelemetryEventName.ModelOverviewSplineChartToggleUpdated
      });
    }
  };
}
