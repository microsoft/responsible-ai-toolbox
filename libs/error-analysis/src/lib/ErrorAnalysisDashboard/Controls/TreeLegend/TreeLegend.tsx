// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { treeLegendStyles } from "./TreeLegend.styles";

export interface ITreeLegendProps {
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
}

export class TreeLegend extends React.Component<ITreeLegendProps> {
  public render(): React.ReactNode {
    const classNames = treeLegendStyles();
    return (
      <g className={classNames.treeLegend}>
        <g>
          <text className={classNames.cohortName}>
            Cohort: {this.props.baseCohort.cohort.name}
          </text>
          <g>
            <g className={classNames.errorCoverageCell}>
              <rect className={classNames.metricBarBlack}></rect>
              <g>
                <text className={classNames.smallHeader}>
                  {localization.ErrorAnalysis.errorCoverage}
                </text>
                <text className={classNames.valueBlack}>
                  {this.props.selectedCohort.errorCoverage.toFixed(2)}%
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
                  {this.props.selectedCohort.errorRate.toFixed(2)}%
                </text>
              </g>
            </g>
          </g>
        </g>
      </g>
    );
  }
}
