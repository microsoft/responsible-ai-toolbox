// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStackTokens } from "office-ui-fabric-react";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import React from "react";

import { ErrorCohort } from "../../ErrorCohort";

import { cohortStatsStyles } from "./CohortStats.styles";

export interface ISaveCohortProps {
  temporaryCohort: ErrorCohort;
}

const alignmentStackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 5
};

export class CohortStats extends React.Component<ISaveCohortProps> {
  public render(): React.ReactNode {
    const classNames = cohortStatsStyles();
    return (
      <div>
        <div className={classNames.section}></div>
        <div className={classNames.subsection}>
          <div className={classNames.header}>Cohort info</div>
          <Stack horizontal>
            <Stack tokens={alignmentStackTokens}>
              <div className={classNames.tableData}>Error Coverage</div>
              <div className={classNames.tableData}>
                {`${this.props.temporaryCohort.errorCoverage}%`}
              </div>
            </Stack>
            <Stack tokens={alignmentStackTokens}>
              <div className={classNames.tableData}>Error Rate</div>
              <div className={classNames.tableData}>
                {`${this.props.temporaryCohort.errorRate}%`}
              </div>
            </Stack>
            <Stack tokens={alignmentStackTokens}>
              <div className={classNames.tableData}>Correct/Total</div>
              <div className={classNames.tableData}>
                {`${this.props.temporaryCohort.totalCohortCorrect} / ${this.props.temporaryCohort.totalCohort}`}
              </div>
            </Stack>
            <Stack tokens={alignmentStackTokens}>
              <div className={classNames.tableData}>Incorrect/Total</div>
              <div className={classNames.tableData}>
                {`${this.props.temporaryCohort.totalCohortIncorrect} / ${this.props.temporaryCohort.totalCohort}`}
              </div>
            </Stack>
          </Stack>
        </div>
      </div>
    );
  }
}
