// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ErrorCohort,
  IModelAssessmentContext,
  ModelAssessmentContext,
  CohortList
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Panel, PanelType, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { ChangeGlobalCohortButton } from "./ChangeGlobalCohortButton";
import { CreateGlobalCohortButton } from "./CreateGlobalCohortButton";

export interface ICohortSettingsPanelProps {
  errorCohorts: ErrorCohort[];
  isOpen: boolean;
  onDismiss: () => void;
}

export class CohortSettingsPanel extends React.PureComponent<ICohortSettingsPanelProps> {
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
            <ChangeGlobalCohortButton />
            <CreateGlobalCohortButton />
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
