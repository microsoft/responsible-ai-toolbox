// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  calculateBubblePlotDataFromErrorCohort,
  defaultModelAssessmentContext,
  generateDefaultChartAxes,
  getScatterOption,
  hasAxisTypeChanged,
  ifEnableLargeData,
  IGenericChartProps,
  IHighchartBubbleSDKClusterData,
  IHighchartsConfig,
  instanceOfHighChart,
  ISelectorConfig,
  ITelemetryEvent,
  ModelAssessmentContext,
  OtherChartTypes
} from "@responsible-ai/core-ui";
import _ from "lodash";
import React from "react";
import { verticalComponentTokens } from "../IndividualFeatureImportanceView.styles";
import { LargeIndividualFeatureImportanceChartArea } from "./LargeIndividualFeatureImportanceChartArea";

export interface ILargeIndividualFeatureImportanceViewProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface ILargeIndividualFeatureImportanceViewState {
  chartProps?: IGenericChartProps;
  selectedCohortIndex: number;
  highChartConfigOverride?: any;
  isBubbleChartRendered?: boolean;
  xSeries: number[];
  ySeries: number[];
  indexSeries: number[];
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isRevertButtonClicked?: boolean;
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
      selectedCohortIndex: 0,
      xSeries: [],
      ySeries: []
    };
  }

  public componentDidMount(): void {
    const initialCohortIndex = 0;
    const chartProps = generateDefaultChartAxes(
      this.context.jointDataset,
      OtherChartTypes.Bubble
    );
    this.generateHighChartConfigOverride(initialCohortIndex, chartProps);
  }

  public render(): React.ReactNode {
    if (
      this.state.highChartConfigOverride === undefined ||
      this.state.chartProps === undefined
    ) {
      return <div />;
    }
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
      </Stack>
    );
  }

  private async generateHighChartConfigOverride(
    cohortIndex: number,
    chartProps: IGenericChartProps | undefined
  ): Promise<void> {
    if (chartProps) {
      if (chartProps.chartType === OtherChartTypes.Bubble) {
        const hasAxisTypeChanged = this.hasAxisTypeChanged(chartProps);
        if (!hasAxisTypeChanged) {
          this.updateBubblePlotData(chartProps, cohortIndex);
        } else {
          this.updateScatterPlotData(chartProps, cohortIndex);
        }
      }
    } else {
      this.setState({
        chartProps,
        selectedCohortIndex: cohortIndex
      });
    }
  }

  private updateBubblePlotData = async (
    chartProps: IGenericChartProps,
    cohortIndex: number
  ): Promise<void> => {
    this.setState({
      isBubbleChartDataLoading: true
    });
    const datasetBarConfigOverride = await this.getBubblePlotData(
      chartProps,
      cohortIndex
    );
    this.resetSeries(chartProps);
    if (
      datasetBarConfigOverride &&
      !instanceOfHighChart(datasetBarConfigOverride)
    ) {
      this.setErrorStatus(chartProps, cohortIndex, datasetBarConfigOverride);
      return;
    }
    this.setState({
      chartProps,
      highChartConfigOverride: datasetBarConfigOverride,
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      isRevertButtonClicked: false,
      selectedCohortIndex: cohortIndex
    });
  };

  private updateScatterPlotData = (
    chartProps: IGenericChartProps,
    cohortIndex: number
  ): void => {
    const datasetBarConfigOverride = this.getScatterPlotData(chartProps);
    this.setState({
      chartProps,
      highChartConfigOverride: datasetBarConfigOverride,
      isBubbleChartRendered: false,
      isRevertButtonClicked: false,
      selectedCohortIndex: cohortIndex
    });
  };

  private getBubblePlotData = async (
    chartProps: IGenericChartProps,
    cohortIndex: number
  ): Promise<
    IHighchartBubbleSDKClusterData | IHighchartsConfig | undefined
  > => {
    return await calculateBubblePlotDataFromErrorCohort(
      this.context.errorCohorts[cohortIndex].cohort,
      chartProps,
      [],
      this.context.jointDataset,
      this.context.dataset,
      false,
      true,
      false,
      this.context.requestBubblePlotData,
      undefined,
      this.onBubbleClick,
      undefined
    );
  };

  private getScatterPlotData = (
    chartProps: IGenericChartProps
  ): IHighchartsConfig => {
    return getScatterOption(
      this.state.xSeries,
      this.state.ySeries,
      this.state.indexSeries,
      chartProps,
      this.context.jointDataset,
      [],
      [],
      false,
      true,
      false,
      undefined
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

  private setErrorStatus = (
    chartProps: IGenericChartProps,
    cohortIndex: number,
    datasetBarConfigOverride: any
  ): void => {
    this.setState({
      bubbleChartErrorMessage: datasetBarConfigOverride
        .toString()
        .split(":")
        .pop(),
      chartProps,
      highChartConfigOverride: undefined,
      isBubbleChartDataLoading: false,
      selectedCohortIndex: cohortIndex
    });
  };

  private onBubbleClick = (
    scatterPlotData: IHighchartsConfig,
    xSeries: number[],
    ySeries: number[],
    indexSeries: number[]
  ): void => {
    this.setState({
      highChartConfigOverride: scatterPlotData,
      indexSeries,
      isBubbleChartRendered: false,
      xSeries,
      ySeries
    });
  };

  private onXSet = (value: ISelectorConfig): void => {
    if (!this.state.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.state.chartProps);
    newProps.xAxis = value;
    this.generateHighChartConfigOverride(
      this.state.selectedCohortIndex,
      newProps
    );
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (!this.state.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.state.chartProps);
    newProps.yAxis = value;
    this.generateHighChartConfigOverride(
      this.state.selectedCohortIndex,
      newProps
    );
  };
}
