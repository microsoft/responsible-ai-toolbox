// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort, Metrics } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IStackTokens, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { ColorPalette } from "../../ColorPalette";
import { MetricUtils, MetricLocalizationType } from "../../MetricUtils";
import { INodeDetail } from "../../TreeViewState";
import { Gradient } from "../Gradient/Gradient";
import { InfoCallout } from "../InfoCallout/InfoCallout";
import { MetricSelector } from "../MetricSelector/MetricSelector";

import { treeLegendStyles } from "./TreeLegend.styles";

export interface ITreeLegendProps {
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  nodeDetail: INodeDetail;
  minPct: number;
  max: number;
  showCohortName: boolean;
  isErrorMetric: boolean;
  isEnabled: boolean;
  setMetric: (metric: string) => void;
  disabledView: boolean;
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
          <MetricSelector
            isEnabled={this.props.isEnabled}
            setMetric={this.props.setMetric}
          />
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
            <svg
              width="60"
              height="60"
              viewBox="-2 -2 56 56"
              pointerEvents="auto"
            >
              <mask id="detailMask">
                <rect x="-26" y="-26" width="52" height="52" fill="white" />
              </mask>
              <g className={classNames.opacityToggleCircle}>
                <circle
                  r="26"
                  className={classNames.node}
                  style={{ fill: this.props.nodeDetail.errorColor }}
                />
                <g
                  style={this.props.nodeDetail.maskDown}
                  mask="url(#detailMask)"
                  className={classNames.nopointer}
                >
                  <circle
                    r="26"
                    className={classNames.node}
                    fill={ColorPalette.FillStyle}
                    style={this.props.nodeDetail.maskUp}
                  />
                </g>
              </g>
            </svg>
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
                    minPct={this.props.minPct}
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
          </Stack>
        </Stack>
      </div>
    );
  }
}
