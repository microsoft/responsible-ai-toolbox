// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Panel, PanelType, Stack, Text } from "@fluentui/react";
import {
  DatasetTaskType,
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ChangeGlobalCohortButton } from "./ChangeGlobalCohortButton";
import { CohortList } from "./CohortList";
import { CreateGlobalCohortButton } from "./CreateGlobalCohortButton";

export interface ICohortSettingsPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  allowCohortEditing: boolean;
  showAllDataCohort: boolean;
}

export class CohortSettingsPanel extends React.PureComponent<ICohortSettingsPanelProps> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    let localizationBase;
    if (
      this.context &&
      this.context.dataset.task_type === DatasetTaskType.Forecasting
    ) {
      localizationBase = localization.Forecasting.TimeSeriesSettings;
    } else {
      localizationBase = localization.ModelAssessment.CohortSettings;
    }
    return (
      <Panel
        headerText={localizationBase.CohortSettingsTitle}
        isOpen={this.props.isOpen}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        isBlocking={false}
        onDismiss={this.props.onDismiss}
        type={PanelType.medium}
        id={"CohortSettingsPanel"}
      >
        <Stack horizontal={false} tokens={{ childrenGap: 20 }}>
          <Stack.Item>
            <Text>{localizationBase.CohortSettingsDescription}</Text>
          </Stack.Item>
          <Stack.Item>
            <Stack horizontal tokens={{ childrenGap: 25 }}>
              <Stack.Item>
                <ChangeGlobalCohortButton
                  showAllDataCohort={this.props.showAllDataCohort}
                />
              </Stack.Item>
              {this.props.allowCohortEditing && (
                <Stack.Item>
                  <CreateGlobalCohortButton />
                </Stack.Item>
              )}
            </Stack>
          </Stack.Item>
          <Stack.Item>
            <CohortList
              enableEditing={this.props.allowCohortEditing}
              showAllDataCohort={this.props.showAllDataCohort}
            />
          </Stack.Item>
        </Stack>
      </Panel>
    );
  }
}
