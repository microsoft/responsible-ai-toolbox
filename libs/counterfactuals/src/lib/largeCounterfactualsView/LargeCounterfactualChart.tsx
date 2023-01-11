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
  ITelemetryEvent,
  TelemetryEventName,
  JointDataset,
  TelemetryLevels,
  ifEnableLargeData,
  Cohort
} from "@responsible-ai/core-ui";
import _ from "lodash";
import React from "react";

import {
  calculateBubblePlotDataFromErrorCohort,
  instanceOfHighChart
} from "../../util/largeCounterfactualsView/calculateBubbleData";
import { getCounterfactualsScatterOption } from "../../util/largeCounterfactualsView/getCounterfactualsScatterOption";
import { counterfactualChartStyles } from "../CounterfactualChart.styles";
import { isJustTypeChange } from "../CounterfactualComponentUtils";
import { CounterfactualPanel } from "../CounterfactualPanel";

import { LargeCounterfactualChartArea } from "./LargeCounterfactualChartArea";

export interface ICounterfactualChartProps {
  cohort: Cohort;
  chartProps: IGenericChartProps;
  customPoints: Array<{ [key: string]: any }>;
  isPanelOpen: boolean;
  originalData?: { [key: string]: string | number };
  selectedPointsIndexes: number[];
  temporaryPoint: { [key: string]: any } | undefined;
  isCounterfactualsDataLoading?: boolean;
  isRevertButtonClicked: boolean;
  onChartPropsUpdated: (chartProps: IGenericChartProps) => void;
  saveAsPoint: () => void;
  setCustomRowProperty: (
    key: string | number,
    isString: boolean,
    newValue?: string | number | undefined
  ) => void;
  setCustomRowPropertyComboBox: (
    key: string | number,
    index?: number,
    value?: string
  ) => void;
  setTemporaryPointToCopyOfDatasetPoint: (
    index: number,
    absoluteIndex?: number
  ) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
  togglePanel: () => void;
  toggleSelectionOfPoint: (index?: number) => void;
  setCounterfactualData: (absoluteIndex: any) => Promise<void>;
  onIndexSeriesUpdated?: (data: any) => void;
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
  ICounterfactualChartProps,
  ICounterfactualChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private changedKeys: string[] = [];

  public constructor(props: ICounterfactualChartProps) {
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

  public componentDidUpdate(prevProps: ICounterfactualChartProps): void {
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
    const canBin = this.state.yDialogOpen
      ? false
      : this.props.chartProps.chartType === ChartTypes.Histogram ||
        this.props.chartProps.chartType === ChartTypes.Box;
    const mustBin = this.state.yDialogOpen
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
            canBin={canBin}
            mustBin={mustBin}
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
            canBin={canBin}
            mustBin={mustBin}
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
    prevProps: ICounterfactualChartProps
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
    prevProps: ICounterfactualChartProps
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
    if (!instanceOfHighChart(plotData)) {
      this.setState({
        bubbleChartErrorMessage: plotData.toString().split(":").pop()
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

  private async getBubblePlotData(): Promise<any> {
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
    scatterPlotData: any,
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

  private selectPointFromChartLargeData = async (data: any): Promise<void> => {
    const index = data.customData[JointDataset.IndexLabel];
    const absoluteIndex = data.customData[JointDataset.AbsoluteIndexLabel];
    this.props.setTemporaryPointToCopyOfDatasetPoint(index, absoluteIndex);
    this.props.setCounterfactualData(absoluteIndex);
    this.props.toggleSelectionOfPoint(index);
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.CounterfactualNewDatapointSelectedFromChart
    });
  };
}
