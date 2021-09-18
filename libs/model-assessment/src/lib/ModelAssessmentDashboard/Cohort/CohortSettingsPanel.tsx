// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Panel, PanelType, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { ChangeGlobalCohortButton } from "./ChangeGlobalCohortButton";
import { CohortList } from "./CohortList";
import { CreateGlobalCohortButton } from "./CreateGlobalCohortButton";

export interface ICohortSettingsPanelProps {
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
        type={PanelType.medium}
      >
        <Stack horizontal={false} tokens={{ childrenGap: 20 }}>
          <Stack.Item>
            <Text>
              {
                localization.ModelAssessment.CohortSettings
                  .CohortSettingsDescription
              }
            </Text>
          </Stack.Item>
          <Stack.Item>
            <Stack horizontal tokens={{ childrenGap: 25 }}>
              <Stack.Item>
                <ChangeGlobalCohortButton />
              </Stack.Item>
              <Stack.Item>
                <CreateGlobalCohortButton />
              </Stack.Item>
            </Stack>
          </Stack.Item>
          <Stack.Item>
            <CohortList enableEditing />
          </Stack.Item>
        </Stack>
      </Panel>
    );
  }
}
