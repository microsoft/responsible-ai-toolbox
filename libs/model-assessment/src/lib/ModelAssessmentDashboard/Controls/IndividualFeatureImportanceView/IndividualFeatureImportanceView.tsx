// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { IIndividualFeatureImportanceProps } from "./IndividualFeatureImportanceProps";
import { TabularLocalImportancePlots } from "./TabularLocalImportancePlots";
import { TextLocalImportancePlots } from "./TextLocalImportancePlots";

export class IndividualFeatureImportanceView extends React.Component<IIndividualFeatureImportanceProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const hasTextImportances =
      !!this.context.modelExplanationData?.precomputedExplanations
        ?.textFeatureImportance;

    return (
      <Stack tokens={{ padding: "l1" }}>
        {!hasTextImportances && (
          <TabularLocalImportancePlots
            features={this.context.modelMetadata.featureNames}
            jointDataset={this.context.jointDataset}
            invokeModel={this.props.invokeModel}
            selectedWeightVector={this.props.selectedWeightVector}
            weightOptions={this.props.weightOptions}
            weightLabels={this.props.weightLabels}
            onWeightChange={this.props.onWeightChange}
            selectedCohort={this.context.selectedErrorCohort}
            modelType={this.props.modelType}
            selectedItems={this.props.allSelectedItems}
            telemetryHook={this.props.telemetryHook}
          />
        )}
        {hasTextImportances && (
          <TextLocalImportancePlots
            jointDataset={this.context.jointDataset}
            selectedItems={this.props.allSelectedItems}
            selectedWeightVector={this.props.selectedWeightVector}
            weightOptions={this.props.weightOptions}
            weightLabels={this.props.weightLabels}
            onWeightChange={this.props.onWeightChange}
          />
        )}
      </Stack>
    );
  }
}
