// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Stack } from "@fluentui/react";
import {
  ColumnCategories,
  IGenericChartProps,
  ISelectorConfig,
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  BasicHighChart,
  AxisConfig,
  ChartTypes,
  LoadingSpinner,
  IHighchartsConfig
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { causalIndividualChartStyles } from "../CausalIndividualChart.styles";

export interface ILargeCausalIndividualChartAreaProps {
  chartProps?: IGenericChartProps;
  plotData?: IHighchartsConfig;
  isBubbleChartRendered?: boolean;
  bubbleChartErrorMessage?: string;
  isBubbleChartDataLoading?: boolean;
  isLocalCausalDataLoading?: boolean;
  onYSet: (value: ISelectorConfig) => void;
  onXSet: (value: ISelectorConfig) => void;
}

export class LargeCausalIndividualChartArea extends React.PureComponent<ILargeCausalIndividualChartAreaProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const {
      chartProps,
      plotData,
      isBubbleChartRendered,
      bubbleChartErrorMessage,
      isBubbleChartDataLoading,
      isLocalCausalDataLoading,
      onXSet,
      onYSet
    } = this.props;
    const classNames = causalIndividualChartStyles();
    const disableAxisButton =
      isBubbleChartDataLoading || isLocalCausalDataLoading;
    const orderedGroupTitles = [
      ColumnCategories.Index,
      ColumnCategories.Dataset,
      ColumnCategories.Outcome
    ];
    const isHistogramOrBoxChart =
      chartProps?.chartType === ChartTypes.Histogram ||
      chartProps?.chartType === ChartTypes.Box;
    return (
      <Stack.Item className={classNames.chartWithAxes}>
        <Stack horizontal={false}>
          <Stack.Item className={classNames.chartWithVertical}>
            <Stack horizontal>
              <Stack.Item className={classNames.verticalAxis}>
                <div className={classNames.rotatedVerticalBox}>
                  {chartProps && (
                    <AxisConfig
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
                      allowTreatAsCategorical={isHistogramOrBoxChart}
                      allowLogarithmicScaling={
                        isHistogramOrBoxChart || !isBubbleChartRendered
                      }
                      orderedGroupTitles={orderedGroupTitles}
                      selectedColumn={chartProps.yAxis}
                      canBin={false}
                      mustBin={false}
                      canDither={false}
                      hideDroppedFeatures
                      onAccept={onYSet}
                      disabled={disableAxisButton}
                    />
                  )}
                </div>
              </Stack.Item>
              <Stack.Item className={classNames.individualChartContainer}>
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
                    configOverride={plotData}
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
              {chartProps && (
                <AxisConfig
                  buttonText={
                    this.context.jointDataset.metaDict[
                      chartProps.xAxis.property
                    ].abbridgedLabel
                  }
                  buttonTitle={
                    this.context.jointDataset.metaDict[
                      chartProps.xAxis.property
                    ].label
                  }
                  orderedGroupTitles={orderedGroupTitles}
                  selectedColumn={chartProps.xAxis}
                  canBin={isHistogramOrBoxChart}
                  mustBin={isHistogramOrBoxChart}
                  canDither={false}
                  allowTreatAsCategorical={isHistogramOrBoxChart}
                  allowLogarithmicScaling={
                    isHistogramOrBoxChart || !isBubbleChartRendered
                  }
                  hideDroppedFeatures
                  onAccept={onXSet}
                  disabled={disableAxisButton}
                />
              )}
            </div>
          </Stack>
        </Stack>
      </Stack.Item>
    );
  }
}
