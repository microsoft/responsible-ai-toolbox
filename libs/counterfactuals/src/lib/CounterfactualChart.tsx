// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, DefaultButton, Stack } from "@fluentui/react";
import {
  AxisConfigDialog,
  ColumnCategories,
  // JointDataset,
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  BasicHighChart,
  ITelemetryEvent,
  TelemetryEventName,
  JointDataset,
  TelemetryLevels,
  Cohort,
  ICounterfactualData
  // TelemetryLevels,
  // TelemetryEventName
} from "@responsible-ai/core-ui";
import _ from "lodash";
import React from "react";
import { calculateBubblePlotDataFromErrorCohort } from "../util/calculateBubbleData";
import { getLocalCounterfactualsFromSDK } from "../util/getOnScatterPlotPointClick";

// import { generatePlotlyProps } from "../util/generatePlotlyProps";

import { counterfactualChartStyles } from "./CounterfactualChart.styles";
import { CounterfactualPanel } from "./CounterfactualPanel";
import { updateScatterPlotMarker } from "./getCounterfactualsScatter";

export interface ICounterfactualChartProps {
  chartProps: IGenericChartProps;
  customPoints: Array<{ [key: string]: any }>;
  isPanelOpen: boolean;
  originalData?: { [key: string]: string | number };
  selectedPointsIndexes: number[];
  temporaryPoint: { [key: string]: any } | undefined;
  cohort: Cohort;
  jointDataset: JointDataset;
  requestBubblePlotData?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<any>;
  counterfactualData?: ICounterfactualData;
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
  setTemporaryPointToCopyOfDatasetPoint: (index: number) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
  togglePanel: () => void;
  toggleSelectionOfPoint: (index?: number) => void;
  setCounterfactualLocalImportanceData: (data: any) => void;
}

export interface ICounterfactualChartState {
  xDialogOpen: boolean;
  yDialogOpen: boolean;
  plotData: any;
  isBubbleClicked: boolean;
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
      yDialogOpen: false,
      plotData: undefined,
      isBubbleClicked: false
    };
  }

  public componentDidMount(): void {
    console.log("!!didmount");
    this.loadPlotData();
  }

  public componentDidUpdate(prevProps: ICounterfactualChartProps): void {
    console.log(
      "!!in didupdate: ",
      prevProps.chartProps,
      this.props.chartProps,
      "----",
      prevProps.selectedPointsIndexes,
      this.props.selectedPointsIndexes
    );
    if (
      !_.isEqual(prevProps.chartProps, this.props.chartProps) ||
      (!_.isEqual(
        prevProps.selectedPointsIndexes,
        this.props.selectedPointsIndexes
      ) &&
        this.state.isBubbleClicked === false) // refine this logic to handle large data
    ) {
      console.log("!!inside if");
      this.setPlotData();
    } else if (
      !_.isEqual(
        prevProps.selectedPointsIndexes,
        this.props.selectedPointsIndexes
      ) &&
      this.state.isBubbleClicked === true
    ) {
      console.log("!!inside else if");
      this.getUpdatedScatterPlot(this.props.selectedPointsIndexes);
    }

    // this.getOutlierData(boxPlotData);
  }

  public render(): React.ReactNode {
    const classNames = counterfactualChartStyles();

    // const plotlyProps = generatePlotlyProps(
    //   this.context.jointDataset,
    //   this.props.chartProps,
    //   this.context.selectedErrorCohort.cohort,
    //   this.props.selectedPointsIndexes,
    //   this.props.customPoints
    // );

    // const bubblePlotData = this.props.selectedCohorts.map(
    //   (cohort: ErrorCohort, index: number) => {
    //     return calculateBoxPlotDataFromErrorCohort(
    //       cohort,
    //       index,
    //       this.props.probabilityOption?.key || "",
    //       this.props.probabilityOption?.id,
    //       this.context.requestBoxPlotDistribution
    //     );
    //   }
    // );

    console.log(
      "!!in render: ",
      this.state.plotData,
      this.props.selectedPointsIndexes
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
            canDither={this.props.chartProps.chartType === ChartTypes.Scatter}
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
            canDither={this.props.chartProps.chartType === ChartTypes.Scatter}
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
                  configOverride={this.state.plotData}
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
    this.setState({ xDialogOpen: false, isBubbleClicked: false });
    this.props.onChartPropsUpdated(newProps);
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (!this.props.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.props.chartProps);
    newProps.yAxis = value;
    this.setState({ yDialogOpen: false, isBubbleClicked: false });
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

  private async loadPlotData(): Promise<any> {
    console.log("!!in getPlotData: ");
    const plotData = await calculateBubblePlotDataFromErrorCohort(
      this.props.cohort,
      this.props.chartProps,
      this.props.selectedPointsIndexes,
      this.props.customPoints,
      this.props.jointDataset,
      this.props.requestBubblePlotData,
      this.selectPointFromChart,
      this.selectPointFromChartLargeData,
      this.onBubbleClick
    );
    console.log("!!boxPlotData 2: ", plotData);
    this.setState({
      plotData: plotData
    });
  }

  private async setPlotData(): Promise<any> {
    console.log("!!in getPlotData: ");
    const plotData = await calculateBubblePlotDataFromErrorCohort(
      this.context.selectedErrorCohort.cohort,
      this.props.chartProps,
      this.props.selectedPointsIndexes,
      this.props.customPoints,
      this.context.jointDataset,
      this.context.requestBubblePlotData,
      this.selectPointFromChart,
      this.selectPointFromChartLargeData,
      this.onBubbleClick
    );
    console.log("!!boxPlotData 2: ", plotData);
    this.setState({
      plotData: plotData
    });
  }

  private getUpdatedScatterPlot(selectedPointsIndexes: number[]): void {
    console.log("!!in getUpdatedScatterPlot: ");
    const pData = updateScatterPlotMarker(
      this.state.plotData,
      selectedPointsIndexes
    );
    console.log(
      "!!pData 2: ",
      this.state.plotData,
      selectedPointsIndexes,
      pData
    );

    this.setState({
      plotData: pData
    });
  }

  // private async setPlotData(): Promise<void> {
  //   console.log("!!in setPlotData: ");
  //   const plotData = await this.getPlotData();
  //   console.log("!!boxPlotData 3: ", plotData);
  //   this.setState({
  //     plotData: plotData
  //   });
  // }

  private readonly onBubbleClick = (scatterPlotData: any): void => {
    console.log("!!in onBubbleClick: ");
    console.log("!!scatterPlotData: ", scatterPlotData);
    this.setState({
      plotData: scatterPlotData,
      isBubbleClicked: true
    });
  };

  private selectPointFromChart = (data: any): void => {
    console.log(
      "!!selectPointFromChart: ",
      data,
      JointDataset.IndexLabel,
      data.customdata[JointDataset.IndexLabel]
    );
    const index = data.customdata[JointDataset.IndexLabel];
    this.props.setTemporaryPointToCopyOfDatasetPoint(index);
    this.props.toggleSelectionOfPoint(index);
    this.logTelemetryEvent(
      TelemetryEventName.CounterfactualNewDatapointSelectedFromChart
    );
  };

  private selectPointFromChartLargeData = async (data: any): Promise<void> => {
    console.log(
      "!!in selectPointFromChartLargeData: ",
      this.props.counterfactualData,
      data,
      JointDataset.IndexLabel,
      data.customData[JointDataset.IndexLabel],
      this.context.requestLocalCounterfactuals
    );
    const localCounterfactualData = await getLocalCounterfactualsFromSDK(
      data,
      this.props.counterfactualData?.id,
      this.context.requestLocalCounterfactuals
    );

    const index = data.customData[JointDataset.IndexLabel];
    this.props.setTemporaryPointToCopyOfDatasetPoint(index);
    this.props.setCounterfactualLocalImportanceData(localCounterfactualData);
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
