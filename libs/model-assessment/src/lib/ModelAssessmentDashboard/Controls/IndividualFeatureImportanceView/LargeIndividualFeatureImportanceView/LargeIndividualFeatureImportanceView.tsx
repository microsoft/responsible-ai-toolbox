// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  generateDefaultChartAxes,
  getInitialClusterState,
  getScatterOption,
  IClusterData,
  IGenericChartProps,
  IHighchartsConfig,
  ILocalExplanations,
  instanceOfHighChart,
  IScatterPoint,
  ISelectorConfig,
  ModelAssessmentContext,
  OtherChartTypes
} from "@responsible-ai/core-ui";
import React from "react";

import { verticalComponentTokens } from "../IndividualFeatureImportanceView.styles";

import { getLocalExplanationsFromSDK } from "./getOnScatterPlotPointClick";
import {
  getInitialSpec,
  ILargeIndividualFeatureImportanceViewProps,
  ILargeIndividualFeatureImportanceViewState
} from "./ILargeIndividualFeatureImportanceViewSpec";
import { LargeIndividualFeatureImportanceChartArea } from "./LargeIndividualFeatureImportanceChartArea";
import {
  generateHighChartConfigOverride,
  getBubblePlotData,
  getErrorMessage,
  getNewChartProps,
  getNewSelections,
  instanceOfLocalExplanation,
  selectPointFromChartLargeData,
  shouldUpdateHighchart
} from "./largeIndividualFeatureImportanceViewUtils";
import { LocalImportanceChart } from "./LocalImportanceChart";

export class LargeIndividualFeatureImportanceView extends React.Component<
  ILargeIndividualFeatureImportanceViewProps,
  ILargeIndividualFeatureImportanceViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private changedKeys: string[] = [];

  public constructor(props: ILargeIndividualFeatureImportanceViewProps) {
    super(props);
    this.state = getInitialSpec();
  }

  public componentDidMount(): void {
    const chartProps = generateDefaultChartAxes(
      this.context.jointDataset,
      OtherChartTypes.Bubble
    );
    if (!this.state.chartProps) {
      this.setState({
        chartProps
      });
    }
  }

  public componentDidUpdate(
    prevProps: ILargeIndividualFeatureImportanceViewProps,
    prevState: ILargeIndividualFeatureImportanceViewState
  ): void {
    const [
      shouldUpdate,
      hasSelectedPointIndexesUpdated,
      hasIsLocalExplanationsDataLoadingUpdated,
      hasRevertToBubbleChartUpdated,
      hasCohortUpdated,
      hasChartPropsUpdated,
      hasAxisTypeChanged
    ] = shouldUpdateHighchart(
      prevState,
      prevProps,
      this.state,
      this.props,
      this.changedKeys
    );
    if (shouldUpdate) {
      this.state.chartProps
        ? generateHighChartConfigOverride(
            this.state.chartProps,
            hasSelectedPointIndexesUpdated,
            hasIsLocalExplanationsDataLoadingUpdated,
            hasRevertToBubbleChartUpdated,
            hasChartPropsUpdated,
            hasCohortUpdated,
            hasAxisTypeChanged,
            this.updateBubblePlotData,
            this.updateScatterPlotData
          )
        : this.setState({
            chartProps: this.state.chartProps
          });
    }
  }

  public render(): React.ReactNode {
    return (
      <Stack
        tokens={verticalComponentTokens}
        id="LargeIndividualFeatureImportanceView"
      >
        <LargeIndividualFeatureImportanceChartArea
          chartProps={this.state.chartProps}
          isBubbleChartDataLoading={this.state.isBubbleChartDataLoading}
          isBubbleChartRendered={this.state.isBubbleChartRendered}
          highChartConfigOverride={this.state.highChartConfigOverride}
          bubbleChartErrorMessage={this.state.bubbleChartErrorMessage}
          onXSet={this.onXSet}
          onYSet={this.onYSet}
          isLocalExplanationsDataLoading={
            this.state.isLocalExplanationsDataLoading
          }
          setIsRevertButtonClicked={this.setIsRevertButtonClicked}
          telemetryHook={this.props.telemetryHook}
        />
        {!this.state.isBubbleChartDataLoading && (
          <LocalImportanceChart
            rowNumber={this.state.selectedPointsIndexes[0]}
            data={this.state.localExplanationsData}
            isLocalExplanationsDataLoading={
              this.state.isLocalExplanationsDataLoading
            }
            localExplanationsErrorMessage={
              this.state.localExplanationsErrorMessage
            }
            selectedWeightVector={this.props.selectedWeightVector}
            onWeightChange={this.props.onWeightChange}
            weightOptions={this.props.weightOptions}
            weightLabels={this.props.weightLabels}
            modelType={this.props.modelType}
          />
        )}
      </Stack>
    );
  }

  private setIsRevertButtonClicked = (status: boolean): void => {
    this.setState({ isRevertButtonClicked: status });
  };

  private updateBubblePlotData = async (
    chartProps: IGenericChartProps,
    hasRevertToBubbleChartUpdated: boolean
  ): Promise<void> => {
    if (hasRevertToBubbleChartUpdated) {
      this.setState(
        {
          clusterData: getInitialClusterState(),
          isBubbleChartDataLoading: true,
          isLocalExplanationsDataLoading: false,
          localExplanationsData: undefined,
          localExplanationsErrorMessage: undefined,
          selectedPointsIndexes: []
        },
        () => {
          this.setState({
            chartProps,
            highChartConfigOverride: this.state.bubblePlotData,
            isBubbleChartDataLoading: false,
            isBubbleChartRendered: true,
            isRevertButtonClicked: false
          });
        }
      );
      return;
    }
    this.setState({
      clusterData: getInitialClusterState(),
      isBubbleChartDataLoading: true,
      isLocalExplanationsDataLoading: false,
      localExplanationsData: undefined,
      localExplanationsErrorMessage: undefined,
      selectedPointsIndexes: []
    });
    const datasetBubblePlotConfigOverride = await getBubblePlotData(
      chartProps,
      this.props.cohort,
      this.context.jointDataset,
      this.context.dataset,
      this.state.isLocalExplanationsDataLoading,
      this.context.requestBubblePlotData,
      this.selectPointFromChartLargeData,
      this.onBubbleClick,
      this.props.telemetryHook
    );
    if (
      datasetBubblePlotConfigOverride &&
      !instanceOfHighChart(datasetBubblePlotConfigOverride)
    ) {
      this.setState({
        bubbleChartErrorMessage: getErrorMessage(
          datasetBubblePlotConfigOverride
        ),
        highChartConfigOverride: undefined,
        isBubbleChartDataLoading: false
      });
      return;
    }
    this.setState({
      bubblePlotData: datasetBubblePlotConfigOverride,
      chartProps,
      highChartConfigOverride: datasetBubblePlotConfigOverride,
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      isRevertButtonClicked: false
    });
  };

  private updateScatterPlotData = (chartProps: IGenericChartProps): void => {
    const datasetBarConfigOverride = getScatterOption(
      this.state.clusterData,
      chartProps,
      this.context.jointDataset,
      this.state.selectedPointsIndexes,
      [],
      this.state.isLocalExplanationsDataLoading,
      true,
      false,
      this.selectPointFromChartLargeData
    );
    this.setState({
      chartProps,
      highChartConfigOverride: datasetBarConfigOverride,
      isBubbleChartRendered: false,
      isRevertButtonClicked: false
    });
  };

  private onBubbleClick = (
    scatterPlotData: IHighchartsConfig,
    clusterData: IClusterData
  ): void => {
    this.setState({
      clusterData,
      highChartConfigOverride: scatterPlotData,
      isBubbleChartRendered: false
    });
  };

  private onXSet = (value: ISelectorConfig): void => {
    if (this.state.chartProps) {
      const newProps = getNewChartProps(value, true, this.state.chartProps);
      this.setState({ chartProps: newProps });
    }
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (this.state.chartProps) {
      const newProps = getNewChartProps(value, false, this.state.chartProps);
      this.setState({ chartProps: newProps });
    }
  };

  private selectPointFromChartLargeData = async (
    data: IScatterPoint
  ): Promise<void> => {
    selectPointFromChartLargeData(
      data,
      this.setLocalExplanationsData,
      this.toggleSelectionOfPoint,
      this.props.telemetryHook
    );
  };

  private toggleSelectionOfPoint = (index?: number): number[] => {
    const newSelections = getNewSelections(
      this.state.selectedPointsIndexes,
      index
    );
    if (newSelections !== undefined) {
      this.setState({
        selectedPointsIndexes: newSelections
      });
    }
    return newSelections ?? [];
  };

  private setLocalExplanationsData = async (
    absoluteIndex: number
  ): Promise<void> => {
    this.setState({
      isLocalExplanationsDataLoading: true,
      localExplanationsErrorMessage: undefined
    });
    const localExplanationsData = await getLocalExplanationsFromSDK(
      absoluteIndex,
      this.context.requestLocalExplanations,
      this.props.telemetryHook
    );
    if (
      typeof localExplanationsData === "object" &&
      localExplanationsData &&
      !instanceOfLocalExplanation(localExplanationsData)
    ) {
      this.setState({
        isLocalExplanationsDataLoading: false,
        localExplanationsData: undefined,
        localExplanationsErrorMessage: getErrorMessage(localExplanationsData)
      });
      return;
    }
    this.setState({
      isLocalExplanationsDataLoading: false,
      localExplanationsData: localExplanationsData as ILocalExplanations
    });
  };
}
