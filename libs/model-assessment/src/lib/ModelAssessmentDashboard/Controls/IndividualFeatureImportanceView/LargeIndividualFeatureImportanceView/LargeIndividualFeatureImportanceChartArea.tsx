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
  ChartTypes,
  ColumnCategories,
  ISelectorConfig
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";
import { largeIndividualFeatureImportanceViewStyles } from "./LargeIndividualFeatureImportanceView.styles";

export interface ILargeIndividualFeatureImportanceChartAreaProps {
  chartProps: IGenericChartProps;
  isBubbleChartRendered?: boolean;
  highChartConfigOverride?: any;
  isBubbleChartDataLoading?: boolean;
  bubbleChartErrorMessage?: string;
  onXSet: (value: ISelectorConfig) => void;
  onYSet: (value: ISelectorConfig) => void;
}

export class LargeIndividualFeatureImportanceChartArea extends React.PureComponent<ILargeIndividualFeatureImportanceChartAreaProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const classNames = largeIndividualFeatureImportanceViewStyles();
    const {
      chartProps,
      isBubbleChartRendered,
      isBubbleChartDataLoading,
      highChartConfigOverride,
      bubbleChartErrorMessage,
      onXSet,
      onYSet
    } = this.props;
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
    const isScatterChart = chartProps.chartType === ChartTypes.Scatter;

    return (
      <div className={classNames.chart}>
        <Stack.Item className={classNames.chartWithAxes}>
          <Stack horizontal className={classNames.chartWithVertical}>
            <Stack.Item className={classNames.verticalAxis}>
              <div className={classNames.rotatedVerticalBox}>
                <AxisConfig
                  orderedGroupTitles={yAxisCategories}
                  selectedColumn={chartProps.yAxis}
                  canBin={false}
                  mustBin={false}
                  canDither={isScatterChart}
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
                  disabled={isBubbleChartDataLoading}
                />
              </div>
            </Stack.Item>
            <Stack.Item className={classNames.chartContainer}>
              {bubbleChartErrorMessage && (
                <MissingParametersPlaceholder>
                  {localization.formatString(
                    localization.Counterfactuals.BubbleChartFetchError,
                    bubbleChartErrorMessage
                  )}
                </MissingParametersPlaceholder>
              )}
              {!isBubbleChartDataLoading ? (
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
        <div className={classNames.horizontalAxis}>
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
            canDither={isScatterChart}
            onAccept={onXSet}
            buttonText={
              this.context.jointDataset.metaDict[chartProps.xAxis.property]
                .abbridgedLabel
            }
            buttonTitle={
              this.context.jointDataset.metaDict[chartProps.xAxis.property]
                .label
            }
            disabled={isBubbleChartDataLoading}
          />
        </div>
      </div>
    );
  }
}