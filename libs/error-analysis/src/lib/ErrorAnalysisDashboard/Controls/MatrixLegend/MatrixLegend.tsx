// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStackTokens } from "office-ui-fabric-react";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { Text } from "office-ui-fabric-react/lib/Text";
import React from "react";

import { ErrorCohort } from "../../ErrorCohort";

import { matrixLegendStyles } from "./MatrixLegend.styles";

export interface IMatrixLegendProps {
  selectedCohort: ErrorCohort;
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
                <div className={classNames.smallHeader}>Error Coverage</div>
                <div className={classNames.valueBlack}>
                  {this.props.selectedCohort.errorCoverage.toFixed(2)}%
                </div>
              </Stack>
            </Stack>
            <Stack horizontal>
              <div className={classNames.metricBarRed}></div>
              <Stack tokens={cellTokens}>
                <div className={classNames.smallHeader}>Error Rate</div>
                <div className={classNames.valueBlack}>
                  {this.props.selectedCohort.errorRate.toFixed(2)}%
                </div>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </div>
    );
  }
}
