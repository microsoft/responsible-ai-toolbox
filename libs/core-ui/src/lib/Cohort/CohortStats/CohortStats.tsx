// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { IStackTokens, Stack } from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort } from "../ErrorCohort";

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
          <div className={classNames.header}>
            {localization.ErrorAnalysis.cohortInfo}
          </div>
          <Stack horizontal>
            <Stack tokens={alignmentStackTokens}>
              <div className={classNames.tableData}>
                {localization.ErrorAnalysis.errorCoverage}
              </div>
              <div className={classNames.tableData}>
                {`${this.props.temporaryCohort.errorCoverage.toFixed(2)}%`}
              </div>
            </Stack>
            <Stack tokens={alignmentStackTokens}>
              <div className={classNames.tableData}>
                {localization.ErrorAnalysis.errorRate}
              </div>
              <div className={classNames.tableData}>
                {`${this.props.temporaryCohort.errorRate.toFixed(2)}%`}
              </div>
            </Stack>
            <Stack tokens={alignmentStackTokens}>
              <div className={classNames.tableData}>
                {localization.ErrorAnalysis.correctTotal}
              </div>
              <div className={classNames.tableData}>
                {`${this.props.temporaryCohort.totalCohortCorrect} / ${this.props.temporaryCohort.totalCohort}`}
              </div>
            </Stack>
            <Stack tokens={alignmentStackTokens}>
              <div className={classNames.tableData}>
                {localization.ErrorAnalysis.incorrectTotal}
              </div>
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
