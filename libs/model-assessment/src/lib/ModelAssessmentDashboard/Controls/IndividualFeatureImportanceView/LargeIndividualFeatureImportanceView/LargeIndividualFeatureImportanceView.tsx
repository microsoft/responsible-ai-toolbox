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
  ifEnableLargeData,
  IGenericChartProps,
  IHighchartBubbleSDKClusterData,
  IHighchartsConfig,
  instanceOfHighChart,
  IScatterPoint,
  ISelectorConfig,
  ITelemetryEvent,
  JointDataset,
  ModelAssessmentContext,
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
      isBubbleChartRendered: false,
      isRevertButtonClicked: false,
      xSeries: [],
      ySeries: [],
      selectedPointsIndexes: [],
      localExplanationsData: undefined,
      isLocalExplanationsDataLoading: false,
      localExplanationsErrorMessage: undefined
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
      false
    );
  }

  public componentDidUpdate(
    prevProps: ILargeIndividualFeatureImportanceViewProps,
    prevState: ILargeIndividualFeatureImportanceViewState
  ): void {
    // if (
    //   this.props.cohort.name !== prevProps.cohort.name ||
    //   (this.state.isRevertButtonClicked &&
    //     prevState.isRevertButtonClicked !== this.state.isRevertButtonClicked)
    // ) {
    //   this.updateBubblePlotData(this.state.chartProps);
    //   return;
    // }

    // if (this.hasAxisTypeChanged(prevState.chartProps)) {
    //   this.updateScatterPlotData();
    //   return;
    // }
    // if (!_.isEqual(prevState.chartProps, this.state.chartProps)) {
    //   this.updateBubblePlotData();
    //   return;
    // }
    // if (this.shouldUpdateScatterPlot(prevState)) {
    //   this.updateScatterPlotData();
    // }

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
    if (
      hasRevertToBubbleChartUpdated ||
      hasSelectedPointIndexesUpdated ||
      hasChartPropsUpdated ||
      hasIsLocalExplanationsDataLoadingUpdated ||
      hasCohortUpdated
    ) {
      this.generateHighChartConfigOverride(
        this.state.chartProps,
        hasSelectedPointIndexesUpdated,
        hasIsLocalExplanationsDataLoadingUpdated,
        hasRevertToBubbleChartUpdated,
        hasChartPropsUpdated,
        hasCohortUpdated
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
        />
      </Stack>
    );
  }

  private async generateHighChartConfigOverride(
    chartProps: IGenericChartProps | undefined,
    hasSelectedPointIndexesUpdated: boolean,
    hasIsLocalExplanationsDataLoadingUpdated: boolean,
    hasRevertToBubbleChartUpdated: boolean,
    hasChartPropsUpdated: boolean,
    hasCohortUpdated: boolean
  ): Promise<void> {
    if (chartProps) {
      const hasAxisTypeChanged = this.hasAxisTypeChanged(chartProps);
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
      // if (
      //   !hasAxisTypeChanged ||
      //   hasRevertToBubbleChartUpdated ||
      //   hasCohortUpdated
      // ) {
      //   this.updateBubblePlotData(chartProps);
      // } else if (
      //   !this.state.isBubbleChartRendered &&
      //   hasSelectedPointIndexesUpdated
      // ) {
      //   this.updateScatterPlotData(chartProps);
      // }
      // if (chartProps.chartType === OtherChartTypes.Bubble) {
      //   if (!hasAxisTypeChanged) {
      //     this.updateBubblePlotData(chartProps);
      //     return;
      //   }
      //   // } else {
      //   //   this.updateScatterPlotData();
      //   // }
      // } else if (chartProps.chartType === ChartTypes.Scatter) {
      //   if (
      //     hasAxisTypeChanged ||
      //     hasSelectedPointIndexesUpdated ||
      //     hasIsLocalExplanationsDataLoadingUpdated
      //   ) {
      //     this.updateScatterPlotData(chartProps);
      //     return;
      //   } else {
      //     this.updateBubblePlotData(chartProps);
      //     return;
      //   }
      // }
    } else {
      this.setState({
        chartProps
      });
    }
  }

  // private readonly shouldUpdateScatterPlot = (
  //   prevState: ILargeIndividualFeatureImportanceViewState
  // ): boolean => {
  //   return (
  //     !_.isEqual(
  //       prevState.selectedPointsIndexes,
  //       this.state.selectedPointsIndexes
  //     ) ||
  //     !_.isEqual(
  //       prevState.isLocalExplanationsDataLoading,
  //       this.state.isLocalExplanationsDataLoading
  //     )
  //   );
  // };

  // private readonly shouldUpdateBubbleChartPlot = (
  //   prevProps: ILargeIndividualFeatureImportanceViewProps,
  //   prevState: ILargeIndividualFeatureImportanceViewState
  // ): boolean => {
  //   return (
  //     this.props.cohort.name !== prevProps.cohort.name ||
  //     (this.state.isRevertButtonClicked &&
  //       prevState.isRevertButtonClicked !== this.state.isRevertButtonClicked)
  //   );
  // };

  private updateBubblePlotData = async (
    chartProps?: IGenericChartProps
  ): Promise<void> => {
    if (chartProps) {
      this.setState({
        isBubbleChartDataLoading: true
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
        highChartConfigOverride: datasetBarConfigOverride,
        isBubbleChartDataLoading: false,
        isBubbleChartRendered: true,
        isRevertButtonClicked: false,
        chartProps: chartProps
      });
    }
  };

  private updateScatterPlotData = (chartProps: IGenericChartProps): void => {
    const datasetBarConfigOverride = this.getScatterPlotData(chartProps);
    this.setState({
      highChartConfigOverride: datasetBarConfigOverride,
      isBubbleChartRendered: false,
      isRevertButtonClicked: false,
      chartProps: chartProps
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
      false,
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
      false,
      true,
      false,
      this.selectPointFromChartLargeData
    );
  };

  private readonly hasAxisTypeChanged = (
    newChartProps: IGenericChartProps
  ): boolean => {
    if (this.state.chartProps) {
      this.changedKeys = [];
      this.compareChartProps(newChartProps, this.state.chartProps);
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

  private readonly resetSeries = (newProps: IGenericChartProps): void => {
    this.changedKeys = [];
    if (this.state.chartProps) {
      this.compareChartProps(newProps, this.state.chartProps);
      const shouldResetIndexes =
        ifEnableLargeData(this.context.dataset) &&
        !_.isEqual(this.state.chartProps, newProps) &&
        !hasAxisTypeChanged(this.changedKeys);
      if (shouldResetIndexes) {
        this.setState({
          indexSeries: [],
          isRevertButtonClicked: false,
          xSeries: [],
          ySeries: []
        });
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
    this.resetSeries(newProps);
    this.setState({ chartProps: newProps });
    // this.generateHighChartConfigOverride(
    //   newProps,
    //   false,
    //   false,
    //   false,
    //   true,
    //   false
    // );
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (!this.state.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.state.chartProps);
    newProps.yAxis = value;
    this.resetSeries(newProps);
    this.setState({ chartProps: newProps });
    // this.generateHighChartConfigOverride(
    //   newProps,
    //   false,
    //   false,
    //   false,
    //   true,
    //   false
    // );
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
        isLocalExplanationsDataLoading: true
      });
      const localExplanationsData = await getLocalExplanationsFromSDK(
        absoluteIndex,
        this.context.requestLocalExplanations
      );
      if (
        typeof localExplanationsData === "object" &&
        localExplanationsData &&
        localExplanationsData["error"]
      ) {
        this.setState({
          localExplanationsErrorMessage: localExplanationsData["error"]
            .split(":")
            .pop(),
          localExplanationsData: undefined
        });
        return;
      }
      this.setState({
        localExplanationsData: localExplanationsData,
        isLocalExplanationsDataLoading: false
      });
    }
  };
}
