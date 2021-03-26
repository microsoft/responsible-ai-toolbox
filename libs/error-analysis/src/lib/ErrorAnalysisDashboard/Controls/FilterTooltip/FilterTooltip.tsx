// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { getTheme } from "office-ui-fabric-react";
import React from "react";

import { FilterProps } from "../../FilterProps";

import { filterTooltipStyles } from "./FilterTooltip.styles";

export interface IFilterTooltipProps {
  filterProps: FilterProps;
}

export class FilterTooltip extends React.Component<IFilterTooltipProps> {
  public render(): React.ReactNode {
    const classNames = filterTooltipStyles();
    const theme = getTheme();
    return (
      <>
        <g>
          <text className={classNames.numCorrect}>
            Correct (#): {this.props.filterProps.numCorrect}
          </text>
          <text className={classNames.numIncorrect}>
            Incorrect (#): {this.props.filterProps.numIncorrect}
          </text>
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
            <rect className={classNames.metricBarBlack}></rect>
            <g>
              <text className={classNames.smallHeader}>
                {localization.ErrorAnalysis.errorCoverage}
              </text>
              <text className={classNames.valueBlack}>
                {this.props.filterProps.errorCoverage.toFixed(2)}%
              </text>
            </g>
          </g>
          <g className={classNames.errorRateCell}>
            <rect className={classNames.metricBarRed}></rect>
            <g>
              <text className={classNames.smallHeader}>
                {localization.ErrorAnalysis.errorRate}
              </text>
              <text className={classNames.valueBlack}>
                {this.props.filterProps.errorRate.toFixed(2)}%
              </text>
            </g>
          </g>
        </g>
      </>
    );
  }
}
