// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  AxisConfigDialog,
  ColumnCategories,
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  TelemetryEventName,
  JointDataset,
  TelemetryLevels,
  ifEnableLargeData,
  Cohort,
  IHighchartsConfig,
  IHighchartBubbleSDKClusterData,
  ICounterfactualData,
  instanceOfHighChart,
  IScatterPoint,
  IClusterData,
  calculateBubblePlotDataFromErrorCohort,
  getScatterOption,
  getInitialClusterState
} from "@responsible-ai/core-ui";
import _ from "lodash";
import React from "react";

import { ICounterfactualChartProps } from "../CounterfactualChart";
import { counterfactualChartStyles } from "../CounterfactualChart.styles";
import { hasAxisTypeChanged } from "../CounterfactualComponentUtils";
import { CounterfactualPanel } from "../CounterfactualPanel";

import { LargeCounterfactualChartArea } from "./LargeCounterfactualChartArea";

export interface ILargeCounterfactualChartProps
  extends ICounterfactualChartProps {
  cohort: Cohort;
  isCounterfactualsDataLoading?: boolean;
  isRevertButtonClicked: boolean;
  counterfactualData: ICounterfactualData;
  setCounterfactualData: (absoluteIndex?: number) => Promise<void>;
  onIndexSeriesUpdated?: (indexSeries: number[]) => void;
  setIsRevertButtonClicked: (status: boolean) => void;
  resetIndexes: () => void;
  resetCustomPoints: () => void;
}

export interface ICounterfactualChartState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  plotData: any;
  clusterData: IClusterData;
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isBubbleChartRendered: boolean;
  bubblePlotData?: IHighchartsConfig;
}

export class LargeCounterfactualChart extends React.PureComponent<
  ILargeCounterfactualChartProps,
  ICounterfactualChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private changedKeys: string[] = [];

  public constructor(props: ILargeCounterfactualChartProps) {
    super(props);
    this.state = {
      bubbleChartErrorMessage: undefined,
      clusterData: getInitialClusterState(),
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      plotData: undefined,
      xDialogOpen: false,
      yDialogOpen: false
    };
  }

  public componentDidMount(): void {
    this.updateBubblePlot(false);
  }

  public componentDidUpdate(prevProps: ILargeCounterfactualChartProps): void {
    const hasRevertToBubbleChartUpdated =
      this.hasRevertToBubbleChartUpdated(prevProps);
    if (hasRevertToBubbleChartUpdated || this.hasCohortUpdated(prevProps)) {
      this.updateBubblePlot(hasRevertToBubbleChartUpdated);
      return;
    }
    if (this.hasAxisTypeChanged(prevProps.chartProps)) {
      this.updateScatterPlot();
      return;
    }
    if (!_.isEqual(prevProps.chartProps, this.props.chartProps)) {
      this.updateBubblePlot(false);
      return;
    }
    if (this.shouldUpdateScatterPlot(prevProps)) {
      this.updateScatterPlot();
    }
  }

  public render(): React.ReactNode {
    const classNames = counterfactualChartStyles();
    const orderedGroupTitles = [
      ColumnCategories.Index,
      ColumnCategories.Dataset,
      ColumnCategories.Outcome
    ];
    const bin = this.state.yDialogOpen
      ? false
      : this.props.chartProps.chartType === ChartTypes.Histogram ||
        this.props.chartProps.chartType === ChartTypes.Box;

    return (
      <Stack.Item className={classNames.chartWithAxes}>
        {this.props.originalData && (
          <CounterfactualPanel
            originalData={this.props.originalData}
            selectedIndex={this.props.selectedPointsIndexes[0] || 0}
            closePanel={this.props.togglePanel}
            saveAsPoint={this.props.saveAsPoint}
            setCustomRowProperty={this.props.setCustomRowProperty}
            setCustomRowPropertyComboBox={
              this.props.setCustomRowPropertyComboBox
            }
            temporaryPoint={this.props.temporaryPoint}
            isPanelOpen={this.props.isPanelOpen}
            data={this.props.counterfactualData}
            telemetryHook={this.props.telemetryHook}
          />
        )}
        {this.state.yDialogOpen && (
          <AxisConfigDialog
            orderedGroupTitles={orderedGroupTitles}
            selectedColumn={this.props.chartProps.yAxis}
            canBin={bin}
            mustBin={bin}
            allowTreatAsCategorical={!ifEnableLargeData(this.context.dataset)}
            allowLogarithmicScaling={!this.state.isBubbleChartRendered}
            canDither={false}
            hideDroppedFeatures
            onAccept={this.onYSet}
            onCancel={this.setYDialogOpen}
          />
        )}
        {this.state.xDialogOpen && (
          <AxisConfigDialog
            orderedGroupTitles={orderedGroupTitles}
            selectedColumn={this.props.chartProps.xAxis}
            canBin={bin}
            mustBin={bin}
            canDither={false}
            allowTreatAsCategorical={!ifEnableLargeData(this.context.dataset)}
            allowLogarithmicScaling={!this.state.isBubbleChartRendered}
            hideDroppedFeatures
            onAccept={this.onXSet}
            onCancel={this.setXDialogOpen}
          />
        )}
        <LargeCounterfactualChartArea
          xAxisProperty={this.props.chartProps.xAxis.property}
          yAxisProperty={this.props.chartProps.yAxis.property}
          plotData={this.state.plotData}
          isBubbleChartDataLoading={this.state.isBubbleChartDataLoading}
          isCounterfactualsDataLoading={this.props.isCounterfactualsDataLoading}
          bubbleChartErrorMessage={this.state.bubbleChartErrorMessage}
          setXDialogOpen={this.setXDialogOpen}
          setYDialogOpen={this.setYDialogOpen}
        />
      </Stack.Item>
    );
  }

  private onXSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.xAxis = value;
    this.setState({
      xDialogOpen: false
    });
    this.setSeries(newProps);
    this.props.onChartPropsUpdated(newProps);
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.yAxis = value;
    this.setState({
      yDialogOpen: false
    });
    this.setSeries(newProps);
    this.props.onChartPropsUpdated(newProps);
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

  private readonly setSeries = (newProps: IGenericChartProps): void => {
    this.changedKeys = [];
    this.compareChartProps(newProps, this.props.chartProps);
    const shouldResetIndexes =
      ifEnableLargeData(this.context.dataset) &&
      !_.isEqual(this.props.chartProps, newProps) &&
      !hasAxisTypeChanged(this.changedKeys);
    if (shouldResetIndexes) {
      this.setState({
        clusterData: getInitialClusterState()
      });
    }
  };

  private readonly shouldUpdateScatterPlot = (
    prevProps: ILargeCounterfactualChartProps
  ): boolean => {
    return (
      !_.isEqual(
        prevProps.selectedPointsIndexes,
        this.props.selectedPointsIndexes
      ) ||
      !_.isEqual(prevProps.customPoints, this.props.customPoints) ||
      !_.isEqual(
        prevProps.isCounterfactualsDataLoading,
        this.props.isCounterfactualsDataLoading
      )
    );
  };

  private readonly hasRevertToBubbleChartUpdated = (
    prevProps: ILargeCounterfactualChartProps
  ): boolean => {
    return (
      this.props.isRevertButtonClicked &&
      prevProps.isRevertButtonClicked !== this.props.isRevertButtonClicked
    );
  };

  private readonly hasCohortUpdated = (
    prevProps: ILargeCounterfactualChartProps
  ): boolean => {
    return this.props.cohort.name !== prevProps.cohort.name;
  };

  private readonly hasAxisTypeChanged = (
    prevChartProps: IGenericChartProps
  ): boolean => {
    this.changedKeys = [];
    this.compareChartProps(this.props.chartProps, prevChartProps);
    return hasAxisTypeChanged(this.changedKeys);
  };

  private readonly setXDialogOpen = (): void => {
    this.setState({ xDialogOpen: !this.state.xDialogOpen });
  };

  private readonly setYDialogOpen = (): void => {
    this.setState({ yDialogOpen: !this.state.yDialogOpen });
  };

  private async updateBubblePlot(
    hasRevertToBubbleChartUpdated: boolean
  ): Promise<void> {
    if (hasRevertToBubbleChartUpdated) {
      this.setState(
        {
          isBubbleChartDataLoading: true
        },
        () => {
          this.setState({
            bubbleChartErrorMessage: undefined,
            isBubbleChartDataLoading: false,
            isBubbleChartRendered: true,
            plotData: this.state.bubblePlotData
          });
        }
      );
      return;
    }
    this.setState({
      isBubbleChartDataLoading: true
    });
    this.props.onIndexSeriesUpdated && this.props.onIndexSeriesUpdated([]);
    this.props.resetIndexes();
    this.props.resetCustomPoints();
    const plotData = await this.getBubblePlotData();
    if (plotData && !instanceOfHighChart(plotData)) {
      this.setState({
        bubbleChartErrorMessage: plotData.toString().split(":").pop(),
        isBubbleChartDataLoading: false,
        plotData: undefined
      });
      return;
    }
    this.setState({
      bubbleChartErrorMessage: undefined,
      bubblePlotData: plotData,
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      plotData
    });
  }

  private updateScatterPlot(): void {
    const pData = getScatterOption(
      this.state.clusterData,
      this.props.chartProps,
      this.context.jointDataset,
      this.props.selectedPointsIndexes,
      this.props.customPoints,
      this.props.isCounterfactualsDataLoading,
      true,
      false,
      this.selectPointFromChartLargeData
    );
    this.setState({
      plotData: pData
    });
  }

  private async getBubblePlotData(): Promise<
    IHighchartsConfig | IHighchartBubbleSDKClusterData | undefined
  > {
    return await calculateBubblePlotDataFromErrorCohort(
      this.props.cohort,
      this.props.chartProps,
      this.props.customPoints,
      this.context.jointDataset,
      this.context.dataset,
      this.props.isCounterfactualsDataLoading,
      true,
      false,
      TelemetryEventName.CounterfactualsBubblePlotDataFetch,
      this.context.requestBubblePlotData,
      this.selectPointFromChartLargeData,
      this.onBubbleClick,
      this.props.onIndexSeriesUpdated,
      this.props.telemetryHook
    );
  }

  private readonly onBubbleClick = (
    scatterPlotData: IHighchartsConfig,
    clusterData: IClusterData
  ): void => {
    this.setState({
      clusterData,
      isBubbleChartRendered: false,
      plotData: scatterPlotData
    });
  };

  private selectPointFromChartLargeData = async (
    data: IScatterPoint
  ): Promise<void> => {
    const index = data.customData[JointDataset.IndexLabel];
    const absoluteIndex = data.customData[JointDataset.AbsoluteIndexLabel];
    index &&
      this.props.setTemporaryPointToCopyOfDatasetPoint(index, absoluteIndex);
    const newSelections = this.props.toggleSelectionOfPoint(index);
    if (newSelections.length > 0) {
      this.props.setCounterfactualData(absoluteIndex);
    }
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.CounterfactualNewDatapointSelectedFromChart
    });
  };
}
