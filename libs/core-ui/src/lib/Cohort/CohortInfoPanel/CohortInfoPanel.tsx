// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "../../Context/ModelAssessmentContext";
import React from "react";
import { DefaultButton, Stack, Text } from "office-ui-fabric-react";
import { localization } from "@responsible-ai/localization";

export interface ICohortInfoPanelProps {
  toggleShiftCohortVisibility: () => void;
  toggleCreateCohortVisibility: () => void;
}
interface ICohortInfoPanelState {
  editCohortVisible: boolean;
  saveCohortVisible: boolean;
}

export class CohortInfoPanel extends React.PureComponent<
  ICohortInfoPanelProps,
  ICohortInfoPanelState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;

  public constructor(props: ICohortInfoPanelProps) {
    super(props);
    this.setState({
      editCohortVisible: false,
      saveCohortVisible: false
    });
  }

  public render(): React.ReactNode {
    let currentCohort = this.context.baseErrorCohort;
    let cohortName = currentCohort.cohort.name;
    // add (default) if it's the default cohort
    let cohortInfoTitle =
      localization.ModelAssessment.CohortInformation.GlobalCohort + cohortName;
    if (currentCohort.cohort.filters.length == 0) {
      cohortInfoTitle +=
        localization.ModelAssessment.CohortInformation.DefaultCohort;
    }
    let datapointsCountString =
      localization.ModelAssessment.CohortInformation.DataPoints +
      " = " +
      currentCohort.totalCohort.toString();
    let filtersCountString =
      localization.ModelAssessment.CohortInformation.Filters +
      " = " +
      currentCohort.cohort.filters.length.toString();
    return (
      <Stack grow={true} tokens={{ padding: "16px 24px", childrenGap: 10 }}>
        <Text variant={"xLarge"}>{cohortInfoTitle}</Text>
        <Stack>
          <Text>{datapointsCountString}</Text>
          <Text>{filtersCountString}</Text>
        </Stack>
        <Stack horizontal={true} tokens={{ childrenGap: 25 }}>
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
