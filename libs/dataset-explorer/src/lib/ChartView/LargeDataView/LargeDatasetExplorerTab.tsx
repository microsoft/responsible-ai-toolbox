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
  Cohort,
  getPrimaryChartColor
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { datasetExplorerTabStyles } from "../utils/DatasetExplorerTab.styles";
import { generateDefaultChartAxes } from "../utils/generateDefaultChartAxes";
import { generatePlotlyProps } from "../utils/generatePlotlyProps";
import { getDatasetOption } from "../utils/getDatasetOption";

export interface IDatasetExplorerTabProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface IDatasetExplorerTabState {
  chartProps?: IGenericChartProps;
  selectedCohortIndex: number;
  highChartConfigOverride?: any;
}

export class LargeDatasetExplorerTab extends React.Component<
  IDatasetExplorerTabProps,
  IDatasetExplorerTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private readonly chartAndConfigsId = "LargeDatasetExplorerChart";

  public constructor(props: IDatasetExplorerTabProps) {
    super(props);

    this.state = {
      selectedCohortIndex: 0
    };
  }

  private async generateHighChartConfigOverride(
    cohortIndex: number,
    chartProps: IGenericChartProps | undefined
  ): Promise<void> {
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
          chartProps: chartProps,
          selectedCohortIndex: cohortIndex,
          highChartConfigOverride: configOverride
        });
      } else {
        const dataCohort = this.context.errorCohorts[cohortIndex].cohort;
        const filtersRelabeled = Cohort.getLabeledFilters(
          dataCohort.filters,
          this.context.jointDataset
        );
        const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
          dataCohort.compositeFilters,
          this.context.jointDataset
        );

        if (
          this.context.jointDataset.metaDict[chartProps?.yAxis.property]
            .isCategorical ||
          this.context.jointDataset.metaDict[chartProps?.yAxis.property]
            ?.treatAsCategorical
        ) {
          const treatXAsCategorical =
            (this.context.jointDataset.metaDict[chartProps?.xAxis.property]
              .isCategorical ||
              this.context.jointDataset.metaDict[chartProps?.xAxis.property]
                ?.treatAsCategorical) ??
            false;

          const treatYAsCategorical =
            (this.context.jointDataset.metaDict[chartProps?.yAxis.property]
              .isCategorical ||
              this.context.jointDataset.metaDict[chartProps?.yAxis.property]
                ?.treatAsCategorical) ??
            false;

          const result = await this.context.requestDatasetAnalysisBarChart(
            filtersRelabeled,
            compositeFiltersRelabeled,
            this.context.jointDataset.metaDict[chartProps?.xAxis.property]
              .label,
            treatXAsCategorical,
            this.context.jointDataset.metaDict[chartProps?.yAxis.property]
              .label,
            treatYAsCategorical,
            5,
            new AbortController().signal
          );
          const datasetBarConfigOverride = {
            chart: {
              type: "column"
            },
            series: result.values,
            xAxis: {
              categories: result.buckets
            }
          };
          this.setState({
            chartProps: chartProps,
            selectedCohortIndex: cohortIndex,
            highChartConfigOverride: datasetBarConfigOverride
          });
        } else {
          const result = await this.context.requestDatasetAnalysisBoxChart(
            filtersRelabeled,
            compositeFiltersRelabeled,
            this.context.jointDataset.metaDict[chartProps?.xAxis.property]
              .label,
            this.context.jointDataset.metaDict[chartProps?.yAxis.property]
              .label,
            5,
            new AbortController().signal
          );

          const boxGroupData: any = [];
          const theme = getTheme();

          let userFeatureName =
            localization.ModelAssessment.ModelOverview.BoxPlot
              .boxPlotSeriesLabel;
          if (chartProps?.yAxis.property) {
            userFeatureName =
              this.context.jointDataset.metaDict[chartProps?.yAxis.property]
                .label;
          }
          boxGroupData.push({
            color: undefined,
            data: result.values,
            fillColor: theme.semanticColors.inputBackgroundChecked,
            name: userFeatureName
          });
          boxGroupData.push({
            data: result.outliers,
            marker: {
              fillColor: getPrimaryChartColor(theme)
            },
            name: localization.ModelAssessment.ModelOverview.BoxPlot
              .outlierLabel,
            type: "scatter"
          });
          const datasetBoxConfigOverride = {
            chart: {
              type: "boxplot"
            },
            series: boxGroupData,
            xAxis: {
              categories: result.buckets
            }
          };
          this.setState({
            chartProps: chartProps,
            selectedCohortIndex: cohortIndex,
            highChartConfigOverride: datasetBoxConfigOverride
          });
        }
      }
    } else {
      this.setState({
        chartProps: chartProps,
        selectedCohortIndex: cohortIndex
      });
    }
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
                      />
                    </div>
                  </Stack.Item>
                  <Stack.Item className={classNames.chartContainer}>
                    {canRenderChart ? (
                      <BasicHighChart
                        configOverride={this.state.highChartConfigOverride}
                        theme={getTheme()}
                      />
                    ) : (
                      <MissingParametersPlaceholder>
                        {localization.Interpret.ValidationErrors.datasizeError}
                      </MissingParametersPlaceholder>
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
                />
              </div>
            </div>
          </Stack>
        </Stack.Item>
      </Stack>
    );
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
