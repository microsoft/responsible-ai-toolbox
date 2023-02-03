// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  getTheme,
  Stack,
  DefaultButton
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
  ChartTypes,
  instanceOfHighChart,
  getScatterOption,
  LoadingSpinner
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { causalIndividualChartStyles } from "../CausalIndividualChart.styles";
import { CausalIndividualConstants } from "../CausalIndividualConstants";
import { CausalWhatIf } from "../CausalWhatIf";
import { generateDefaultChartAxes } from "../generateChartProps";

import { getLocalCausalFromSDK } from "./getOnScatterPlotPointClick";
import {
  absoluteIndexKey,
  generateHighChartConfigOverride,
  getBubblePlotData,
  getDataOptions,
  getNewSelections,
  instanceOfLocalCausalData,
  selectPointFromChartLargeData,
  shouldUpdateHighchart
} from "./largeCausalIndividualChartUtils";

export interface ICausalIndividualChartProps {
  causalId: string;
  cohort: Cohort;
  onDataClick: (
    data: number | undefined | any,
    isLocalCausalDataLoading: boolean
  ) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface ICausalIndividualChartState {
  chartProps?: IGenericChartProps;
  selectedPointsIndexes: number[];
  plotData: any;
  temporaryPoint?: { [key: string]: any };
  xSeries: number[];
  ySeries: number[];
  indexSeries: number[];
  isRevertButtonClicked: boolean;
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
  isBubbleChartRendered: boolean;
  isLocalCausalDataLoading: boolean;
  localCausalErrorMessage?: string;
  localCausalData: any;
}

export class LargeCausalIndividualChart extends React.PureComponent<
  ICausalIndividualChartProps,
  ICausalIndividualChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private changedKeys: string[] = [];

  private readonly chartAndConfigsId = "CausalIndividualChart";

  public constructor(props: ICausalIndividualChartProps) {
    super(props);
    this.state = {
      bubbleChartErrorMessage: undefined,
      selectedPointsIndexes: [],
      indexSeries: [],
      isRevertButtonClicked: false,
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      isLocalCausalDataLoading: false,
      plotData: undefined,
      xSeries: [],
      ySeries: [],
      localCausalData: undefined
    };
  }

  public componentDidMount(): void {
    const chartProps = generateDefaultChartAxes(
      this.context.jointDataset,
      OtherChartTypes.Bubble
    );
    if (!this.state.chartProps) {
      this.setState({
        chartProps
      });
    }
  }

  public componentDidUpdate(
    prevProps: ICausalIndividualChartProps,
    prevState: ICausalIndividualChartState
  ): void {
    const [
      shouldUpdate,
      hasSelectedPointIndexesUpdated,
      hasIsLocalExplanationsDataLoadingUpdated,
      hasRevertToBubbleChartUpdated,
      hasCohortUpdated,
      hasChartPropsUpdated,
      hasAxisTypeChanged
    ] = shouldUpdateHighchart(
      prevState,
      prevProps,
      this.state,
      this.props,
      this.changedKeys
    );
    if (shouldUpdate) {
      this.state.chartProps
        ? generateHighChartConfigOverride(
            this.state.chartProps,
            hasSelectedPointIndexesUpdated,
            hasIsLocalExplanationsDataLoadingUpdated,
            hasRevertToBubbleChartUpdated,
            hasChartPropsUpdated,
            hasCohortUpdated,
            hasAxisTypeChanged,
            this.updateBubblePlotData,
            this.updateScatterPlotData
          )
        : this.setState({
            chartProps: this.state.chartProps
          });
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
    const disableAxisButton =
      this.state.isBubbleChartDataLoading ||
      this.state.isLocalCausalDataLoading;
    const orderedGroupTitles = [
      ColumnCategories.Index,
      ColumnCategories.Dataset,
      ColumnCategories.Outcome
    ];
    const isHistogramOrBoxChart =
      this.state.chartProps?.chartType === ChartTypes.Histogram ||
      this.state.chartProps?.chartType === ChartTypes.Box;
    const isScatterChart =
      this.state.chartProps?.chartType === ChartTypes.Scatter;
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
                      allowTreatAsCategorical={isHistogramOrBoxChart}
                      allowLogarithmicScaling={
                        isHistogramOrBoxChart ||
                        !this.state.isBubbleChartRendered
                      }
                      orderedGroupTitles={orderedGroupTitles}
                      selectedColumn={this.state.chartProps.yAxis}
                      canBin={false}
                      mustBin={false}
                      canDither={isScatterChart}
                      hideDroppedFeatures
                      onAccept={this.onYSet}
                      disabled={disableAxisButton}
                    />
                  </div>
                </Stack.Item>
                <Stack.Item className={classNames.individualChartContainer}>
                  {this.state.bubbleChartErrorMessage && (
                    <MissingParametersPlaceholder>
                      {localization.formatString(
                        localization.Counterfactuals.BubbleChartFetchError,
                        this.state.bubbleChartErrorMessage
                      )}
                    </MissingParametersPlaceholder>
                  )}
                  {!this.state.isBubbleChartDataLoading ? (
                    <BasicHighChart
                      configOverride={this.state.plotData}
                      theme={getTheme()}
                      id="CausalAggregateChart"
                    />
                  ) : (
                    <LoadingSpinner
                      label={localization.Counterfactuals.loading}
                    />
                  )}
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
                  orderedGroupTitles={orderedGroupTitles}
                  selectedColumn={this.state.chartProps.xAxis}
                  canBin={isHistogramOrBoxChart}
                  mustBin={isHistogramOrBoxChart}
                  canDither={isScatterChart}
                  allowTreatAsCategorical={isHistogramOrBoxChart}
                  allowLogarithmicScaling={
                    isHistogramOrBoxChart || !this.state.isBubbleChartRendered
                  }
                  hideDroppedFeatures
                  onAccept={this.onXSet}
                  disabled={disableAxisButton}
                />
              </div>
            </Stack>
          </Stack>
        </Stack.Item>
        {this.state.indexSeries.length > 0 && (
          <Stack className={classNames.legendAndText}>
            <ComboBox
              label={
                localization.CausalAnalysis.IndividualView.selectedDatapoint
              }
              onChange={this.selectPointFromDropdown}
              options={getDataOptions(this.state.indexSeries)}
              selectedKey={`${this.state.selectedPointsIndexes[0]}`}
              ariaLabel={"datapoint picker"}
              useComboBoxAsMenuWidth
              styles={FluentUIStyles.smallDropdownStyle}
              disabled={this.state.isLocalCausalDataLoading}
            />
            <CausalWhatIf
              selectedIndex={this.state.selectedPointsIndexes[0]}
              isLocalCausalDataLoading={this.state.isLocalCausalDataLoading}
            />
            {!this.state.isBubbleChartRendered && (
              <DefaultButton
                className={classNames.buttonStyle}
                onClick={this.onRevertButtonClick}
                text={localization.Counterfactuals.revertToBubbleChart}
                title={localization.Counterfactuals.revertToBubbleChart}
                disabled={this.state.isLocalCausalDataLoading}
              />
            )}
          </Stack>
        )}
      </Stack>
    );
  }

  private onRevertButtonClick = (): void => {
    this.setState({ isRevertButtonClicked: true });
  };

  private setTemporaryPointToCopyOfDatasetPoint(
    index: number,
    absoluteIndex: number
  ): void {
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
          ],
        [absoluteIndexKey]: absoluteIndex
      }
    });
  }

  private updateBubblePlotData = async (
    chartProps: IGenericChartProps
  ): Promise<void> => {
    this.setState({
      indexSeries: [],
      isBubbleChartDataLoading: true,
      isLocalCausalDataLoading: false,
      localCausalData: undefined,
      localCausalErrorMessage: undefined,
      selectedPointsIndexes: [],
      xSeries: [],
      ySeries: []
    });
    this.props.onDataClick(undefined, false);
    const datasetBarConfigOverride = await getBubblePlotData(
      chartProps,
      this.props.cohort,
      this.context.jointDataset,
      this.context.dataset,
      this.state.isLocalCausalDataLoading,
      this.context.requestBubblePlotData,
      this.selectPointFromChartLargeData,
      this.onBubbleClick
    );
    if (
      datasetBarConfigOverride &&
      !instanceOfHighChart(datasetBarConfigOverride)
    ) {
      this.setState({
        bubbleChartErrorMessage: datasetBarConfigOverride
          .toString()
          .split(":")
          .pop(),
        plotData: undefined,
        isBubbleChartDataLoading: false
      });
      return;
    }
    this.setState({
      chartProps,
      plotData: datasetBarConfigOverride,
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      isRevertButtonClicked: false
    });
  };

  private updateScatterPlotData = (chartProps: IGenericChartProps): void => {
    const datasetBarConfigOverride = getScatterOption(
      this.state.xSeries,
      this.state.ySeries,
      this.state.indexSeries,
      chartProps,
      this.context.jointDataset,
      this.state.selectedPointsIndexes,
      [],
      this.state.isLocalCausalDataLoading,
      true,
      false,
      this.selectPointFromChartLargeData
    );
    this.setState({
      chartProps,
      plotData: datasetBarConfigOverride,
      isBubbleChartRendered: false,
      isRevertButtonClicked: false
    });
  };

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
    selectPointFromChartLargeData(
      data,
      this.setLocalCausalData,
      this.toggleSelectionOfPoint,
      this.props.onDataClick,
      this.props.telemetryHook
    );
  };

  private setLocalCausalData = async (absoluteIndex: number): Promise<void> => {
    this.setState({
      isLocalCausalDataLoading: true,
      localCausalErrorMessage: undefined
    });
    this.props.onDataClick(undefined, true);
    const localCausalData = await getLocalCausalFromSDK(
      this.props.causalId,
      absoluteIndex,
      this.context.requestLocalCausalEffects
    );
    if (
      typeof localCausalData === "object" &&
      localCausalData &&
      !instanceOfLocalCausalData(localCausalData)
    ) {
      this.setState({
        isLocalCausalDataLoading: false,
        localCausalData: undefined,
        localCausalErrorMessage: localCausalData.toString().split(":").pop()
      });
      return;
    }
    this.setState({
      isLocalCausalDataLoading: false,
      localCausalData: localCausalData
    });
    this.props.onDataClick(localCausalData, false);
  };

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

  private selectPointFromDropdown = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      const index = Number.parseInt(item.key);
      this.setTemporaryPointToCopyOfDatasetPoint(index, item.data.index);
      const newSelections = this.toggleSelectionOfPoint(index);
      if (newSelections && newSelections.length > 0) {
        this.setLocalCausalData(item.data.index);
      } else {
        this.props.onDataClick(undefined, false);
      }
      this.props.telemetryHook?.({
        level: TelemetryLevels.ButtonClick,
        type: TelemetryEventName.IndividualCausalSelectedDatapointUpdatedFromDropdown
      });
    }
  };

  private toggleSelectionOfPoint = (index?: number): number[] | undefined => {
    const newSelections = getNewSelections(
      this.state.selectedPointsIndexes,
      index
    );
    if (newSelections !== undefined) {
      this.setState({
        selectedPointsIndexes: newSelections
      });
    }
    return newSelections;
  };
}
