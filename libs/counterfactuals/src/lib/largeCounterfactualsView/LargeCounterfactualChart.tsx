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
  IHighchartBubbleSDKClusterData
} from "@responsible-ai/core-ui";
import _ from "lodash";
import React from "react";

import { calculateBubblePlotDataFromErrorCohort } from "../../util/largeCounterfactualsView/calculateBubbleData";
import {
  getCounterfactualsScatterOption,
  IScatterPoint
} from "../../util/largeCounterfactualsView/getCounterfactualsScatterOption";
import { ICounterfactualChartProps } from "../CounterfactualChart";
import { counterfactualChartStyles } from "../CounterfactualChart.styles";
import { isJustTypeChange } from "../CounterfactualComponentUtils";
import { CounterfactualPanel } from "../CounterfactualPanel";

import { LargeCounterfactualChartArea } from "./LargeCounterfactualChartArea";

export interface ILargeCounterfactualChartProps
  extends ICounterfactualChartProps {
  cohort: Cohort;
  isCounterfactualsDataLoading?: boolean;
  isRevertButtonClicked: boolean;
  setCounterfactualData: (absoluteIndex?: number) => Promise<void>;
  onIndexSeriesUpdated?: (indexSeries: number[]) => void;
  setIsRevertButtonClicked: (status: boolean) => void;
}

export interface ICounterfactualChartState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  plotData: any;
  xSeries: number[];
  ySeries: number[];
  indexSeries: number[];
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isBubbleChartRendered: boolean;
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
      indexSeries: [],
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      plotData: undefined,
      xDialogOpen: false,
      xSeries: [],
      yDialogOpen: false,
      ySeries: []
    };
  }

  public componentDidMount(): void {
    this.updateBubblePlot();
  }

  public componentDidUpdate(prevProps: ILargeCounterfactualChartProps): void {
    if (this.shouldUpdateBubbleChartPlot(prevProps)) {
      this.updateBubblePlot();
      return;
    }
    if (this.isJustTypeChange(prevProps.chartProps)) {
      this.updateScatterPlot();
      return;
    }
    if (!_.isEqual(prevProps.chartProps, this.props.chartProps)) {
      this.updateBubblePlot();
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
            data={this.context.counterfactualData}
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
            canDither={this.props.chartProps.chartType === ChartTypes.Scatter}
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
            canDither={this.props.chartProps.chartType === ChartTypes.Scatter}
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

  private compareChartProps = (newProps?: any, oldProps?: any): void => {
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
      !isJustTypeChange(this.changedKeys);
    if (shouldResetIndexes) {
      this.setState({
        indexSeries: [],
        xSeries: [],
        ySeries: []
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

  private readonly shouldUpdateBubbleChartPlot = (
    prevProps: ILargeCounterfactualChartProps
  ): boolean => {
    return (
      this.props.cohort.name !== prevProps.cohort.name ||
      (this.props.isRevertButtonClicked &&
        prevProps.isRevertButtonClicked !== this.props.isRevertButtonClicked)
    );
  };

  private readonly isJustTypeChange = (
    prevChartProps: IGenericChartProps
  ): boolean => {
    this.changedKeys = [];
    this.compareChartProps(this.props.chartProps, prevChartProps);
    return isJustTypeChange(this.changedKeys);
  };

  private readonly setXDialogOpen = (): void => {
    this.setState({ xDialogOpen: !this.state.xDialogOpen });
  };

  private readonly setYDialogOpen = (): void => {
    this.setState({ yDialogOpen: !this.state.yDialogOpen });
  };

  private async updateBubblePlot(): Promise<any> {
    this.setState({
      isBubbleChartDataLoading: true
    });
    const plotData = await this.getBubblePlotData();
    this.props.setIsRevertButtonClicked(false);
    if (plotData && plotData["error"]) {
      this.setState({
        bubbleChartErrorMessage: plotData["error"].split(":").pop()
      });
      this.setState({
        isBubbleChartDataLoading: false,
        plotData: undefined
      });
      return;
    }
    this.setState({
      bubbleChartErrorMessage: undefined,
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      plotData
    });
  }

  private updateScatterPlot(): void {
    const pData = getCounterfactualsScatterOption(
      this.state.xSeries,
      this.state.ySeries,
      this.state.indexSeries,
      this.props.chartProps,
      this.context.jointDataset,
      this.props.selectedPointsIndexes,
      this.props.customPoints,
      this.props.isCounterfactualsDataLoading,
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
      this.props.selectedPointsIndexes,
      this.props.customPoints,
      this.context.jointDataset,
      this.context.dataset,
      this.props.isCounterfactualsDataLoading,
      this.context.requestBubblePlotData,
      this.selectPointFromChartLargeData,
      this.onBubbleClick,
      this.props.onIndexSeriesUpdated
    );
  }

  private readonly onBubbleClick = (
    scatterPlotData: IHighchartsConfig,
    xSeries: number[],
    ySeries: number[],
    indexSeries: number[]
  ): void => {
    this.setState({
      indexSeries,
      isBubbleChartRendered: false,
      plotData: scatterPlotData,
      xSeries,
      ySeries
    });
  };

  private selectPointFromChartLargeData = async (
    data: IScatterPoint
  ): Promise<void> => {
    const index = data.customData[JointDataset.IndexLabel];
    const absoluteIndex = data.customData[JointDataset.AbsoluteIndexLabel];
    index &&
      this.props.setTemporaryPointToCopyOfDatasetPoint(index, absoluteIndex);
    this.props.setCounterfactualData(absoluteIndex);
    this.props.toggleSelectionOfPoint(index);
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.CounterfactualNewDatapointSelectedFromChart
    });
  };
}
