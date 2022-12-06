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
  ICounterfactualData
} from "@responsible-ai/core-ui";
import React from "react";

import { getOriginalData } from "../util/getOriginalData";

import { CounterfactualChart } from "./CounterfactualChart";
import { counterfactualChartStyles } from "./CounterfactualChart.styles";
import { CounterfactualChartLegend } from "./CounterfactualChartLegend";

export interface ICounterfactualChartWithLegendProps {
  chartProps: IGenericChartProps;
  data: ICounterfactualData;
  selectedPointsIndexes: number[];
  temporaryPoint: { [key: string]: any } | undefined;
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
  setTemporaryPointToCopyOfDatasetPoint: (index: number) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
  setCounterfactualLocalImportanceData: (data: any) => void;
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
          <CounterfactualChart
            chartProps={this.props.chartProps}
            customPoints={this.state.customPoints}
            isPanelOpen={this.state.isPanelOpen}
            originalData={this.state.originalData}
            selectedPointsIndexes={this.props.selectedPointsIndexes}
            temporaryPoint={this.props.temporaryPoint}
            cohort={this.context.selectedErrorCohort.cohort}
            jointDataset={this.context.jointDataset}
            requestBubblePlotData={this.context.requestBubblePlotData}
            counterfactualData={this.context.counterfactualData}
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
            setCounterfactualLocalImportanceData={
              this.props.setCounterfactualLocalImportanceData
            }
          />
          <CounterfactualChartLegend
            {...this.props}
            customPointIsActive={this.state.customPointIsActive}
            customPoints={this.state.customPoints}
            selectedPointsIndexes={this.props.selectedPointsIndexes}
            removeCustomPoint={this.removeCustomPoint}
            setTemporaryPointToCopyOfDatasetPoint={
              this.props.setTemporaryPointToCopyOfDatasetPoint
            }
            toggleCustomActivation={this.toggleCustomActivation}
            togglePanel={this.togglePanel}
            toggleSelectionOfPoint={this.toggleSelectionOfPoint}
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
}
