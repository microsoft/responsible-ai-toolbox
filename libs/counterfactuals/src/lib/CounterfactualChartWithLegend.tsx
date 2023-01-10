// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  IGenericChartProps,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ITelemetryEvent,
  TelemetryLevels,
  TelemetryEventName,
  ICounterfactualData,
  ifEnableLargeData
} from "@responsible-ai/core-ui";
import React from "react";

import { getOriginalData } from "../util/getOriginalData";

import { CounterfactualChart } from "./CounterfactualChart";
import { counterfactualChartStyles } from "./CounterfactualChart.styles";
import { CounterfactualChartLegend } from "./CounterfactualChartLegend";
import { LargeCounterfactualChart } from "./largeCounterfactualsView/LargeCounterfactualChart";

export interface ICounterfactualChartWithLegendProps {
  chartProps: IGenericChartProps;
  data: ICounterfactualData;
  selectedPointsIndexes: number[];
  indexSeries: number[];
  temporaryPoint: { [key: string]: any } | undefined;
  isCounterfactualsDataLoading?: boolean;
  onChartPropsUpdated: (chartProps: IGenericChartProps) => void;
  onCustomPointLengthUpdated: (customPointLength: number) => void;
  onSelectedPointsIndexesUpdated: (selectedPointsIndexes: number[]) => void;
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
  setCounterfactualData: (absoluteIndex: number) => Promise<void>;
  telemetryHook?: (message: ITelemetryEvent) => void;
  onIndexSeriesUpdated?: (data: any) => void;
}

export interface ICounterfactualChartWithLegendState {
  customPointIsActive: boolean[];
  customPoints: Array<{ [key: string]: any }>;
  isPanelOpen: boolean;
  originalData?: { [key: string]: string | number };
  pointIsActive: boolean[];
}

export class CounterfactualChartWithLegend extends React.PureComponent<
  ICounterfactualChartWithLegendProps,
  ICounterfactualChartWithLegendState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ICounterfactualChartWithLegendProps) {
    super(props);

    this.state = {
      customPointIsActive: [],
      customPoints: [],
      isPanelOpen: false,
      originalData: undefined,
      pointIsActive: []
    };
  }

  public render(): React.ReactNode {
    const classNames = counterfactualChartStyles();
    return (
      <Stack.Item>
        <Stack
          horizontal
          id={"IndividualFeatureContainer"}
          className={classNames.chartWithLegend}
        >
          {ifEnableLargeData(this.context.dataset) ? (
            this.getLargeCounterfactualChartComponent()
          ) : (
            <CounterfactualChart
              chartProps={this.props.chartProps}
              customPoints={this.state.customPoints}
              isPanelOpen={this.state.isPanelOpen}
              originalData={this.state.originalData}
              selectedPointsIndexes={this.props.selectedPointsIndexes}
              temporaryPoint={this.props.temporaryPoint}
              onChartPropsUpdated={this.props.onChartPropsUpdated}
              saveAsPoint={this.saveAsPoint}
              setCustomRowProperty={this.props.setCustomRowProperty}
              setCustomRowPropertyComboBox={
                this.props.setCustomRowPropertyComboBox
              }
              setTemporaryPointToCopyOfDatasetPoint={
                this.props.setTemporaryPointToCopyOfDatasetPoint
              }
              telemetryHook={this.props.telemetryHook}
              togglePanel={this.togglePanel}
              toggleSelectionOfPoint={this.toggleSelectionOfPoint}
            />
          )}
          <CounterfactualChartLegend
            {...this.props}
            customPointIsActive={this.state.customPointIsActive}
            customPoints={this.state.customPoints}
            selectedPointsIndexes={this.props.selectedPointsIndexes}
            indexSeries={this.props.indexSeries}
            removeCustomPoint={this.removeCustomPoint}
            setTemporaryPointToCopyOfDatasetPoint={
              this.props.setTemporaryPointToCopyOfDatasetPoint
            }
            setCounterfactualData={this.props.setCounterfactualData}
            toggleCustomActivation={this.toggleCustomActivation}
            togglePanel={this.togglePanel}
            toggleSelectionOfPoint={this.toggleSelectionOfPoint}
            isCounterfactualsDataLoading={
              this.props.isCounterfactualsDataLoading
            }
          />
        </Stack>
      </Stack.Item>
    );
  }

  private toggleSelectionOfPoint = (index?: number): void => {
    if (index === undefined) {
      return;
    }
    const indexOf = this.props.selectedPointsIndexes.indexOf(index);
    let newSelections = [...this.props.selectedPointsIndexes];
    let pointIsActive = [...this.state.pointIsActive];
    let originalData;
    if (indexOf === -1) {
      newSelections = [index];
      pointIsActive = [true];
      originalData = getOriginalData(
        index,
        this.context.jointDataset,
        this.context.dataset
      );
    } else {
      newSelections.splice(indexOf, 1);
      pointIsActive.splice(indexOf, 1);
    }
    this.setState({
      originalData,
      pointIsActive
    });
    this.props.onSelectedPointsIndexesUpdated(newSelections);
  };

  private toggleCustomActivation = (index: number): void => {
    const customPointIsActive = [...this.state.customPointIsActive];
    customPointIsActive[index] = !customPointIsActive[index];
    this.setState({ customPointIsActive });
  };

  private removeCustomPoint = (index: number): void => {
    this.setState((prevState) => {
      const customPoints = [...prevState.customPoints];
      customPoints.splice(index, 1);
      const customPointIsActive = [...prevState.customPointIsActive];
      customPointIsActive.splice(index, 1);
      this.props.onCustomPointLengthUpdated(customPoints.length);
      return { customPointIsActive, customPoints };
    });
  };

  private onChartPropsUpdated = (newProps: IGenericChartProps): void => {
    this.setState({
      customPointIsActive: [],
      customPoints: [],
      pointIsActive: []
    });
    this.props.onChartPropsUpdated(newProps);
  };

  private saveAsPoint = (): void => {
    const customPoints = [...this.state.customPoints];
    const customPointIsActive = [...this.state.customPointIsActive];
    if (this.props.temporaryPoint) {
      customPoints.push(this.props.temporaryPoint);
    }
    customPointIsActive.push(true);
    this.setState({
      customPointIsActive,
      customPoints
    });
    this.props.onCustomPointLengthUpdated(customPoints.length);
  };

  private togglePanel = (): void => {
    if (!this.state.isPanelOpen) {
      this.logTelemetryEvent(
        TelemetryEventName.CounterfactualCreateWhatIfCounterfactualClick
      );
    }
    this.setState((preState) => {
      return { isPanelOpen: !preState.isPanelOpen };
    });
  };

  private logTelemetryEvent = (eventName: TelemetryEventName): void => {
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: eventName
    });
  };

  private getLargeCounterfactualChartComponent = (): React.ReactNode => {
    return (
      <LargeCounterfactualChart
        chartProps={this.props.chartProps}
        customPoints={this.state.customPoints}
        isPanelOpen={this.state.isPanelOpen}
        originalData={this.state.originalData}
        selectedPointsIndexes={this.props.selectedPointsIndexes}
        temporaryPoint={this.props.temporaryPoint}
        onChartPropsUpdated={this.onChartPropsUpdated}
        saveAsPoint={this.saveAsPoint}
        setCustomRowProperty={this.props.setCustomRowProperty}
        setCustomRowPropertyComboBox={this.props.setCustomRowPropertyComboBox}
        setTemporaryPointToCopyOfDatasetPoint={
          this.props.setTemporaryPointToCopyOfDatasetPoint
        }
        telemetryHook={this.props.telemetryHook}
        togglePanel={this.togglePanel}
        toggleSelectionOfPoint={this.toggleSelectionOfPoint}
        setCounterfactualData={this.props.setCounterfactualData}
        onIndexSeriesUpdated={this.props.onIndexSeriesUpdated}
        isCounterfactualsDataLoading={this.props.isCounterfactualsDataLoading}
      />
    );
  };
}
