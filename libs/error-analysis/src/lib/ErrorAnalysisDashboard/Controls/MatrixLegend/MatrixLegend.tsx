// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  IStackStyles,
  IStackTokens,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { ErrorRateGradient } from "../ErrorRateGradient/ErrorRateGradient";
import { InfoCallout } from "../InfoCallout/InfoCallout";

import { matrixLegendStyles } from "./MatrixLegend.styles";

export interface IMatrixLegendProps {
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  max: number;
}

const stackTokens: IStackTokens = { childrenGap: 5 };
const cellTokens: IStackTokens = { padding: 10 };
const legendDescriptionPadding: IStackTokens = { padding: "20px 0px 20px 0px" };
const legendDescriptionStyle: IStackStyles = {
  root: {
    width: 500
  }
};

export class MatrixLegend extends React.Component<IMatrixLegendProps> {
  private readonly _errorRateIconId = "errorRateIconId";
  private readonly _errorCoverageIconId = "errorCoverageIconId";
  private readonly _cellsIconId = "cellsIconId";

  public render(): React.ReactNode {
    const classNames = matrixLegendStyles();
    return (
      <div className={classNames.matrixLegend}>
        <Stack
          styles={legendDescriptionStyle}
          tokens={legendDescriptionPadding}
        >
          <Text variant={"smallPlus"}>
            {localization.ErrorAnalysis.MatrixLegend.heatMapDescription}
          </Text>
        </Stack>
        <Stack tokens={stackTokens}>
          <Text variant={"xLarge"} block>
            Cohort: {this.props.baseCohort.cohort.name}
          </Text>
          <Stack horizontal>
            <Stack horizontal>
              <div className={classNames.metricBarBlack}></div>
              <Stack tokens={cellTokens}>
                <div className={classNames.smallHeader}>
                  {localization.ErrorAnalysis.cells}
                  <InfoCallout
                    iconId={this._cellsIconId}
                    infoText={localization.ErrorAnalysis.cellsInfo}
                    title={localization.ErrorAnalysis.cellsTitle}
                  ></InfoCallout>
                </div>
                <div className={classNames.valueBlack}>
                  {this.props.selectedCohort.cells === 0
                    ? "-"
                    : this.props.selectedCohort.cells}
                </div>
              </Stack>
            </Stack>
            <Stack horizontal>
              <div className={classNames.metricBarBlack}></div>
              <Stack tokens={cellTokens}>
                <div className={classNames.smallHeader}>
                  {localization.ErrorAnalysis.errorCoverage}
                  <InfoCallout
                    iconId={this._errorCoverageIconId}
                    infoText={localization.ErrorAnalysis.errorCoverageInfo}
                    title={localization.ErrorAnalysis.errorCoverageTitle}
                  ></InfoCallout>
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
                    <InfoCallout
                      iconId={this._errorRateIconId}
                      infoText={localization.ErrorAnalysis.errorRateInfo}
                      title={localization.ErrorAnalysis.errorRateTitle}
                    ></InfoCallout>
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
