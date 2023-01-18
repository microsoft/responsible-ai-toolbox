// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IDropdownOption,
  Dropdown,
  Text,
  Stack
} from "@fluentui/react";
import {
  ColumnCategories,
  cohortKey,
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  rowErrorSize,
  BasicHighChart,
  TelemetryLevels,
  TelemetryEventName,
  ITelemetryEvent,
  AxisConfig,
  OtherChartTypes,
  calculateBubblePlotDataFromErrorCohort,
  IHighchartsConfig,
  ifEnableLargeData,
  hasAxisTypeChanged,
  getCounterfactualsScatterOption,
  LoadingSpinner
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";
import { SidePanel } from "../DataAnalysisView/SidePanel";

import { datasetExplorerTabStyles } from "../utils/DatasetExplorerTab.styles";
import { generateDefaultChartAxes } from "../utils/generateDefaultChartAxes";
import { generatePlotlyProps } from "../utils/generatePlotlyProps";
import { getDatasetOption } from "../utils/getDatasetOption";
import { getBarOrBoxChartConfig } from "./getBarOrBoxChartConfig";

export interface IDatasetExplorerTabProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface IDatasetExplorerTabState {
  chartProps?: IGenericChartProps;
  selectedCohortIndex: number;
  highChartConfigOverride?: any;
  isBubbleChartRendered?: boolean;
  xSeries: number[];
  ySeries: number[];
  indexSeries: number[];
  isBubbleChartDataLoading: boolean;
  bubbleChartErrorMessage?: string;
}

export class LargeDatasetExplorerTab extends React.Component<
  IDatasetExplorerTabProps,
  IDatasetExplorerTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private changedKeys: string[] = [];

  private readonly chartAndConfigsId = "LargeDatasetExplorerChart";

  public constructor(props: IDatasetExplorerTabProps) {
    super(props);

    this.state = {
      selectedCohortIndex: 0,
      isBubbleChartRendered: false,
      bubbleChartErrorMessage: undefined,
      indexSeries: [],
      isBubbleChartDataLoading: false,
      xSeries: [],
      ySeries: []
    };
  }

  public componentDidMount(): void {
    const initialCohortIndex = 0;
    const chartProps = generateDefaultChartAxes(this.context.jointDataset);
    this.generateHighChartConfigOverride(initialCohortIndex, chartProps);
  }

  public componentDidUpdate(
    _preProp: IDatasetExplorerTabProps,
    preState: IDatasetExplorerTabState
  ): void {
    if (preState.selectedCohortIndex >= this.context.errorCohorts.length) {
      this.generateHighChartConfigOverride(0, this.state.chartProps);
    }
  }

  public render(): React.ReactNode {
    const classNames = datasetExplorerTabStyles();

    if (!this.context.jointDataset.hasDataset) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.DatasetExplorer.missingParameters}
        </MissingParametersPlaceholder>
      );
    }

    if (
      this.state.highChartConfigOverride === undefined ||
      this.state.chartProps === undefined
    ) {
      return <div />;
    }

    const selectedCohortIndex =
      this.state.selectedCohortIndex >= this.context.errorCohorts.length
        ? 0
        : this.state.selectedCohortIndex;

    const cohortOptions =
      this.state.chartProps.xAxis.property !== cohortKey
        ? this.context.errorCohorts.map((errorCohort, index) => {
            return { key: index, text: errorCohort.cohort.name };
          })
        : undefined;
    const cohortLength =
      this.context.errorCohorts[selectedCohortIndex].cohort.filteredData.length;
    const canRenderChart =
      cohortLength < rowErrorSize ||
      this.state.chartProps.chartType !== ChartTypes.Scatter;
    const yAxisCategories = [
      ColumnCategories.Index,
      ColumnCategories.Dataset,
      ColumnCategories.Outcome
    ];
    if (this.state.chartProps.chartType !== ChartTypes.Scatter) {
      yAxisCategories.push(ColumnCategories.None);
    }

    console.log(
      "!!state: ",
      this.state.chartProps,
      this.state.isBubbleChartRendered
    );
    return (
      <Stack
        horizontal={false}
        grow
        tokens={{ childrenGap: "l1" }}
        className={classNames.page}
        id={this.chartAndConfigsId}
      >
        <Stack.Item className={classNames.infoWithText}>
          <Text variant="medium">
            {localization.Interpret.DatasetExplorer.helperText}
          </Text>
        </Stack.Item>
        <Stack.Item className={classNames.cohortPickerWrapper}>
          <Stack horizontal grow className={classNames.cohortPicker}>
            <Text variant="mediumPlus" className={classNames.cohortPickerLabel}>
              {localization.Interpret.ModelPerformance.cohortPickerLabel}
            </Text>
            {cohortOptions && (
              <Dropdown
                className={classNames.cohortDropdown}
                id="dataExplorerCohortDropdown"
                options={cohortOptions}
                selectedKey={this.state.selectedCohortIndex}
                onChange={this.setSelectedCohort}
                ariaLabel={
                  localization.Interpret.DatasetExplorer.datasetCohortDropdown
                }
                disabled={this.state.isBubbleChartDataLoading}
              />
            )}
          </Stack>
        </Stack.Item>
        <Stack.Item className={classNames.mainArea}>
          <Stack horizontal grow className={classNames.chartAndType}>
            <div className={classNames.chart}>
              <Stack.Item className={classNames.chartWithAxes}>
                <Stack horizontal className={classNames.chartWithVertical}>
                  <Stack.Item className={classNames.verticalAxis}>
                    <div className={classNames.rotatedVerticalBox}>
                      <AxisConfig
                        orderedGroupTitles={yAxisCategories}
                        selectedColumn={this.state.chartProps.yAxis}
                        canBin={false}
                        mustBin={false}
                        canDither={
                          this.state.chartProps.chartType === ChartTypes.Scatter
                        }
                        allowTreatAsCategorical={
                          this.state.chartProps.chartType ===
                            ChartTypes.Histogram ||
                          this.state.chartProps.chartType === ChartTypes.Box
                        }
                        allowLogarithmicScaling={
                          this.state.chartProps.chartType ===
                            ChartTypes.Histogram ||
                          this.state.chartProps.chartType === ChartTypes.Box ||
                          !this.state.isBubbleChartRendered
                        }
                        onAccept={this.onYSet}
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
                        disabled={this.state.isBubbleChartDataLoading}
                      />
                    </div>
                  </Stack.Item>
                  <Stack.Item className={classNames.chartContainer}>
                    {!canRenderChart && (
                      <MissingParametersPlaceholder>
                        {localization.Interpret.ValidationErrors.datasizeError}
                      </MissingParametersPlaceholder>
                    )}
                    {this.state.isBubbleChartDataLoading ? (
                      <LoadingSpinner
                        label={localization.Counterfactuals.loading}
                      />
                    ) : (
                      <BasicHighChart
                        configOverride={this.state.highChartConfigOverride}
                        theme={getTheme()}
                      />
                    )}
                  </Stack.Item>
                </Stack>
              </Stack.Item>
              <div className={classNames.horizontalAxis}>
                <AxisConfig
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
                  allowTreatAsCategorical={
                    this.state.chartProps.chartType === ChartTypes.Histogram ||
                    this.state.chartProps.chartType === ChartTypes.Box
                  }
                  allowLogarithmicScaling={
                    this.state.chartProps.chartType === ChartTypes.Histogram ||
                    this.state.chartProps.chartType === ChartTypes.Box ||
                    !this.state.isBubbleChartRendered
                  }
                  canDither={
                    this.state.chartProps.chartType === ChartTypes.Scatter
                  }
                  onAccept={this.onXSet}
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
                  disabled={this.state.isBubbleChartDataLoading}
                />
              </div>
            </div>
            <Stack.Item className={classNames.sidePanel}>
              <SidePanel
                chartProps={this.state.chartProps}
                cohorts={this.context.errorCohorts.map(
                  (errorCohort) => errorCohort.cohort
                )}
                jointDataset={this.context.jointDataset}
                selectedCohortIndex={this.state.selectedCohortIndex}
                onChartPropChange={this.onChartPropsChange}
                hideColorValue={true}
                dataset={this.context.dataset}
                disabled={this.state.isBubbleChartDataLoading}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }

  private onChartPropsChange = (chartProps: IGenericChartProps): void => {
    this.generateHighChartConfigOverride(
      this.state.selectedCohortIndex,
      chartProps
    );
  };

  private async generateHighChartConfigOverride(
    cohortIndex: number,
    chartProps: IGenericChartProps | undefined
  ): Promise<void> {
    console.log("!!charts: ", this.state.chartProps, chartProps);
    if (chartProps) {
      if (
        !this.context.requestDatasetAnalysisBarChart ||
        !this.context.requestDatasetAnalysisBoxChart ||
        !chartProps?.xAxis.property ||
        !chartProps?.yAxis.property
      ) {
        const plotlyProps = generatePlotlyProps(
          this.context.jointDataset,
          chartProps,
          this.context.errorCohorts.map((errorCohort) => errorCohort.cohort)[
            cohortIndex
          ]
        );
        const configOverride = getDatasetOption(
          plotlyProps,
          this.context.jointDataset,
          chartProps
        );

        this.setState({
          chartProps,
          highChartConfigOverride: configOverride,
          selectedCohortIndex: cohortIndex
        });
        return;
      }
      if (chartProps.chartType !== OtherChartTypes.Bubble) {
        const datasetBarConfigOverride = await getBarOrBoxChartConfig(
          this.context.errorCohorts[cohortIndex].cohort,
          this.context.jointDataset,
          chartProps?.xAxis.property,
          chartProps?.yAxis.property,
          this.context.requestDatasetAnalysisBarChart,
          this.context.requestDatasetAnalysisBoxChart
        );

        this.setState({
          chartProps,
          highChartConfigOverride: datasetBarConfigOverride,
          selectedCohortIndex: cohortIndex
        });
      } else {
        const hasAxisTypeChanged = this.hasAxisTypeChanged(chartProps);
        let datasetBarConfigOverride;
        if (!hasAxisTypeChanged) {
          this.setState({
            isBubbleChartDataLoading: true
          });
          datasetBarConfigOverride =
            await calculateBubblePlotDataFromErrorCohort(
              this.context.errorCohorts[cohortIndex].cohort,
              chartProps,
              [],
              this.context.jointDataset,
              this.context.dataset,
              false,
              false,
              true,
              this.context.requestBubblePlotData,
              undefined,
              this.onBubbleClick,
              undefined
            );
          this.resetSeries(chartProps);
          this.setState({
            chartProps,
            highChartConfigOverride: datasetBarConfigOverride,
            selectedCohortIndex: cohortIndex,
            isBubbleChartRendered: true,
            isBubbleChartDataLoading: false
          });
          return;
        } else {
          datasetBarConfigOverride = getCounterfactualsScatterOption(
            this.state.xSeries,
            this.state.ySeries,
            this.state.indexSeries,
            chartProps,
            this.context.jointDataset,
            [],
            [],
            false,
            false,
            true,
            undefined
          );
          this.setState({
            chartProps,
            highChartConfigOverride: datasetBarConfigOverride,
            selectedCohortIndex: cohortIndex,
            isBubbleChartRendered: false
          });
        }
      }
    } else {
      this.setState({
        chartProps,
        selectedCohortIndex: cohortIndex
      });
    }
  }

  private setSelectedCohort = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (!this.state.chartProps) {
      return;
    }

    if (item?.key !== undefined) {
      this.generateHighChartConfigOverride(
        item.key as number,
        this.state.chartProps
      );
      this.logButtonClick(TelemetryEventName.DatasetExplorerNewCohortSelected);
    }
  };

  private logButtonClick = (eventName: TelemetryEventName): void => {
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: eventName
    });
  };

  private onBubbleClick = (
    scatterPlotData: IHighchartsConfig,
    xSeries: number[],
    ySeries: number[],
    indexSeries: number[]
  ): void => {
    console.log(
      "!!data: ",
      scatterPlotData,
      xSeries,
      ySeries,
      indexSeries,
      this.state.chartProps
    );

    this.setState({
      highChartConfigOverride: scatterPlotData,
      isBubbleChartRendered: false,
      xSeries,
      ySeries,
      indexSeries
    });
  };

  private readonly hasAxisTypeChanged = (
    newChartProps: IGenericChartProps
  ): boolean => {
    if (this.state.chartProps) {
      this.changedKeys = [];
      this.compareChartProps(newChartProps, this.state.chartProps);
      return hasAxisTypeChanged(this.changedKeys);
    }
    return false;
  };

  private compareChartProps = (
    newProps: IGenericChartProps,
    oldProps: IGenericChartProps
  ): void => {
    for (const key in newProps) {
      if (typeof newProps[key] === "object") {
        this.compareChartProps(newProps[key], oldProps[key]);
      }
      if (newProps[key] !== oldProps[key]) {
        this.changedKeys.push(key);
      }
    }
  };

  private readonly resetSeries = (newProps: IGenericChartProps): void => {
    this.changedKeys = [];
    if (this.state.chartProps) {
      this.compareChartProps(newProps, this.state.chartProps);
      const shouldResetIndexes =
        ifEnableLargeData(this.context.dataset) &&
        !_.isEqual(this.state.chartProps, newProps) &&
        !hasAxisTypeChanged(this.changedKeys);
      if (shouldResetIndexes) {
        this.setState({
          indexSeries: [],
          xSeries: [],
          ySeries: []
        });
      }
    }
  };

  private onXSet = (value: ISelectorConfig): void => {
    if (!this.state.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.state.chartProps);
    newProps.xAxis = value;
    this.generateHighChartConfigOverride(
      this.state.selectedCohortIndex,
      newProps
    );
  };

  private onYSet = (value: ISelectorConfig): void => {
    if (!this.state.chartProps) {
      return;
    }
    const newProps = _.cloneDeep(this.state.chartProps);
    newProps.yAxis = value;
    this.generateHighChartConfigOverride(
      this.state.selectedCohortIndex,
      newProps
    );
  };
}
