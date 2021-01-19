// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { IStackTokens, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort } from "../../ErrorCohort";
import { ErrorRateGradient } from "../ErrorRateGradient/ErrorRateGradient";

import { matrixLegendStyles } from "./MatrixLegend.styles";

export interface IMatrixLegendProps {
  selectedCohort: ErrorCohort;
  max: number;
}

const stackTokens: IStackTokens = { childrenGap: 5 };
const cellTokens: IStackTokens = { padding: 10 };

export class MatrixLegend extends React.Component<IMatrixLegendProps> {
  public render(): React.ReactNode {
    const classNames = matrixLegendStyles();
    return (
      <div className={classNames.matrixLegend}>
        <Stack tokens={stackTokens}>
          <Text variant={"xLarge"} block>
            Cohort: {this.props.selectedCohort.cohort.name}
          </Text>
          <Stack horizontal>
            <Stack horizontal>
              <div className={classNames.metricBarBlack}></div>
              <Stack tokens={cellTokens}>
                <div className={classNames.smallHeader}>Cells</div>
                <div className={classNames.valueBlack}>
                  {this.props.selectedCohort.cells}
                </div>
              </Stack>
            </Stack>
            <Stack horizontal>
              <div className={classNames.metricBarBlack}></div>
              <Stack tokens={cellTokens}>
                <div className={classNames.smallHeader}>
                  {localization.ErrorAnalysis.errorCoverage}
                </div>
                <div className={classNames.valueBlack}>
                  {this.props.selectedCohort.errorCoverage.toFixed(2)}%
                </div>
              </Stack>
            </Stack>
            <Stack>
              <Stack horizontal>
                <div className={classNames.metricBarRed}></div>
                <Stack tokens={cellTokens}>
                  <div className={classNames.smallHeader}>
                    {localization.ErrorAnalysis.errorRate}
                  </div>
                  <div className={classNames.valueBlack}>
                    {this.props.selectedCohort.errorRate.toFixed(2)}%
                  </div>
                </Stack>
              </Stack>
              <svg width="60" height="60" viewBox="0 0 40 40">
                <g>
                  <ErrorRateGradient
                    max={this.props.max}
                    minPct={0}
                    selectedCohort={this.props.selectedCohort}
                  />
                </g>
              </svg>
            </Stack>
          </Stack>
        </Stack>
      </div>
    );
  }
}
