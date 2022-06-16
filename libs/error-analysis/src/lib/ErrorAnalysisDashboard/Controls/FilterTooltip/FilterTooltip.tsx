// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { Metrics } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { FilterProps } from "../../FilterProps";
import { MetricUtils, MetricLocalizationType } from "../../MetricUtils";

import { filterTooltipStyles } from "./FilterTooltip.styles";

export interface IFilterTooltipProps {
  filterProps: FilterProps;
}

export class FilterTooltip extends React.Component<IFilterTooltipProps> {
  public render(): React.ReactNode {
    const classNames = filterTooltipStyles();
    const theme = getTheme();
    const metricName = this.props.filterProps.metricName;
    const isErrorRate = metricName === Metrics.ErrorRate;
    const isErrorMetric =
      metricName === Metrics.ErrorRate ||
      metricName === Metrics.MeanSquaredError ||
      metricName === Metrics.MeanAbsoluteError;
    return (
      <>
        <g>
          {isErrorRate && (
            <g>
              <text className={classNames.numCorrect}>
                {localization.ErrorAnalysis.FilterTooltip.correctNum}
                {this.props.filterProps.numCorrect}
              </text>
              <text className={classNames.numIncorrect}>
                {localization.ErrorAnalysis.FilterTooltip.incorrectNum}
                {this.props.filterProps.numIncorrect}
              </text>
            </g>
          )}
          {!isErrorRate && (
            <g>
              <text className={classNames.numCorrect}>
                {localization.ErrorAnalysis.FilterTooltip.countNum}
                {this.props.filterProps.totalCount.toFixed(0)}
              </text>
              <text className={classNames.numIncorrect}>
                {localization.ErrorAnalysis.FilterTooltip.errorSum}
                {this.props.filterProps.numIncorrect > 0.1
                  ? this.props.filterProps.numIncorrect.toFixed(2)
                  : this.props.filterProps.numIncorrect.toFixed(4)}
              </text>
            </g>
          )}
          <line
            x1="1"
            y1="30"
            x2="80"
            y2="30"
            style={{
              stroke: theme.palette.themeLighterAlt,
              strokeWidth: "1"
            }}
          />
        </g>
        <g>
          <g className={classNames.errorCoverageCell}>
            <rect className={classNames.metricBarBlack} />
            <g>
              <text className={classNames.smallHeader}>
                {localization.ErrorAnalysis.errorCoverage}
              </text>
              <text className={classNames.valueBlack}>
                {this.props.filterProps.errorCoverage.toFixed(2)}%
              </text>
            </g>
          </g>
          <g className={classNames.metricValueCell}>
            <rect
              className={
                isErrorMetric
                  ? classNames.metricBarRed
                  : classNames.metricBarGreen
              }
            />
            <g>
              <text className={classNames.smallHeader}>
                {MetricUtils.getLocalizedMetric(
                  this.props.filterProps.metricName,
                  MetricLocalizationType.Short
                )}
              </text>
              <text className={classNames.valueBlack}>
                {this.props.filterProps.metricValue > 0.1
                  ? this.props.filterProps.metricValue.toFixed(2)
                  : this.props.filterProps.metricValue.toFixed(4)}
                {isErrorRate ? "%" : ""}
              </text>
            </g>
          </g>
        </g>
      </>
    );
  }
}
