// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort, Metrics } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IStackTokens, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { MetricUtils, MetricLocalizationType } from "../../MetricUtils";
import { INodeDetail } from "../../TreeViewState";
import { Gradient } from "../Gradient/Gradient";
import { InfoCallout } from "../InfoCallout/InfoCallout";

import { treeLegendStyles } from "./TreeLegend.styles";

export interface ITreeLegendProps {
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  nodeDetail: INodeDetail;
  minPct: number;
  max: number;
  showCohortName: boolean;
}

const stackTokens: IStackTokens = { childrenGap: 5 };
const cellTokens: IStackTokens = { padding: 10 };

export class TreeLegend extends React.Component<ITreeLegendProps> {
  private readonly _metricIconId = "metricIconId";
  private readonly _errorCoverageIconId = "errorCoverageIconId";
  public render(): React.ReactNode {
    const classNames = treeLegendStyles();
    const isRate = this.props.selectedCohort.metricName === Metrics.ErrorRate;
    return (
      <div className={classNames.treeLegend}>
        <Stack tokens={stackTokens}>
          {this.props.showCohortName && (
            <Text variant={"xLarge"} block>
              Cohort: {this.props.baseCohort.cohort.name}
            </Text>
          )}
          <Stack>
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
                    iconId={this._metricIconId}
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
                  minPct={this.props.minPct}
                  value={this.props.selectedCohort.metricValue}
                  isRate={isRate}
                />
              </g>
            </svg>
          </Stack>
        </Stack>
      </div>
    );
  }
}
