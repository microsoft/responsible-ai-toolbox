// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStackTokens, Stack } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ErrorCohortStats } from "../CohortStats";
import { Metrics } from "../Constants";
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
        <div className={classNames.section} />
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
                {`${this.props.temporaryCohort.cohortStats.errorCoverage.toFixed(
                  2
                )}%`}
              </div>
            </Stack>
            <Stack tokens={alignmentStackTokens}>
              <div className={classNames.tableData}>
                {localization.ErrorAnalysis.Metrics.metricName}
              </div>
              <div className={classNames.tableData}>
                {this.props.temporaryCohort.cohortStats.metricName}
              </div>
            </Stack>
            <Stack tokens={alignmentStackTokens}>
              <div className={classNames.tableData}>
                {localization.ErrorAnalysis.Metrics.metricValue}
              </div>
              <div className={classNames.tableData}>
                {this.props.temporaryCohort.cohortStats.metricName ===
                  Metrics.ErrorRate &&
                  `${this.props.temporaryCohort.cohortStats.metricValue.toFixed(
                    2
                  )}%`}
                {this.props.temporaryCohort.cohortStats.metricName !==
                  Metrics.ErrorRate &&
                  this.props.temporaryCohort.cohortStats.metricValue.toFixed(2)}
              </div>
            </Stack>
            {this.props.temporaryCohort.cohortStats instanceof
              ErrorCohortStats && (
              <Stack tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>
                  {localization.ErrorAnalysis.correctTotal}
                </div>
                <div className={classNames.tableData}>
                  {`${this.props.temporaryCohort.cohortStats.totalCohortCorrect} / ${this.props.temporaryCohort.cohortStats.totalCohort}`}
                </div>
              </Stack>
            )}
            {this.props.temporaryCohort.cohortStats instanceof
              ErrorCohortStats && (
              <Stack tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>
                  {localization.ErrorAnalysis.incorrectTotal}
                </div>
                <div className={classNames.tableData}>
                  {`${this.props.temporaryCohort.cohortStats.totalCohortIncorrect} / ${this.props.temporaryCohort.cohortStats.totalCohort}`}
                </div>
              </Stack>
            )}
          </Stack>
        </div>
      </div>
    );
  }
}
