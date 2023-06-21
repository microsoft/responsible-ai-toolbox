// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Stack } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  BasicHighChart,
  LoadingSpinner,
  MissingParametersPlaceholder,
  AxisConfig,
  IGenericChartProps,
  rowErrorSize,
  ChartTypes,
  ColumnCategories,
  ISelectorConfig
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { datasetExplorerTabStyles } from "../utils/DatasetExplorerTab.styles";

export interface ILargeDatasetExplorerChartAreaProps {
  chartProps: IGenericChartProps;
  selectedCohortIndex: number;
  isBubbleChartRendered?: boolean;
  highChartConfigOverride?: any;
  isBubbleChartDataLoading?: boolean;
  bubbleChartErrorMessage?: string;
  isAggregatePlotLoading?: boolean;
  onXSet: (value: ISelectorConfig) => void;
  onYSet: (value: ISelectorConfig) => void;
}

export class LargeDatasetExplorerChartArea extends React.PureComponent<ILargeDatasetExplorerChartAreaProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const classNames = datasetExplorerTabStyles();
    const {
      chartProps,
      selectedCohortIndex,
      isBubbleChartRendered,
      isBubbleChartDataLoading,
      isAggregatePlotLoading,
      highChartConfigOverride,
      bubbleChartErrorMessage,
      onXSet,
      onYSet
    } = this.props;
    const selectedCI =
      selectedCohortIndex >= this.context.errorCohorts.length
        ? 0
        : selectedCohortIndex;
    const cohortLength =
      this.context.errorCohorts[selectedCI].cohort.filteredData.length;
    const canRenderChart =
      cohortLength < rowErrorSize ||
      chartProps.chartType !== ChartTypes.Scatter;
    const yAxisCategories = [
      ColumnCategories.Index,
      ColumnCategories.Dataset,
      ColumnCategories.Outcome
    ];
    if (chartProps.chartType !== ChartTypes.Scatter) {
      yAxisCategories.push(ColumnCategories.None);
    }
    const isHistogramOrBoxChart =
      chartProps.chartType === ChartTypes.Histogram ||
      chartProps.chartType === ChartTypes.Box;

    return (
      <Stack.Item className={classNames.chart}>
        <Stack.Item className={classNames.chartWithAxes}>
          <Stack horizontal className={classNames.chartWithVertical}>
            <Stack.Item className={classNames.verticalAxis}>
              <Stack.Item className={classNames.rotatedVerticalBox}>
                <AxisConfig
                  orderedGroupTitles={yAxisCategories}
                  selectedColumn={chartProps.yAxis}
                  canBin={false}
                  mustBin={false}
                  canDither={false}
                  allowTreatAsCategorical={isHistogramOrBoxChart}
                  allowLogarithmicScaling={
                    isHistogramOrBoxChart || !isBubbleChartRendered
                  }
                  onAccept={onYSet}
                  buttonText={
                    this.context.jointDataset.metaDict[
                      chartProps.yAxis.property
                    ].abbridgedLabel
                  }
                  buttonTitle={
                    this.context.jointDataset.metaDict[
                      chartProps.yAxis.property
                    ].label
                  }
                  disabled={isBubbleChartDataLoading || isAggregatePlotLoading}
                  removeCount={!isHistogramOrBoxChart}
                />
              </Stack.Item>
            </Stack.Item>
            <Stack.Item className={classNames.chartContainer}>
              {(!canRenderChart || bubbleChartErrorMessage) && (
                <MissingParametersPlaceholder>
                  {!canRenderChart
                    ? localization.Interpret.ValidationErrors.datasizeError
                    : localization.formatString(
                        localization.Counterfactuals.BubbleChartFetchError,
                        bubbleChartErrorMessage
                      )}
                </MissingParametersPlaceholder>
              )}
              {!isAggregatePlotLoading &&
              !isBubbleChartDataLoading &&
              canRenderChart ? (
                <BasicHighChart
                  configOverride={highChartConfigOverride}
                  theme={getTheme()}
                />
              ) : (
                <LoadingSpinner label={localization.Counterfactuals.loading} />
              )}
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack.Item className={classNames.horizontalAxis}>
          <AxisConfig
            orderedGroupTitles={[
              ColumnCategories.Index,
              ColumnCategories.Dataset,
              ColumnCategories.Outcome
            ]}
            selectedColumn={chartProps.xAxis}
            canBin={isHistogramOrBoxChart}
            mustBin={isHistogramOrBoxChart}
            allowTreatAsCategorical={isHistogramOrBoxChart}
            allowLogarithmicScaling={
              isHistogramOrBoxChart || !isBubbleChartRendered
            }
            canDither={false}
            onAccept={onXSet}
            buttonText={
              this.context.jointDataset.metaDict[chartProps.xAxis.property]
                .abbridgedLabel
            }
            buttonTitle={
              this.context.jointDataset.metaDict[chartProps.xAxis.property]
                .label
            }
            disabled={isBubbleChartDataLoading || isAggregatePlotLoading}
            removeCount={!isHistogramOrBoxChart}
          />
        </Stack.Item>
      </Stack.Item>
    );
  }
}
