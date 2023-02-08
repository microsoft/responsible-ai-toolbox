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
  OtherChartTypes,
  IScatterPoint,
  IHighchartsConfig,
  ChartTypes,
  instanceOfHighChart,
  getScatterOption,
  ICausalAnalysisData
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
  selectPointFromDropdownIntl,
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
  public constructor(props: ILargeCausalIndividualChartProps) {
    super(props);
    this.state = getInitialSpec();
  }

  public componentDidMount(): void {
    if (!this.state.chartProps) {
      this.setState({
        chartProps: generateDefaultChartAxes(
          this.context.jointDataset,
          OtherChartTypes.Bubble
        )
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
    const canRenderChart =
      this.context.selectedErrorCohort.cohort.filteredData.length <
        rowErrorSize || this.state.chartProps?.chartType !== ChartTypes.Scatter;
    if (!this.context.jointDataset.hasDataset || !canRenderChart) {
      return (
        <MissingParametersPlaceholder>
          {!canRenderChart
            ? localization.Interpret.ValidationErrors.datasizeError
            : localization.CausalAnalysis.IndividualView.dataRequired}
        </MissingParametersPlaceholder>
      );
    }

    return (
      <Stack horizontal id="CausalIndividualChart" className={classNames.chart}>
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
    this.props.onDataClick(false, undefined);
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
      this.state.xMap,
      this.state.yMap,
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
    indexSeries: number[],
    xMap?: { [key: number]: string },
    yMap?: { [key: number]: string }
  ): void => {
    this.setState({
      indexSeries,
      isBubbleChartRendered: false,
      plotData: scatterPlotData,
      xMap,
      xSeries,
      yMap,
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
    this.props.onDataClick(true, undefined);
    const localCausalData = await getLocalCausalFromSDK(
      this.props.causalId,
      absoluteIndex,
      this.context.requestLocalCausalEffects
    );
    if (localCausalData && !instanceOfLocalCausalData(localCausalData)) {
      this.setState({
        isLocalCausalDataLoading: false,
        localCausalData: undefined,
        localCausalErrorMessage: getErrorMessage(localCausalData)
      });
      return;
    }
    this.setState({
      isLocalCausalDataLoading: false,
      localCausalData: localCausalData as ICausalAnalysisData
    });
    this.props.onDataClick(false, localCausalData as ICausalAnalysisData);
  };

  private selectPointFromDropdown = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    selectPointFromDropdownIntl(
      this.setTemporaryPointToCopyOfDatasetPoint,
      this.toggleSelectionOfPoint,
      this.setLocalCausalData,
      this.props.onDataClick,
      item,
      this.props.telemetryHook
    );
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
