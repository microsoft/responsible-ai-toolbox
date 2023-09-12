// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DefaultButton, Stack, Label, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { getCohortFilterCount } from "../../util/getCohortFilterCount";
import { ErrorCohortStats } from "../CohortStats";
import { ErrorCohort } from "../ErrorCohort";
import { PredictionPath } from "../PredictionPath/PredictionPath";

import { cohortInfoStyles } from "./CohortInfo.styles";

export interface ICohortInfoProps {
  currentCohort: ErrorCohort;
  onSaveCohortClick: () => void;
  disabledView: boolean;
}

export class CohortInfo extends React.PureComponent<ICohortInfoProps> {
  public render(): React.ReactNode {
    const classNames = cohortInfoStyles();

    return (
      <Stack className={classNames.container} tokens={{ childrenGap: "20px" }}>
        <Stack tokens={{ childrenGap: "20px" }} className={classNames.left}>
          <DefaultButton
            className={classNames.button}
            text={localization.ErrorAnalysis.CohortInfo.saveCohort}
            onClick={(): any => this.props.onSaveCohortClick()}
            disabled={
              this.props.disabledView || !this.props.currentCohort.isTemporary
            }
          />
          <Stack>
            <Label>
              {localization.ErrorAnalysis.CohortInfo.basicInformation}
            </Label>
            {!this.props.currentCohort.isAllDataCohort && (
              <Text>{this.props.currentCohort.cohort.name}</Text>
            )}
            <Text>
              {localization.ErrorAnalysis.Cohort.defaultLabel} (
              {getCohortFilterCount(this.props.currentCohort.cohort)}{" "}
              {localization.ErrorAnalysis.CohortInfo.filters})
            </Text>
          </Stack>

          <Stack>
            <Label>
              {localization.ErrorAnalysis.CohortInfo.baseCohortInstances}
            </Label>
            <Text>
              {localization.ErrorAnalysis.CohortInfo.total}{" "}
              {this.props.currentCohort.cohortStats.totalAll}
            </Text>
            {this.props.currentCohort.cohortStats instanceof
              ErrorCohortStats && (
              <Text>
                {localization.ErrorAnalysis.CohortInfo.correct}{" "}
                {this.props.currentCohort.cohortStats.totalCorrect}
              </Text>
            )}
            {this.props.currentCohort.cohortStats instanceof
              ErrorCohortStats && (
              <Text>
                {localization.ErrorAnalysis.CohortInfo.incorrect}{" "}
                {this.props.currentCohort.cohortStats.totalIncorrect}
              </Text>
            )}
          </Stack>
        </Stack>

        <Stack tokens={{ childrenGap: "20px" }}>
          <Stack>
            <Label>
              {localization.ErrorAnalysis.CohortInfo.selectedCohortInstances}
            </Label>
            <Text>
              {localization.ErrorAnalysis.CohortInfo.total}{" "}
              {this.props.currentCohort.cohortStats.totalCohort}
            </Text>
            {this.props.currentCohort.cohortStats instanceof
              ErrorCohortStats && (
              <Text>
                {localization.ErrorAnalysis.CohortInfo.correct}{" "}
                {this.props.currentCohort.cohortStats.totalCohortCorrect}
              </Text>
            )}
            {this.props.currentCohort.cohortStats instanceof
              ErrorCohortStats && (
              <Text>
                {localization.ErrorAnalysis.CohortInfo.incorrect}{" "}
                {this.props.currentCohort.cohortStats.totalCohortIncorrect}
              </Text>
            )}
          </Stack>

          <Stack>
            <Label>
              {localization.ErrorAnalysis.CohortInfo.predictionPath}
            </Label>
            <PredictionPath temporaryCohort={this.props.currentCohort} />
          </Stack>
        </Stack>
      </Stack>
    );
  }
}
