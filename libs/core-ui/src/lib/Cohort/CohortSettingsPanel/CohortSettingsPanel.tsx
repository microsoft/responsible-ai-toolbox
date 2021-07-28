// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  DefaultButton,
  Panel,
  PanelType,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import {
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "../../Context/ModelAssessmentContext";
import { CohortList } from "../CohortList/CohortList";
import { ErrorCohort } from "../ErrorCohort";

export interface ICohortSettingsPanelProps {
  errorCohorts: ErrorCohort[];
  isOpen: boolean;
  onDismiss: () => void;
  toggleShiftCohortVisibility: () => void;
  toggleCreateCohortVisibility: () => void;
}

export class CohortSettingsPanel extends React.PureComponent<
  ICohortSettingsPanelProps
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return (
      <Panel
        headerText={
          localization.ModelAssessment.CohortSettings.CohortSettingsTitle
        }
        isOpen={this.props.isOpen}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        isBlocking={false}
        onDismiss={this.props.onDismiss}
        title={localization.ModelAssessment.CohortSettings.CohortSettingsTitle}
        type={PanelType.medium}
      >
        <Stack tokens={{ childrenGap: 20 }}>
          <Text>
            {
              localization.ModelAssessment.CohortSettings
                .CohortSettingsDescription
            }
          </Text>
          <Stack horizontal tokens={{ childrenGap: 25 }}>
            <DefaultButton
              text={
                localization.ModelAssessment.CohortInformation
                  .ChangeGlobalCohort
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
          <CohortList
            errorCohorts={this.props.errorCohorts}
            includeDetails
            enableEditing={false}
          />
        </Stack>
      </Panel>
    );
  }
}
