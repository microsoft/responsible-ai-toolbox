// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Stack,
  Panel,
  PrimaryButton,
  DefaultButton
} from "office-ui-fabric-react";
import React from "react";

interface IMetricConfigurationFlyoutProps {
  isOpen: boolean;
  onDismissFlyout: () => void;
}

interface IMetricConfigurationFlyoutState {}

export class MetricConfigurationFlyout extends React.Component<
  IMetricConfigurationFlyoutProps,
  IMetricConfigurationFlyoutState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return (
      <Panel
        isOpen={this.props.isOpen}
        closeButtonAriaLabel="Close"
        onDismiss={this.props.onDismissFlyout}
      >
        <Stack tokens={{ childrenGap: "10px" }}>
          <Stack horizontal tokens={{ childrenGap: "10px" }}>
            <PrimaryButton
              onClick={this.onConfirm}
              text={
                localization.ModelAssessment.ModelOverview.chartConfigConfirm
              }
              //disabled={noCohortSelected}
            />
            <DefaultButton
              onClick={this.props.onDismissFlyout}
              text={
                localization.ModelAssessment.ModelOverview.chartConfigCancel
              }
            />
          </Stack>
        </Stack>
      </Panel>
    );
  }

  private onConfirm = () => {};
}
