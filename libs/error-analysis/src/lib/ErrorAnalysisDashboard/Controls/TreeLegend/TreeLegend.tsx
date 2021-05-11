// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IStackTokens, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { ColorPalette } from "../../ColorPalette";
import { INodeDetail } from "../../TreeViewState";
import { ErrorRateGradient } from "../ErrorRateGradient/ErrorRateGradient";
import { InfoCallout } from "../InfoCallout/InfoCallout";

import { treeLegendStyles } from "./TreeLegend.styles";

export interface ITreeLegendProps {
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  nodeDetail: INodeDetail;
  minPct: number;
  max: number;
}

const stackTokens: IStackTokens = { childrenGap: 5 };
const cellTokens: IStackTokens = { padding: 10 };

export class TreeLegend extends React.Component<ITreeLegendProps> {
  private readonly _errorRateIconId = "errorRateIconId";
  private readonly _errorCoverageIconId = "errorCoverageIconId";
  public render(): React.ReactNode {
    const classNames = treeLegendStyles();
    return (
      <div className={classNames.treeLegend}>
        <Stack tokens={stackTokens}>
          <Text variant={"xLarge"} block>
            Cohort: {this.props.baseCohort.cohort.name}
          </Text>
          <Stack>
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
      </div>
    );
  }
}
