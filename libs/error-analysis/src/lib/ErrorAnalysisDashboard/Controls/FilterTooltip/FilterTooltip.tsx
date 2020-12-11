// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, mergeStyles } from "office-ui-fabric-react";
import React from "react";

import { FilterProps } from "../../FilterProps";

import { filterTooltipStyles } from "./FilterTooltip.styles";

export interface IFilterTooltipProps {
  filterProps: FilterProps;
  isMouseOver: boolean;
  nodeTransform: string;
}

export class FilterTooltip extends React.Component<IFilterTooltipProps> {
  public render(): React.ReactNode {
    const classNames = filterTooltipStyles();
    const theme = getTheme();
    let filterTooltipStyle = mergeStyles(
      { transform: this.props.nodeTransform },
      classNames.filterTooltip
    );
    if (this.props.isMouseOver) {
      filterTooltipStyle = mergeStyles(
        filterTooltipStyle,
        classNames.showFilterTooltip
      );
    } else {
      filterTooltipStyle = mergeStyles(
        filterTooltipStyle,
        classNames.hideFilterTooltip
      );
    }
    return (
      <g className={filterTooltipStyle}>
        <rect
          className={classNames.tooltipRect}
          fill="white"
          strokeWidth="2"
          height="100"
          width="80"
          y="0"
          x="0"
        ></rect>
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
              <text className={classNames.smallHeader}>Error coverage</text>
              <text className={classNames.valueBlack}>
                {this.props.filterProps.errorCoverage.toFixed(2)}%
              </text>
            </g>
          </g>
          <g className={classNames.errorRateCell}>
            <rect className={classNames.metricBarRed}></rect>
            <g>
              <text className={classNames.smallHeader}>Error rate</text>
              <text className={classNames.valueBlack}>
                {this.props.filterProps.errorRate.toFixed(2)}%
              </text>
            </g>
          </g>
        </g>
      </g>
    );
  }
}
