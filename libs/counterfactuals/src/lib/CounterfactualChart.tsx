// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, DefaultButton, Stack } from "@fluentui/react";
import {
  AxisConfigDialog,
  ColumnCategories,
  JointDataset,
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  BasicHighChart,
  ITelemetryEvent,
  TelemetryLevels,
  TelemetryEventName
} from "@responsible-ai/core-ui";
import _ from "lodash";
import React from "react";

import { generatePlotlyProps } from "../util/generatePlotlyProps";
import { getCounterfactualChartOptions } from "../util/getCounterfactualChartOptions";

import { counterfactualChartStyles } from "./CounterfactualChart.styles";
import { CounterfactualPanel } from "./CounterfactualPanel";

export interface ICounterfactualChartProps {
  chartProps: IGenericChartProps;
  customPoints: Array<{ [key: string]: any }>;
  isPanelOpen: boolean;
  originalData?: { [key: string]: string | number };
  selectedPointsIndexes: number[];
  temporaryPoint: { [key: string]: any } | undefined;
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
  toggleSelectionOfPoint: (index?: number) => number[];
}

export interface ICounterfactualChartState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
}

export class CounterfactualChart extends React.PureComponent<
  ICounterfactualChartProps,
  ICounterfactualChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private readonly chartAndConfigsId = "IndividualFeatureImportanceChart";

  public constructor(props: ICounterfactualChartProps) {
    super(props);

    this.state = {
      xDialogOpen: false,
      yDialogOpen: false
    };
  }
  public render(): React.ReactNode {
    const classNames = counterfactualChartStyles();

    const plotlyProps = generatePlotlyProps(
      this.context.jointDataset,
      this.props.chartProps,
      this.context.selectedErrorCohort.cohort,
      this.props.selectedPointsIndexes,
      this.props.customPoints
    );

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
            orderedGroupTitles={[
              ColumnCategories.Index,
              ColumnCategories.Dataset,
              ColumnCategories.Outcome
            ]}
            selectedColumn={this.props.chartProps.yAxis}
            canBin={false}
            mustBin={false}
            allowTreatAsCategorical
            canDither={this.props.chartProps.chartType === ChartTypes.Scatter}
            hideDroppedFeatures
            onAccept={this.onYSet}
            onCancel={this.setYClose}
          />
        )}
        {this.state.xDialogOpen && (
          <AxisConfigDialog
            orderedGroupTitles={[
              ColumnCategories.Index,
              ColumnCategories.Dataset,
              ColumnCategories.Outcome
            ]}
            selectedColumn={this.props.chartProps.xAxis}
            canBin={
              this.props.chartProps.chartType === ChartTypes.Histogram ||
              this.props.chartProps.chartType === ChartTypes.Box
            }
            mustBin={
              this.props.chartProps.chartType === ChartTypes.Histogram ||
              this.props.chartProps.chartType === ChartTypes.Box
            }
            allowTreatAsCategorical
            canDither={this.props.chartProps.chartType === ChartTypes.Scatter}
            hideDroppedFeatures
            onAccept={this.onXSet}
            onCancel={this.setXClose}
          />
        )}
        <Stack horizontal={false}>
          <Stack.Item className={classNames.chartWithVertical}>
            <Stack horizontal id={this.chartAndConfigsId}>
              <Stack.Item className={classNames.verticalAxis}>
                <div className={classNames.rotatedVerticalBox}>
                  <DefaultButton
                    onClick={this.setYOpen}
                    text={
                      this.context.jointDataset.metaDict[
                        this.props.chartProps.yAxis.property
                      ].abbridgedLabel
                    }
                    title={
                      this.context.jointDataset.metaDict[
                        this.props.chartProps.yAxis.property
                      ].label
                    }
                  />
                </div>
              </Stack.Item>
              <Stack.Item className={classNames.mainChartContainer}>
                <BasicHighChart
                  configOverride={getCounterfactualChartOptions(
                    plotlyProps,
                    this.selectPointFromChart,
                    this.props.chartProps
                  )}
                  theme={getTheme()}
                  id="CounterfactualChart"
                />
              </Stack.Item>
            </Stack>
          </Stack.Item>
          <Stack className={classNames.horizontalAxisWithPadding}>
            <div className={classNames.horizontalAxis}>
              <DefaultButton
                onClick={this.setXOpen}
                text={
                  this.context.jointDataset.metaDict[
                    this.props.chartProps.xAxis.property
                  ].abbridgedLabel
                }
                title={
                  this.context.jointDataset.metaDict[
                    this.props.chartProps.xAxis.property
                  ].label
                }
              />
            </div>
          </Stack>
        </Stack>
      </Stack.Item>
    );
  }

  private onXSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.xAxis = value;
    this.setState({ xDialogOpen: false });
    this.props.onChartPropsUpdated(newProps);
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.yAxis = value;
    this.setState({ yDialogOpen: false });
    this.props.onChartPropsUpdated(newProps);
  };

  private readonly setXOpen = (): void => {
    this.setState({ xDialogOpen: !this.state.xDialogOpen });
  };

  private readonly setXClose = (): void => {
    this.setState({ xDialogOpen: false });
  };

  private readonly setYOpen = (): void => {
    this.setState({ yDialogOpen: !this.state.yDialogOpen });
  };

  private readonly setYClose = (): void => {
    this.setState({ yDialogOpen: false });
  };

  private selectPointFromChart = (data: any): void => {
    const index = data.customdata[JointDataset.IndexLabel];
    this.props.setTemporaryPointToCopyOfDatasetPoint(index);
    this.props.toggleSelectionOfPoint(index);
    this.logTelemetryEvent(
      TelemetryEventName.CounterfactualNewDatapointSelectedFromChart
    );
  };
  private logTelemetryEvent = (eventName: TelemetryEventName): void => {
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: eventName
    });
  };
}
