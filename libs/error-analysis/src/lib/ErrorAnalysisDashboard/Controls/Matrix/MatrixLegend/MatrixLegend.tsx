// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort, Metrics } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IStackTokens, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { MetricUtils, MetricLocalizationType } from "../../../MetricUtils";
import { Gradient } from "../../Gradient/Gradient";
import { InfoCallout } from "../../InfoCallout/InfoCallout";

import { matrixLegendStyles } from "./MatrixLegend.styles";

export interface IMatrixLegendProps {
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  max: number;
  isErrorMetric: boolean;
}

const stackTokens: IStackTokens = { childrenGap: 5 };
const cellTokens: IStackTokens = { padding: 10 };

export class MatrixLegend extends React.Component<IMatrixLegendProps> {
  private readonly _errorRateIconId = "errorRateIconId";
  private readonly _errorCoverageIconId = "errorCoverageIconId";
  private readonly _cellsIconId = "cellsIconId";

  public render(): React.ReactNode {
    const classNames = matrixLegendStyles();
    const isRate = this.props.selectedCohort.metricName === Metrics.ErrorRate;
    return (
      <div className={classNames.matrixLegend}>
        <Stack tokens={stackTokens}>
          <Text variant={"xLarge"} block>
            Cohort: {this.props.baseCohort.cohort.name}
          </Text>
          <Stack horizontal>
            <Stack horizontal>
              <div className={classNames.metricBarBlack} />
              <Stack tokens={cellTokens}>
                <div className={classNames.smallHeader}>
                  {localization.ErrorAnalysis.cells}
                  <InfoCallout
                    iconId={this._cellsIconId}
                    infoText={localization.ErrorAnalysis.cellsInfo}
                    title={localization.ErrorAnalysis.cellsTitle}
                  />
                </div>
                <div className={classNames.valueBlack}>
                  {this.props.selectedCohort.cells === 0
                    ? "-"
                    : this.props.selectedCohort.cells}
                </div>
              </Stack>
            </Stack>
            <Stack horizontal>
              <div className={classNames.metricBarBlack} />
              <Stack tokens={cellTokens}>
                <div className={classNames.smallHeader}>
                  {localization.ErrorAnalysis.errorCoverage}
                  <InfoCallout
                    iconId={this._errorCoverageIconId}
                    infoText={localization.ErrorAnalysis.errorCoverageInfo}
                    title={localization.ErrorAnalysis.errorCoverageTitle}
                  />
                </div>
                <div className={classNames.valueBlack}>
                  {this.props.selectedCohort.cohortStats.errorCoverage.toFixed(
                    2
                  )}
                  %
                </div>
              </Stack>
            </Stack>
            <Stack>
              <Stack horizontal>
                <div className={classNames.metricBarRed} />
                <Stack tokens={cellTokens}>
                  <div className={classNames.smallHeader}>
                    {MetricUtils.getLocalizedMetric(
                      this.props.selectedCohort.metricName,
                      MetricLocalizationType.Name
                    )}
                    <InfoCallout
                      iconId={this._errorRateIconId}
                      infoText={MetricUtils.getLocalizedMetric(
                        this.props.selectedCohort.metricName,
                        MetricLocalizationType.Info
                      )}
                      title={MetricUtils.getLocalizedMetric(
                        this.props.selectedCohort.metricName,
                        MetricLocalizationType.Title
                      )}
                    />
                  </div>
                  <div className={classNames.valueBlack}>
                    {this.props.selectedCohort.metricValue.toFixed(2)}
                    {isRate ? "%" : ""}
                  </div>
                </Stack>
              </Stack>
              <svg width="60" height="60" viewBox="0 0 40 40">
                <g>
                  <Gradient
                    max={this.props.max}
                    minPct={0}
                    value={this.props.selectedCohort.metricValue}
                    isRate={isRate}
                    isErrorMetric={this.props.isErrorMetric}
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
