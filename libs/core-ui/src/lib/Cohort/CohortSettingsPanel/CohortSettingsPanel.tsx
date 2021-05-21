// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "../../Context/ModelAssessmentContext";
import { localization } from "@responsible-ai/localization";
import React from "react";
import { ErrorCohort } from "../ErrorCohort";
import { DefaultButton, Panel, Stack, Text } from "office-ui-fabric-react";
import { CohortList } from "../CohortList/CohortList";

export interface ICohortSettingsPanelProps {
  errorCohorts: ErrorCohort[];
  isOpen: boolean;
  onDismiss: () => void;
  toggleShiftCohortVisibility: () => void;
  toggleCreateCohortVisibility: () => void;
  onEditCohortClick: (editedCohort: ErrorCohort) => void;
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
        // layerProps={{ hostId: this.props.hostId }}
        isBlocking={false}
        onDismiss={this.props.onDismiss}
        title={localization.ModelAssessment.CohortSettings.CohortSettingsTitle}
      >
        <Stack tokens={{ childrenGap: 20 }}>
          <Text>
            {
              localization.ModelAssessment.CohortSettings
                .CohortSettingsDescription
            }
          </Text>
          <Stack horizontal={true} tokens={{ childrenGap: 25 }}>
            <DefaultButton
              text={
                localization.ModelAssessment.CohortInformation
                  .ChangeGlobalCohort
              }
              onClick={this.props.toggleShiftCohortVisibility}
              styles={{ root: { padding: "20px 0 20px 0" } }}
            />
            <DefaultButton
              text={
                localization.ModelAssessment.CohortInformation.CreateNewCohort
              }
              onClick={this.props.toggleCreateCohortVisibility}
              styles={{ root: { padding: "20px 0 20px 0" } }}
            />
          </Stack>
          <CohortList
            errorCohorts={this.props.errorCohorts}
            includeDetails={true}
            onEditCohortClick={this.props.onEditCohortClick}
            enableEditing={false}
          />
        </Stack>
      </Panel>
    );
  }
}
