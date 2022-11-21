// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStackTokens, Stack, Text } from "@fluentui/react";
import { ErrorCohort, Metrics } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { MetricUtils, MetricLocalizationType } from "../../../MetricUtils";
import { Gradient } from "../../Gradient/Gradient";
import { InfoCallout } from "../../InfoCallout/InfoCallout";

import { matrixLegendStyles } from "./MatrixLegend.styles";

export interface IMatrixLegendProps {
  baseCohort: ErrorCohort;
  disabledView: boolean;
  isErrorMetric: boolean;
  max: number;
  selectedCohort: ErrorCohort;
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
          <Stack horizontal className={classNames.metricLegendStack}>
            <Stack.Item>
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
                    {this.props.selectedCohort.cells === 0 ||
                    this.props.disabledView
                      ? "-"
                      : this.props.selectedCohort.cells}
                  </div>
                </Stack>
              </Stack>
            </Stack.Item>
            <Stack.Item>
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
                  {this.props.disabledView && (
                    <div className={classNames.valueBlack}>-</div>
                  )}
                  {!this.props.disabledView && (
                    <div className={classNames.valueBlack}>
                      {this.props.selectedCohort.cohortStats.errorCoverage.toFixed(
                        2
                      )}
                      %
                    </div>
                  )}
                </Stack>
              </Stack>
            </Stack.Item>
            <Stack.Item>
              <Stack horizontal>
                <div
                  className={
                    this.props.isErrorMetric
                      ? classNames.metricBarRed
                      : classNames.metricBarGreen
                  }
                />
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
                  {this.props.disabledView && (
                    <div className={classNames.valueBlack}>-</div>
                  )}
                  {!this.props.disabledView && (
                    <div className={classNames.valueBlack}>
                      {this.props.selectedCohort.metricValue.toFixed(2)}
                      {isRate ? "%" : ""}
                    </div>
                  )}
                </Stack>
              </Stack>
              <svg width="60" height="60" viewBox="0 0 40 40">
                <g>
                  {!this.props.disabledView && (
                    <Gradient
                      max={this.props.max}
                      minPct={0}
                      value={this.props.selectedCohort.metricValue}
                      isRate={isRate}
                      isErrorMetric={this.props.isErrorMetric}
                    />
                  )}
                  {this.props.disabledView && (
                    <Gradient
                      max={0}
                      minPct={0}
                      value={0}
                      isRate={false}
                      isErrorMetric={false}
                    />
                  )}
                </g>
              </svg>
            </Stack.Item>
          </Stack>
        </Stack>
      </div>
    );
  }
}
