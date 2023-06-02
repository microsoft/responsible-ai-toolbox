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
  ISelectorConfig,
  IHighchartsConfig,
  ITelemetryEvent
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { LargeIndividualFeatureImportanceLegend } from "./LargeIndividualFeatureImportanceLegend";
import { largeIndividualFeatureImportanceViewStyles } from "./LargeIndividualFeatureImportanceView.styles";

export interface ILargeIndividualFeatureImportanceChartAreaProps {
  chartProps?: IGenericChartProps;
  isBubbleChartRendered?: boolean;
  highChartConfigOverride?: IHighchartsConfig;
  isBubbleChartDataLoading?: boolean;
  bubbleChartErrorMessage?: string;
  isLocalExplanationsDataLoading?: boolean;
  onXSet: (value: ISelectorConfig) => void;
  onYSet: (value: ISelectorConfig) => void;
  setIsRevertButtonClicked: (status: boolean) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
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
      isLocalExplanationsDataLoading,
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
    if (chartProps?.chartType !== ChartTypes.Scatter) {
      yAxisCategories.push(ColumnCategories.None);
    }
    const isHistogramOrBoxChart =
      chartProps?.chartType === ChartTypes.Histogram ||
      chartProps?.chartType === ChartTypes.Box;

    return (
      <Stack
        horizontal
        grow
        tokens={{ childrenGap: "l1" }}
        className={classNames.chartWithLegend}
      >
        <Stack.Item className={classNames.chart}>
          <Stack.Item className={classNames.chartWithAxes}>
            <Stack horizontal>
              <Stack.Item className={classNames.verticalAxis}>
                <Stack.Item className={classNames.rotatedVerticalBox}>
                  {chartProps && (
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
                          chartProps.yAxis.property || ""
                        ].abbridgedLabel
                      }
                      buttonTitle={
                        this.context.jointDataset.metaDict[
                          chartProps.yAxis.property || ""
                        ].label
                      }
                      disabled={
                        isBubbleChartDataLoading ||
                        isLocalExplanationsDataLoading
                      }
                    />
                  )}
                </Stack.Item>
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
                  <LoadingSpinner
                    label={localization.Counterfactuals.loading}
                  />
                )}
              </Stack.Item>
            </Stack>
          </Stack.Item>
          <Stack.Item className={classNames.horizontalAxis}>
            {chartProps && (
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
                disabled={
                  isBubbleChartDataLoading || isLocalExplanationsDataLoading
                }
              />
            )}
          </Stack.Item>
        </Stack.Item>
        <Stack.Item>
          <LargeIndividualFeatureImportanceLegend
            setIsRevertButtonClicked={this.props.setIsRevertButtonClicked}
            isBubbleChartRendered={this.props.isBubbleChartRendered}
            isLocalExplanationsLoading={
              this.props.isLocalExplanationsDataLoading
            }
            isBubbleChartDataLoading={this.props.isBubbleChartDataLoading}
            telemetryHook={this.props.telemetryHook}
          />
        </Stack.Item>
      </Stack>
    );
  }
}
