// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption, Dropdown, Text, Stack } from "@fluentui/react";
import {
  ColumnCategories,
  cohortKey,
  ChartTypes,
  IGenericChartProps,
  ISelectorConfig,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  TelemetryLevels,
  TelemetryEventName,
  OtherChartTypes,
  IHighchartsConfig,
  ifEnableLargeData,
  hasAxisTypeChanged,
  instanceOfHighChart,
  IHighchartBubbleSDKClusterData,
  IClusterData,
  getScatterOption,
  calculateBubblePlotDataFromErrorCohort,
  getInitialClusterState
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { SidePanel } from "../DataAnalysisView/SidePanel";
import { datasetExplorerTabStyles } from "../utils/DatasetExplorerTab.styles";
import { generateDefaultChartAxes } from "../utils/generateDefaultChartAxes";

import { getBarOrBoxChartConfig } from "./getBarOrBoxChartConfig";
import {
  getInitialState,
  IDatasetExplorerTabProps,
  IDatasetExplorerTabState
} from "./ILargeDatasetExplorerTabSpec";
import { LargeDatasetExplorerChartArea } from "./LargeDatasetExplorerChartArea";
import { getDefaultChart } from "./largeDatasetExplorerTabUtils";

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
    this.state = getInitialState();
  }

  public componentDidMount(): void {
    const initialCohortIndex = 0;
    const chartProps = generateDefaultChartAxes(this.context.jointDataset);
    this.generateHighChartConfigOverride(initialCohortIndex, chartProps, false);
  }

  public componentDidUpdate(
    _preProp: IDatasetExplorerTabProps,
    preState: IDatasetExplorerTabState
  ): void {
    if (preState.selectedCohortIndex >= this.context.errorCohorts.length) {
      this.generateHighChartConfigOverride(0, this.state.chartProps, false);
      return;
    }
    if (
      this.state.isRevertButtonClicked &&
      preState.isRevertButtonClicked !== this.state.isRevertButtonClicked
    ) {
      this.generateHighChartConfigOverride(0, this.state.chartProps, true);
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

    const cohortOptions =
      this.state.chartProps.xAxis.property !== cohortKey
        ? this.context.errorCohorts.map((errorCohort, index) => {
            return { key: index, text: errorCohort.cohort.name };
          })
        : undefined;
    const yAxisCategories = [
      ColumnCategories.Index,
      ColumnCategories.Dataset,
      ColumnCategories.Outcome
    ];
    if (this.state.chartProps.chartType !== ChartTypes.Scatter) {
      yAxisCategories.push(ColumnCategories.None);
    }

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
                disabled={
                  this.state.isBubbleChartDataLoading ||
                  this.state.isAggregatePlotLoading
                }
              />
            )}
          </Stack>
        </Stack.Item>
        <Stack.Item className={classNames.mainArea}>
          <Stack horizontal grow className={classNames.chartAndType}>
            <LargeDatasetExplorerChartArea
              chartProps={this.state.chartProps}
              selectedCohortIndex={this.state.selectedCohortIndex}
              isBubbleChartRendered={this.state.isBubbleChartRendered}
              highChartConfigOverride={this.state.highChartConfigOverride}
              isBubbleChartDataLoading={this.state.isBubbleChartDataLoading}
              isAggregatePlotLoading={this.state.isAggregatePlotLoading}
              bubbleChartErrorMessage={this.state.bubbleChartErrorMessage}
              onXSet={this.onXSet}
              onYSet={this.onYSet}
            />
            <Stack.Item className={classNames.sidePanel}>
              <SidePanel
                chartProps={this.state.chartProps}
                cohorts={this.context.errorCohorts.map(
                  (errorCohort) => errorCohort.cohort
                )}
                jointDataset={this.context.jointDataset}
                selectedCohortIndex={this.state.selectedCohortIndex}
                onChartPropChange={this.onChartPropsChange}
                dataset={this.context.dataset}
                disabled={this.state.isBubbleChartDataLoading}
                isBubbleChartRendered={this.state.isBubbleChartRendered}
                setIsRevertButtonClicked={this.setIsRevertButtonClicked}
                loading={
                  this.state.isAggregatePlotLoading ||
                  this.state.isBubbleChartDataLoading
                }
                telemetryHook={this.props.telemetryHook}
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
      chartProps,
      false
    );
  };

  private setIsRevertButtonClicked = (status: boolean): void => {
    this.setState({
      clusterData: getInitialClusterState(),
      isRevertButtonClicked: status
    });
  };

  private async generateHighChartConfigOverride(
    cohortIndex: number,
    chartProps: IGenericChartProps | undefined,
    hasRevertToBubbleChartUpdated: boolean
  ): Promise<void> {
    if (chartProps) {
      if (
        !this.context.requestDatasetAnalysisBarChart ||
        !this.context.requestDatasetAnalysisBoxChart ||
        !chartProps?.xAxis.property ||
        !chartProps?.yAxis.property
      ) {
        const configOverride = getDefaultChart(
          this.context.errorCohorts.map((errorCohort) => errorCohort.cohort)[
            cohortIndex
          ],
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
        this.setState({ isAggregatePlotLoading: true });
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
          isAggregatePlotLoading: false,
          selectedCohortIndex: cohortIndex
        });
      } else {
        // at this point it is either a bubble chart or scatter chart for individual bubbles
        const hasAxisTypeChanged = this.hasAxisTypeChanged(chartProps);
        if (!hasAxisTypeChanged) {
          this.updateBubblePlotData(
            chartProps,
            cohortIndex,
            hasRevertToBubbleChartUpdated
          );
        } else {
          this.updateScatterPlotData(chartProps, cohortIndex);
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
        this.state.chartProps,
        false
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

  private updateBubblePlotData = async (
    chartProps: IGenericChartProps,
    cohortIndex: number,
    hasRevertToBubbleChartUpdated: boolean
  ): Promise<void> => {
    if (hasRevertToBubbleChartUpdated) {
      this.setState(
        {
          isBubbleChartDataLoading: true
        },
        () => {
          this.setState({
            chartProps,
            highChartConfigOverride: this.state.bubblePlotData,
            isBubbleChartDataLoading: false,
            isBubbleChartRendered: true,
            isRevertButtonClicked: false,
            selectedCohortIndex: cohortIndex
          });
        }
      );
      return;
    }
    this.setState({
      isBubbleChartDataLoading: true
    });
    const datasetBubbleConfigOverride = await this.getBubblePlotData(
      chartProps,
      cohortIndex
    );
    this.resetSeries(chartProps);
    if (
      datasetBubbleConfigOverride &&
      !instanceOfHighChart(datasetBubbleConfigOverride)
    ) {
      this.setErrorStatus(chartProps, cohortIndex, datasetBubbleConfigOverride);
      return;
    }
    this.setState({
      bubblePlotData: datasetBubbleConfigOverride,
      chartProps,
      highChartConfigOverride: datasetBubbleConfigOverride,
      isBubbleChartDataLoading: false,
      isBubbleChartRendered: true,
      isRevertButtonClicked: false,
      selectedCohortIndex: cohortIndex
    });
  };

  private updateScatterPlotData = (
    chartProps: IGenericChartProps,
    cohortIndex: number
  ): void => {
    const datasetBarConfigOverride = this.getScatterPlotData(chartProps);
    this.setState({
      chartProps,
      highChartConfigOverride: datasetBarConfigOverride,
      isBubbleChartRendered: false,
      isRevertButtonClicked: false,
      selectedCohortIndex: cohortIndex
    });
  };

  private getBubblePlotData = async (
    chartProps: IGenericChartProps,
    cohortIndex: number
  ): Promise<
    IHighchartBubbleSDKClusterData | IHighchartsConfig | undefined
  > => {
    return await calculateBubblePlotDataFromErrorCohort(
      this.context.errorCohorts[cohortIndex].cohort,
      chartProps,
      [],
      this.context.jointDataset,
      this.context.dataset,
      false,
      false,
      true,
      TelemetryEventName.DataAnalysisBubblePlotDataFetch,
      this.context.requestBubblePlotData,
      undefined,
      this.onBubbleClick,
      undefined,
      this.props.telemetryHook
    );
  };

  private getScatterPlotData = (
    chartProps: IGenericChartProps
  ): IHighchartsConfig => {
    return getScatterOption(
      this.state.clusterData,
      chartProps,
      this.context.jointDataset,
      [],
      [],
      false,
      false,
      true,
      undefined
    );
  };

  private setErrorStatus = (
    chartProps: IGenericChartProps,
    cohortIndex: number,
    datasetBarConfigOverride:
      | IHighchartBubbleSDKClusterData
      | IHighchartsConfig
      | undefined
  ): void => {
    if (datasetBarConfigOverride) {
      this.setState({
        bubbleChartErrorMessage: datasetBarConfigOverride
          .toString()
          .split(":")
          .pop(),
        chartProps,
        highChartConfigOverride: undefined,
        isBubbleChartDataLoading: false,
        selectedCohortIndex: cohortIndex
      });
    }
  };

  private onBubbleClick = (
    scatterPlotData: IHighchartsConfig,
    clusterData: IClusterData
  ): void => {
    this.setState({
      clusterData,
      highChartConfigOverride: scatterPlotData,
      isBubbleChartRendered: false
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
          clusterData: getInitialClusterState(),
          isRevertButtonClicked: false
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
      newProps,
      false
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
      newProps,
      false
    );
  };
}
