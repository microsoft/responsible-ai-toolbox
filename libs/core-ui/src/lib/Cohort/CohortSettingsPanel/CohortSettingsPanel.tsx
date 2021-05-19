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
import { Panel, Text } from "office-ui-fabric-react";

export interface ICohortSettingsPanelProps {
  errorCohorts: ErrorCohort[];
  isOpen: boolean;
  onDismiss: () => void;
}
interface ICohortSettingsPanelState {}

export class CohortSettingsPanel extends React.PureComponent<
  ICohortSettingsPanelProps,
  ICohortSettingsPanelState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return (
      <Panel
        headerText={localization.ErrorAnalysis.CohortInfo.cohortInformation}
        isOpen={this.props.isOpen}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        // layerProps={{ hostId: this.props.hostId }}
        isBlocking={false}
        onDismiss={this.props.onDismiss}
        title={localization.ModelAssessment.DashboardSettings.Title}
      >
        <Text>{localization.ModelAssessment.DashboardSettings.Content}</Text>
      </Panel>
    );
  }
}
