// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { DefaultButton, IStackTokens, Stack } from "office-ui-fabric-react";
import React from "react";

import { ErrorCohortStats } from "../CohortStats";
import { ErrorCohort } from "../ErrorCohort";
import { PredictionPath } from "../PredictionPath/PredictionPath";

import { cohortInfoStyles } from "./CohortInfo.styles";

export interface ICohortInfoProps {
  currentCohort: ErrorCohort;
  onSaveCohortClick: () => void;
  includeDividers: boolean;
}

const alignmentStackTokens: IStackTokens = {
  childrenGap: 5,
  padding: 2
};

export class CohortInfo extends React.PureComponent<ICohortInfoProps> {
  public render(): React.ReactNode {
    const classNames = cohortInfoStyles();

    return (
      <Stack>
        {this.props.includeDividers && <div className={classNames.divider} />}
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <DefaultButton
              text={localization.ErrorAnalysis.CohortInfo.saveCohort}
              onClick={(): any => this.props.onSaveCohortClick()}
            />
          </div>
          <div className={classNames.section} />
          <div className={classNames.subsection}>
            <div className={classNames.header}>
              {localization.ErrorAnalysis.CohortInfo.basicInformation}
            </div>
            {this.props.currentCohort.cohort.name !==
              localization.ErrorAnalysis.Cohort.defaultLabel && (
              <div>{this.props.currentCohort.cohort.name}</div>
            )}
            <div>
              {localization.ErrorAnalysis.Cohort.defaultLabel} (
              {this.props.currentCohort.cohort.filters.length}{" "}
              {localization.ErrorAnalysis.CohortInfo.filters})
            </div>
          </div>
        </div>
        {this.props.includeDividers && <div className={classNames.divider} />}{" "}
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div>
              {localization.ErrorAnalysis.CohortInfo.baseCohortInstances}
            </div>
            <Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>
                  {localization.ErrorAnalysis.CohortInfo.total}
                </div>
                <div className={classNames.tableData}>
                  {this.props.currentCohort.cohortStats.totalAll}
                </div>
              </Stack>
              {this.props.currentCohort.cohortStats instanceof
                ErrorCohortStats && (
                <Stack horizontal tokens={alignmentStackTokens}>
                  <div className={classNames.tableData}>
                    {localization.ErrorAnalysis.CohortInfo.correct}
                  </div>
                  <div className={classNames.tableData}>
                    {this.props.currentCohort.cohortStats.totalCorrect}
                  </div>
                </Stack>
              )}
              {this.props.currentCohort.cohortStats instanceof
                ErrorCohortStats && (
                <Stack horizontal tokens={alignmentStackTokens}>
                  <div className={classNames.tableData}>
                    {localization.ErrorAnalysis.CohortInfo.incorrect}
                  </div>
                  <div className={classNames.tableData}>
                    {this.props.currentCohort.cohortStats.totalIncorrect}
                  </div>
                </Stack>
              )}
            </Stack>
          </div>
        </div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div>
              {localization.ErrorAnalysis.CohortInfo.selectedCohortInstances}
            </div>
            <Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>
                  {localization.ErrorAnalysis.CohortInfo.total}
                </div>
                <div className={classNames.tableData}>
                  {this.props.currentCohort.cohortStats.totalCohort}
                </div>
              </Stack>
              {this.props.currentCohort.cohortStats instanceof
                ErrorCohortStats && (
                <Stack horizontal tokens={alignmentStackTokens}>
                  <div className={classNames.tableData}>
                    {localization.ErrorAnalysis.CohortInfo.correct}
                  </div>
                  <div className={classNames.tableData}>
                    {this.props.currentCohort.cohortStats.totalCohortCorrect}
                  </div>
                </Stack>
              )}
              {this.props.currentCohort.cohortStats instanceof
                ErrorCohortStats && (
                <Stack horizontal tokens={alignmentStackTokens}>
                  <div className={classNames.tableData}>
                    {localization.ErrorAnalysis.CohortInfo.incorrect}
                  </div>
                  <div className={classNames.tableData}>
                    {this.props.currentCohort.cohortStats.totalCohortIncorrect}
                  </div>
                </Stack>
              )}
            </Stack>
          </div>
        </div>
        {this.props.includeDividers && <div className={classNames.divider} />}{" "}
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div className={classNames.header}>
              {localization.ErrorAnalysis.CohortInfo.predictionPath}
            </div>
            <PredictionPath temporaryCohort={this.props.currentCohort} />
          </div>
        </div>
      </Stack>
    );
  }
}
