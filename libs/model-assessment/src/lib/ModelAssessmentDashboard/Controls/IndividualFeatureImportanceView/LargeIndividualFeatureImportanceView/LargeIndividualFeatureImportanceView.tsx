// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  calculateBubblePlotDataFromErrorCohort,
  Cohort,
  defaultModelAssessmentContext,
  generateDefaultChartAxes,
  getScatterOption,
  hasAxisTypeChanged,
  IGenericChartProps,
  IHighchartBubbleSDKClusterData,
  IHighchartsConfig,
  ILocalExplanations,
  instanceOfHighChart,
  IScatterPoint,
  ISelectorConfig,
  ITelemetryEvent,
  JointDataset,
  ModelAssessmentContext,
  ModelTypes,
  OtherChartTypes,
  TelemetryEventName,
  TelemetryLevels,
  WeightVectorOption
} from "@responsible-ai/core-ui";
import _ from "lodash";
import React from "react";

import { verticalComponentTokens } from "../IndividualFeatureImportanceView.styles";

import { getLocalExplanationsFromSDK } from "./getOnScatterPlotPointClick";
import { LargeIndividualFeatureImportanceChartArea } from "./LargeIndividualFeatureImportanceChartArea";
import { LocalImportanceChart } from "./LocalImportanceChart";

export interface ILargeIndividualFeatureImportanceViewProps {
  cohort: Cohort;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  modelType: ModelTypes;
  telemetryHook?: (message: ITelemetryEvent) => void;
  onWeightChange: (option: WeightVectorOption) => void;
}

export interface ILargeIndividualFeatureImportanceViewState {
  chartProps?: IGenericChartProps;
  highChartConfigOverride?: any;
  isBubbleChartRendered?: boolean;
  xSeries: number[];
  ySeries: number[];
  indexSeries: number[];
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isRevertButtonClicked: boolean;
  selectedPointsIndexes: number[];
  localExplanationsData: any;
  isLocalExplanationsDataLoading?: boolean;
  localExplanationsErrorMessage?: string;
}

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
    this.state = {
      bubbleChartErrorMessage: undefined,
      indexSeries: [],
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      isLocalExplanationsDataLoading: false,
      isRevertButtonClicked: false,
      localExplanationsData: undefined,
      localExplanationsErrorMessage: undefined,
      selectedPointsIndexes: [],
      xSeries: [],
      ySeries: []
    };
  }

  public componentDidMount(): void {
    const chartProps = generateDefaultChartAxes(
      this.context.jointDataset,
      OtherChartTypes.Bubble
    );
    this.generateHighChartConfigOverride(
      chartProps,
      false,
      false,
      false,
      true,
      false,
      false
    );
  }

  public componentDidUpdate(
    prevProps: ILargeIndividualFeatureImportanceViewProps,
    prevState: ILargeIndividualFeatureImportanceViewState
  ): void {
    const hasSelectedPointIndexesUpdated = !_.isEqual(
      this.state.selectedPointsIndexes,
      prevState.selectedPointsIndexes
    );
    const hasIsLocalExplanationsDataLoadingUpdated = !_.isEqual(
      this.state.isLocalExplanationsDataLoading,
      prevState.isLocalExplanationsDataLoading
    );
    const hasRevertToBubbleChartUpdated =
      this.state.isRevertButtonClicked &&
      prevState.isRevertButtonClicked !== this.state.isRevertButtonClicked;
    const hasCohortUpdated = this.props.cohort.name !== prevProps.cohort.name;
    const hasChartPropsUpdated = !_.isEqual(
      this.state.chartProps,
      prevState.chartProps
    );
    const hasAxisTypeChanged = this.hasAxisTypeChanged(prevState.chartProps);
    if (
      hasRevertToBubbleChartUpdated ||
      hasSelectedPointIndexesUpdated ||
      hasChartPropsUpdated ||
      hasIsLocalExplanationsDataLoadingUpdated ||
      hasCohortUpdated ||
      hasAxisTypeChanged
    ) {
      this.generateHighChartConfigOverride(
        this.state.chartProps,
        hasSelectedPointIndexesUpdated,
        hasIsLocalExplanationsDataLoadingUpdated,
        hasRevertToBubbleChartUpdated,
        hasChartPropsUpdated,
        hasCohortUpdated,
        hasAxisTypeChanged
      );
    }
  }

  public render(): React.ReactNode {
    return (
      <Stack
        tokens={verticalComponentTokens}
        id="IndividualFeatureImportanceView"
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
        />
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
      </Stack>
    );
  }

  private setIsRevertButtonClicked = (status: boolean): void => {
    this.setState({ isRevertButtonClicked: status });
  };

  private async generateHighChartConfigOverride(
    chartProps: IGenericChartProps | undefined,
    hasSelectedPointIndexesUpdated: boolean,
    hasIsLocalExplanationsDataLoadingUpdated: boolean,
    hasRevertToBubbleChartUpdated: boolean,
    hasChartPropsUpdated: boolean,
    hasCohortUpdated: boolean,
    hasAxisTypeChanged: boolean
  ): Promise<void> {
    if (chartProps) {
      if (hasCohortUpdated || hasRevertToBubbleChartUpdated) {
        this.updateBubblePlotData(chartProps);
        return;
      }
      if (hasAxisTypeChanged) {
        this.updateScatterPlotData(chartProps);
        return;
      }
      if (hasChartPropsUpdated) {
        this.updateBubblePlotData(chartProps);
        return;
      }
      if (
        hasSelectedPointIndexesUpdated ||
        hasIsLocalExplanationsDataLoadingUpdated
      ) {
        this.updateScatterPlotData(chartProps);
        return;
      }
    } else {
      this.setState({
        chartProps
      });
    }
  }

  private updateBubblePlotData = async (
    chartProps?: IGenericChartProps
  ): Promise<void> => {
    if (chartProps) {
      this.setState({
        indexSeries: [],
        isBubbleChartDataLoading: true,
        isLocalExplanationsDataLoading: false,
        localExplanationsData: undefined,
        localExplanationsErrorMessage: undefined,
        selectedPointsIndexes: [],
        xSeries: [],
        ySeries: []
      });
      const datasetBarConfigOverride = await this.getBubblePlotData(chartProps);
      if (
        datasetBarConfigOverride &&
        !instanceOfHighChart(datasetBarConfigOverride)
      ) {
        this.setErrorStatus(datasetBarConfigOverride);
        return;
      }
      this.setState({
        chartProps,
        highChartConfigOverride: datasetBarConfigOverride,
        isBubbleChartDataLoading: false,
        isBubbleChartRendered: true,
        isRevertButtonClicked: false
      });
    }
  };

  private updateScatterPlotData = (chartProps: IGenericChartProps): void => {
    const datasetBarConfigOverride = this.getScatterPlotData(chartProps);
    this.setState({
      chartProps,
      highChartConfigOverride: datasetBarConfigOverride,
      isBubbleChartRendered: false,
      isRevertButtonClicked: false
    });
  };

  private getBubblePlotData = async (
    chartProps: IGenericChartProps
  ): Promise<
    IHighchartBubbleSDKClusterData | IHighchartsConfig | undefined
  > => {
    return await calculateBubblePlotDataFromErrorCohort(
      this.props.cohort,
      chartProps,
      [],
      this.context.jointDataset,
      this.context.dataset,
      this.state.isLocalExplanationsDataLoading,
      true,
      false,
      this.context.requestBubblePlotData,
      this.selectPointFromChartLargeData,
      this.onBubbleClick,
      undefined
    );
  };

  private getScatterPlotData = (
    chartProps: IGenericChartProps
  ): IHighchartsConfig | undefined => {
    return getScatterOption(
      this.state.xSeries,
      this.state.ySeries,
      this.state.indexSeries,
      chartProps,
      this.context.jointDataset,
      this.state.selectedPointsIndexes,
      [],
      this.state.isLocalExplanationsDataLoading,
      true,
      false,
      this.selectPointFromChartLargeData
    );
  };

  private readonly hasAxisTypeChanged = (
    prevChartProps?: IGenericChartProps
  ): boolean => {
    if (this.state.chartProps && prevChartProps) {
      this.changedKeys = [];
      this.compareChartProps(prevChartProps, this.state.chartProps);
      return hasAxisTypeChanged(this.changedKeys);
    }
    return false;
  };

  private compareChartProps = (
    newProps: IGenericChartProps,
    oldProps: IGenericChartProps
  ): void => {
    for (const key in newProps) {
      if (typeof newProps[key] === "object") {
        this.compareChartProps(newProps[key], oldProps[key]);
      }
      if (newProps[key] !== oldProps[key]) {
        this.changedKeys.push(key);
      }
    }
  };

  private setErrorStatus = (datasetBarConfigOverride: any): void => {
    this.setState({
      bubbleChartErrorMessage: datasetBarConfigOverride
        .toString()
        .split(":")
        .pop(),
      highChartConfigOverride: undefined,
      isBubbleChartDataLoading: false
    });
  };

  private onBubbleClick = (
    scatterPlotData: IHighchartsConfig,
    xSeries: number[],
    ySeries: number[],
    indexSeries: number[]
  ): void => {
    // if (!this.state.chartProps) {
    //   return;
    // }
    // const newProps = _.cloneDeep(this.state.chartProps);
    // newProps.chartType = ChartTypes.Scatter;
    this.setState({
      highChartConfigOverride: scatterPlotData,
      indexSeries,
      isBubbleChartRendered: false,
      xSeries,
      ySeries
      //  chartProps: newProps
    });
  };

  private onXSet = (value: ISelectorConfig): void => {
    if (!this.state.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.state.chartProps);
    newProps.xAxis = value;
    this.setState({ chartProps: newProps });
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (!this.state.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.state.chartProps);
    newProps.yAxis = value;
    this.setState({ chartProps: newProps });
  };

  private selectPointFromChartLargeData = async (
    data: IScatterPoint
  ): Promise<void> => {
    const index = data.customData[JointDataset.IndexLabel];
    const absoluteIndex = data.customData[JointDataset.AbsoluteIndexLabel];
    this.setLocalExplanationsData(absoluteIndex);
    this.toggleSelectionOfPoint(index);
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.FeatureImportancesNewDatapointSelectedFromChart
    });
  };

  private toggleSelectionOfPoint = (index?: number): void => {
    if (index === undefined) {
      return;
    }
    const indexOf = this.state.selectedPointsIndexes.indexOf(index);
    let newSelections = [...this.state.selectedPointsIndexes];
    if (indexOf === -1) {
      newSelections = [index];
    } else {
      newSelections.splice(indexOf, 1);
    }
    this.setState({
      selectedPointsIndexes: newSelections
    });
  };

  private setLocalExplanationsData = async (
    absoluteIndex?: number
  ): Promise<void> => {
    if (absoluteIndex) {
      this.setState({
        isLocalExplanationsDataLoading: true,
        localExplanationsErrorMessage: undefined
      });
      const localExplanationsData = await getLocalExplanationsFromSDK(
        absoluteIndex,
        this.context.requestLocalExplanations
      );
      if (
        typeof localExplanationsData === "object" &&
        localExplanationsData &&
        !instanceOfLocalExplanation(localExplanationsData)
      ) {
        this.setState({
          isLocalExplanationsDataLoading: false,
          localExplanationsData: undefined,
          localExplanationsErrorMessage: localExplanationsData
            .toString()
            .split(":")
            .pop()
        });
        return;
      }
      this.setState({
        isLocalExplanationsDataLoading: false,
        localExplanationsData
      });
    }
  };
}

export function instanceOfLocalExplanation(
  object: any
): object is ILocalExplanations {
  return "method" in object;
}
