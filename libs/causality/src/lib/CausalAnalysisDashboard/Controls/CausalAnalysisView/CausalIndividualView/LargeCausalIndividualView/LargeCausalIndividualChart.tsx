// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption, IComboBox, Stack } from "@fluentui/react";
import {
  IGenericChartProps,
  ISelectorConfig,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  rowErrorSize,
  TelemetryLevels,
  TelemetryEventName,
  OtherChartTypes,
  IScatterPoint,
  IHighchartsConfig,
  ChartTypes,
  instanceOfHighChart,
  getScatterOption
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { causalIndividualChartStyles } from "../CausalIndividualChart.styles";
import { generateDefaultChartAxes } from "../generateChartProps";

import { getLocalCausalFromSDK } from "./getOnScatterPlotPointClick";
import {
  getInitialSpec,
  ILargeCausalIndividualChartProps,
  ILargeCausalIndividualChartState
} from "./ILargeCausalIndividualChartSpec";
import { LargeCausalIndividualChartArea } from "./LargeCausalIndividualChartArea";
import { LargeCausalIndividualChartLegend } from "./LargeCausalIndividualChartLegend";
import {
  generateHighChartConfigOverride,
  getBubblePlotData,
  getErrorMessage,
  getNewChartProps,
  getNewSelections,
  getTemporaryPoint,
  instanceOfLocalCausalData,
  selectPointFromChartLargeData,
  shouldUpdateHighchart
} from "./largeCausalIndividualChartUtils";

export class LargeCausalIndividualChart extends React.PureComponent<
  ILargeCausalIndividualChartProps,
  ILargeCausalIndividualChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private changedKeys: string[] = [];
  private readonly chartAndConfigsId = "CausalIndividualChart";
  public constructor(props: ILargeCausalIndividualChartProps) {
    super(props);
    this.state = getInitialSpec();
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
    prevProps: ILargeCausalIndividualChartProps,
    prevState: ILargeCausalIndividualChartState
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

    return (
      <Stack
        horizontal
        id={this.chartAndConfigsId}
        className={classNames.chart}
      >
        <LargeCausalIndividualChartArea
          chartProps={this.state.chartProps}
          plotData={this.state.plotData}
          isBubbleChartDataLoading={this.state.isBubbleChartDataLoading}
          bubbleChartErrorMessage={this.state.bubbleChartErrorMessage}
          isBubbleChartRendered={this.state.isBubbleChartRendered}
          isLocalCausalDataLoading={this.state.isLocalCausalDataLoading}
          onXSet={this.onXSet}
          onYSet={this.onYSet}
        />
        <LargeCausalIndividualChartLegend
          indexSeries={this.state.indexSeries}
          selectedPointsIndexes={this.state.selectedPointsIndexes}
          isLocalCausalDataLoading={this.state.isLocalCausalDataLoading}
          temporaryPoint={this.state.temporaryPoint}
          isBubbleChartRendered={this.state.isBubbleChartRendered}
          onRevertButtonClick={this.onRevertButtonClick}
          selectPointFromDropdown={this.selectPointFromDropdown}
        />
      </Stack>
    );
  }

  private onRevertButtonClick = (): void => {
    this.setState({ isRevertButtonClicked: true });
  };

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
        bubbleChartErrorMessage: getErrorMessage(datasetBarConfigOverride),
        isBubbleChartDataLoading: false,
        plotData: undefined
      });
      return;
    }
    this.setState({
      chartProps,
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      isRevertButtonClicked: false,
      plotData: datasetBarConfigOverride
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
      isBubbleChartRendered: false,
      isRevertButtonClicked: false,
      plotData: datasetBarConfigOverride
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

  private onXSet = (value: ISelectorConfig): void => {
    if (this.state.chartProps) {
      const newProps = getNewChartProps(value, true, this.state.chartProps);
      this.setState({ chartProps: newProps });
    }
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (this.state.chartProps) {
      const newProps = getNewChartProps(value, false, this.state.chartProps);
      this.setState({ chartProps: newProps });
    }
  };

  private selectPointFromChartLargeData = async (
    data: IScatterPoint
  ): Promise<void> => {
    selectPointFromChartLargeData(
      data,
      this.setLocalCausalData,
      this.toggleSelectionOfPoint,
      this.props.onDataClick,
      this.setTemporaryPointToCopyOfDatasetPoint,
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
        localCausalErrorMessage: getErrorMessage(localCausalData)
      });
      return;
    }
    this.setState({
      isLocalCausalDataLoading: false,
      localCausalData
    });
    this.props.onDataClick(localCausalData, false);
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

  private setTemporaryPointToCopyOfDatasetPoint = (
    index: number,
    absoluteIndex: number
  ): void => {
    this.setState({
      temporaryPoint: getTemporaryPoint(
        this.context.jointDataset,
        index,
        absoluteIndex
      )
    });
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
