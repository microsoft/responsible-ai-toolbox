// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  getTheme,
  Stack
} from "@fluentui/react";
import {
  ColumnCategories,
  IGenericChartProps,
  ISelectorConfig,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  FluentUIStyles,
  rowErrorSize,
  BasicHighChart,
  ITelemetryEvent,
  TelemetryLevels,
  TelemetryEventName,
  AxisConfig,
  OtherChartTypes,
  Cohort,
  IScatterPoint,
  IHighchartsConfig,
  ChartTypes
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { causalIndividualChartStyles } from "../CausalIndividualChart.styles";
import { CausalIndividualConstants } from "../CausalIndividualConstants";
import { CausalWhatIf } from "../CausalWhatIf";
import {
  generateDefaultChartAxes,
  getDataOptions
} from "../generateChartProps";

import { getBubblePlotData } from "./largeCausalIndividualChartUtils";

export interface ICausalIndividualChartProps {
  cohort: Cohort;
  onDataClick: (data: number | undefined) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface ICausalIndividualChartState {
  chartProps?: IGenericChartProps;
  selectedIndex?: number;
  plotData: any;
  temporaryPoint?: { [key: string]: any };
  xSeries: number[];
  ySeries: number[];
  indexSeries: number[];
  // isBubbleChartDataLoading: boolean;
  // bubbleChartErrorMessage?: string;
  isBubbleChartRendered: boolean;
  // isLocalCausalDataLoading: boolean;
  // localCausalErrorMessage?: string;
  // localCausalData: any;
}

export class LargeCausalIndividualChart extends React.PureComponent<
  ICausalIndividualChartProps,
  ICausalIndividualChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private readonly chartAndConfigsId = "CausalIndividualChart";

  public constructor(props: ICausalIndividualChartProps) {
    super(props);
    this.state = {
      // bubbleChartErrorMessage: undefined,
      indexSeries: [],
      // isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      // isLocalExplanationsDataLoading: false,
      plotData: undefined,
      xSeries: [],
      ySeries: []
    };
  }

  public componentDidMount(): void {
    this.setState({
      chartProps: generateDefaultChartAxes(
        this.context.jointDataset,
        OtherChartTypes.Bubble
      )
    });
  }

  public componentDidUpdate(
    _prevProps: ICausalIndividualChartProps,
    prevState: ICausalIndividualChartState
  ): void {
    if (!_.isEqual(prevState.chartProps, this.state.chartProps)) {
      this.updateBubblePlot(this.state.chartProps);
      return;
    }
  }

  public render(): React.ReactNode {
    const classNames = causalIndividualChartStyles();
    if (!this.context.jointDataset.hasDataset) {
      return (
        <MissingParametersPlaceholder>
          {localization.CausalAnalysis.IndividualView.dataRequired}
        </MissingParametersPlaceholder>
      );
    }
    if (this.state.chartProps === undefined) {
      return <div />;
    }
    const cohortLength =
      this.context.selectedErrorCohort.cohort.filteredData.length;
    const canRenderChart =
      cohortLength < rowErrorSize ||
      this.state.chartProps.chartType !== ChartTypes.Scatter;
    if (!canRenderChart) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ValidationErrors.datasizeError}
        </MissingParametersPlaceholder>
      );
    }

    // const plotlyProps = generatePlotlyProps(
    //   this.context.jointDataset,
    //   this.state.chartProps,
    //   this.context.selectedErrorCohort.cohort,
    //   this.state.selectedIndex,
    //   this.state.temporaryPoint
    // );
    return (
      <Stack
        horizontal
        id={this.chartAndConfigsId}
        className={classNames.chart}
      >
        <Stack.Item className={classNames.chartWithAxes}>
          <Stack horizontal={false}>
            <Stack.Item className={classNames.chartWithVertical}>
              <Stack horizontal>
                <Stack.Item className={classNames.verticalAxis}>
                  <div className={classNames.rotatedVerticalBox}>
                    <AxisConfig
                      buttonText={
                        this.context.jointDataset.metaDict[
                          this.state.chartProps.yAxis.property
                        ].abbridgedLabel
                      }
                      buttonTitle={
                        this.context.jointDataset.metaDict[
                          this.state.chartProps.yAxis.property
                        ].label
                      }
                      orderedGroupTitles={[
                        ColumnCategories.Index,
                        ColumnCategories.Dataset,
                        ColumnCategories.Outcome
                      ]}
                      selectedColumn={this.state.chartProps.yAxis}
                      canBin={false}
                      mustBin={false}
                      canDither={
                        this.state.chartProps.chartType === ChartTypes.Scatter
                      }
                      allowTreatAsCategorical
                      hideDroppedFeatures
                      onAccept={this.onYSet}
                    />
                  </div>
                </Stack.Item>
                <Stack.Item className={classNames.individualChartContainer}>
                  <BasicHighChart
                    configOverride={this.state.plotData}
                    theme={getTheme()}
                    id="CausalAggregateChart"
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>
            <Stack className={classNames.horizontalAxisWithPadding}>
              <div className={classNames.horizontalAxis}>
                <AxisConfig
                  buttonText={
                    this.context.jointDataset.metaDict[
                      this.state.chartProps.xAxis.property
                    ].abbridgedLabel
                  }
                  buttonTitle={
                    this.context.jointDataset.metaDict[
                      this.state.chartProps.xAxis.property
                    ].label
                  }
                  orderedGroupTitles={[
                    ColumnCategories.Index,
                    ColumnCategories.Dataset,
                    ColumnCategories.Outcome
                  ]}
                  selectedColumn={this.state.chartProps.xAxis}
                  canBin={
                    this.state.chartProps.chartType === ChartTypes.Histogram ||
                    this.state.chartProps.chartType === ChartTypes.Box
                  }
                  mustBin={
                    this.state.chartProps.chartType === ChartTypes.Histogram ||
                    this.state.chartProps.chartType === ChartTypes.Box
                  }
                  canDither={
                    this.state.chartProps.chartType === ChartTypes.Scatter
                  }
                  allowTreatAsCategorical
                  hideDroppedFeatures
                  onAccept={this.onXSet}
                />
              </div>
            </Stack>
          </Stack>
        </Stack.Item>
        <Stack className={classNames.legendAndText}>
          <ComboBox
            label={localization.CausalAnalysis.IndividualView.selectedDatapoint}
            onChange={this.selectPointFromDropdown}
            options={getDataOptions(this.context.selectedErrorCohort.cohort)}
            selectedKey={this.state.selectedIndex}
            ariaLabel={"datapoint picker"}
            useComboBoxAsMenuWidth
            styles={FluentUIStyles.smallDropdownStyle}
          />
          <CausalWhatIf selectedIndex={this.state.selectedIndex} />
        </Stack>
      </Stack>
    );
  }

  private setTemporaryPointToCopyOfDatasetPoint(index: number): void {
    this.setState({
      temporaryPoint: {
        ...this.context.jointDataset.getRow(index),
        [CausalIndividualConstants.namePath]: localization.formatString(
          localization.Interpret.WhatIf.defaultCustomRootName,
          index
        ),
        [CausalIndividualConstants.colorPath]:
          FluentUIStyles.fluentUIColorPalette[
            CausalIndividualConstants.MAX_SELECTION
          ]
      }
    });
  }

  private async updateBubblePlot(
    chartProps?: IGenericChartProps
  ): Promise<void> {
    // this.setState({
    //   isBubbleChartDataLoading: true
    // });
    // this.props.onIndexSeriesUpdated && this.props.onIndexSeriesUpdated([]);
    // this.props.resetIndexes();
    // this.props.resetCustomPoints();
    // this.setState({
    //   indexSeries: [],
    //   isBubbleChartDataLoading: true,
    //   selectedIndex: undefined,
    //   xSeries: [],
    //   ySeries: []
    // });
    if (chartProps) {
      const plotData = await getBubblePlotData(
        chartProps,
        this.props.cohort,
        this.context.jointDataset,
        this.context.dataset,
        false, //update this
        this.context.requestBubblePlotData,
        this.selectPointFromChartLargeData,
        this.onBubbleClick
      );
      // if (plotData && !instanceOfHighChart(plotData)) {
      //   this.setState({
      //     bubbleChartErrorMessage: plotData.toString().split(":").pop(),
      //     isBubbleChartDataLoading: false,
      //     plotData: undefined
      //   });
      //   return;
      // }
      this.setState({
        // bubbleChartErrorMessage: undefined,
        // isBubbleChartDataLoading: false,
        // isBubbleChartRendered: true,
        plotData
      });
    }
  }

  private onBubbleClick = (
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
    // selectPointFromChartLargeData(
    //   data,
    //   this.setLocalCausalData,
    //   this.toggleSelectionOfPoint,
    //   this.props.telemetryHook
    // );
    const localExplanationsData = await getLocalExplanationsFromSDK(
      absoluteIndex,
      this.context.requestLocalExplanations
    );
    console.log("!!localExplanationsData:", localExplanationsData);
  };

  // private setLocalCausalData = async (
  //   _absoluteIndex: number
  // ): Promise<void> => {
  // this.setState({
  //   isLocalCausalDataLoading: true,
  //   localCausalErrorMessage: undefined
  // });
  // const localExplanationsData = await getLocalExplanationsFromSDK(
  //   absoluteIndex,
  //   this.context.requestLocalExplanations
  // );
  // if (
  //   typeof localExplanationsData === "object" &&
  //   localExplanationsData &&
  //   !instanceOfLocalExplanation(localExplanationsData)
  // ) {
  //   this.setState({
  //     isLocalCausalDataLoading: false,
  //     localCausalData: undefined,
  //     localCausalErrorMessage: getErrorMessage(localExplanationsData)
  //   });
  //   return;
  // }
  // this.setState({
  //   isLocalCausalDataLoading: false,
  //   localExplanationsData
  // });
  // };

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

  // private selectPointFromChart = (data: any): void => {
  //   const index = data.customdata[JointDataset.IndexLabel];
  //   this.setTemporaryPointToCopyOfDatasetPoint(index);
  //   this.toggleSelectionOfPoint(index);
  //   this.props.telemetryHook?.({
  //     level: TelemetryLevels.ButtonClick,
  //     type: TelemetryEventName.IndividualCausalSelectedDatapointUpdatedFromChart
  //   });
  // };

  private selectPointFromDropdown = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "number") {
      const index = item.key;
      this.setTemporaryPointToCopyOfDatasetPoint(index);
      this.toggleSelectionOfPoint(index);
      this.props.telemetryHook?.({
        level: TelemetryLevels.ButtonClick,
        type: TelemetryEventName.IndividualCausalSelectedDatapointUpdatedFromDropdown
      });
    }
  };

  private toggleSelectionOfPoint(selectedIndex?: number): void {
    this.props.onDataClick(selectedIndex);
    this.setState({ selectedIndex });
  }
}
