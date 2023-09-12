// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DefaultButton, Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
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
    if (currentCohort.isAllDataCohort) {
      cohortInfoTitle +=
        localization.ModelAssessment.CohortInformation.DefaultCohort;
    }
    const datapointsCountString = `${
      localization.ModelAssessment.CohortInformation.DataPoints
    } = ${currentCohort.cohortStats.totalCohort.toString()}`;
    const filtersCountString = `${
      localization.ModelAssessment.CohortInformation.Filters
    } = ${currentCohort.cohort.filters.length.toString()}`;
    return (
      <Stack grow tokens={{ padding: "l1" }}>
        <Text variant={"xLarge"}>{cohortInfoTitle}</Text>
        <Stack>
          <Text>{datapointsCountString}</Text>
          <Text>{filtersCountString}</Text>
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 25 }}>
          <DefaultButton
            text={localization.ModelAssessment.CohortInformation.ShiftCohort}
            onClick={this.props.toggleShiftCohortVisibility}
          />
          <DefaultButton
            text={localization.ModelAssessment.CohortInformation.NewCohort}
            onClick={this.props.toggleCreateCohortVisibility}
          />
        </Stack>
      </Stack>
    );
  }
}
