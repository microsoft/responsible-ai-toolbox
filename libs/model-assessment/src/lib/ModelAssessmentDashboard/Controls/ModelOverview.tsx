// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  MissingParametersPlaceholder,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  OverallMetricChart
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

interface IModelOverviewProps {
  showNewModelOverviewExperience: boolean;
}

// This will be an interface shortly.
// As long as it has no members it needs to remain a class for code style reasons.
class IModelOverviewState {}

export class ModelOverview extends React.Component<
  IModelOverviewProps,
  IModelOverviewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  constructor(props: IModelOverviewProps) {
    super(props);
    this.state = {
      selectedMetrics: [],
      selectedFeatures: [],
      isFeaturePickerLimitExceededDialogOpen: false
    };
  }

  public render(): React.ReactNode {
    if (!this.context.jointDataset.hasPredictedY) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.ModelPerformance.missingParameters}
        </MissingParametersPlaceholder>
      );
    }

    return (
      <Stack tokens={{ padding: "16px 40px 10px 40px" }}>
        <Text variant="medium">
          {localization.Interpret.ModelPerformance.helperText}
        </Text>
        {!this.props.showNewModelOverviewExperience && <OverallMetricChart />}
      </Stack>
    );
  }
}
