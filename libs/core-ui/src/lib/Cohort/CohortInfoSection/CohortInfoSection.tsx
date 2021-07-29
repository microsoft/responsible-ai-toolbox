// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { DefaultButton, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import {
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "../../Context/ModelAssessmentContext";

export interface ICohortInfoSectionProps {
  toggleShiftCohortVisibility: () => void;
  toggleCreateCohortVisibility: () => void;
}

export class CohortInfoSection extends React.PureComponent<ICohortInfoSectionProps> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const currentCohort = this.context.baseErrorCohort;
    const cohortName = currentCohort.cohort.name;
    // add (default) if it's the default cohort
    let cohortInfoTitle =
      localization.ModelAssessment.CohortInformation.GlobalCohort + cohortName;
    if (
      currentCohort.cohort.filters.length === 0 &&
      currentCohort.cohort.name === localization.Interpret.Cohort.defaultLabel
    ) {
      cohortInfoTitle +=
        localization.ModelAssessment.CohortInformation.DefaultCohort;
    }
    const datapointsCountString =
      localization.ModelAssessment.CohortInformation.DataPoints +
      " = " +
      currentCohort.cohortStats.totalCohort.toString();
    const filtersCountString =
      localization.ModelAssessment.CohortInformation.Filters +
      " = " +
      currentCohort.cohort.filters.length.toString();
    return (
      <Stack grow tokens={{ childrenGap: 10, padding: "16px 24px" }}>
        <Text variant={"xLarge"}>{cohortInfoTitle}</Text>
        <Stack>
          <Text>{datapointsCountString}</Text>
          <Text>{filtersCountString}</Text>
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 25 }}>
          <DefaultButton
            text={
              localization.ModelAssessment.CohortInformation.ChangeGlobalCohort
            }
            onClick={this.props.toggleShiftCohortVisibility}
          />
          <DefaultButton
            text={
              localization.ModelAssessment.CohortInformation.CreateNewCohort
            }
            onClick={this.props.toggleCreateCohortVisibility}
          />
        </Stack>
      </Stack>
    );
  }
}
