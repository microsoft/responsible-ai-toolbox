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
  LoadingSpinner
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { causalIndividualChartStyles } from "../CausalIndividualChart.styles";

export interface ILargeCausalIndividualChartAreaProps {
  chartProps: IGenericChartProps;
  plotData: any;
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
    const classNames = causalIndividualChartStyles();
    const disableAxisButton =
      this.props.isBubbleChartDataLoading ||
      this.props.isLocalCausalDataLoading;
    const orderedGroupTitles = [
      ColumnCategories.Index,
      ColumnCategories.Dataset,
      ColumnCategories.Outcome
    ];
    const isHistogramOrBoxChart =
      this.props.chartProps?.chartType === ChartTypes.Histogram ||
      this.props.chartProps?.chartType === ChartTypes.Box;
    const isScatterChart =
      this.props.chartProps?.chartType === ChartTypes.Scatter;
    return (
      <Stack.Item className={classNames.chartWithAxes}>
        <Stack horizontal={false}>
          <Stack.Item className={classNames.chartWithVertical}>
            <Stack horizontal>
              <Stack.Item className={classNames.verticalAxis}>
                <div className={classNames.rotatedVerticalBox}>
                  <AxisConfig
                    buttonText={
                      this.context.jointDataset.metaDict[
                        this.props.chartProps.yAxis.property
                      ].abbridgedLabel
                    }
                    buttonTitle={
                      this.context.jointDataset.metaDict[
                        this.props.chartProps.yAxis.property
                      ].label
                    }
                    allowTreatAsCategorical={isHistogramOrBoxChart}
                    allowLogarithmicScaling={
                      isHistogramOrBoxChart || !this.props.isBubbleChartRendered
                    }
                    orderedGroupTitles={orderedGroupTitles}
                    selectedColumn={this.props.chartProps.yAxis}
                    canBin={false}
                    mustBin={false}
                    canDither={isScatterChart}
                    hideDroppedFeatures
                    onAccept={this.props.onYSet}
                    disabled={disableAxisButton}
                  />
                </div>
              </Stack.Item>
              <Stack.Item className={classNames.individualChartContainer}>
                {this.props.bubbleChartErrorMessage && (
                  <MissingParametersPlaceholder>
                    {localization.formatString(
                      localization.Counterfactuals.BubbleChartFetchError,
                      this.props.bubbleChartErrorMessage
                    )}
                  </MissingParametersPlaceholder>
                )}
                {!this.props.isBubbleChartDataLoading ? (
                  <BasicHighChart
                    configOverride={this.props.plotData}
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
                    this.props.chartProps.xAxis.property
                  ].abbridgedLabel
                }
                buttonTitle={
                  this.context.jointDataset.metaDict[
                    this.props.chartProps.xAxis.property
                  ].label
                }
                orderedGroupTitles={orderedGroupTitles}
                selectedColumn={this.props.chartProps.xAxis}
                canBin={isHistogramOrBoxChart}
                mustBin={isHistogramOrBoxChart}
                canDither={isScatterChart}
                allowTreatAsCategorical={isHistogramOrBoxChart}
                allowLogarithmicScaling={
                  isHistogramOrBoxChart || !this.props.isBubbleChartRendered
                }
                hideDroppedFeatures
                onAccept={this.props.onXSet}
                disabled={disableAxisButton}
              />
            </div>
          </Stack>
        </Stack>
      </Stack.Item>
    );
  }
}
