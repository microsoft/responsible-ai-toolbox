// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IObjectWithKey, Label, Stack, Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { TableView } from "@responsible-ai/dataset-explorer";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { IIndividualFeatureImportanceProps } from "./IndividualFeatureImportanceProps";
import { IIndividualFeatureImportanceState } from "./IndividualFeatureImportanceState";
import {
  horizontalComponentTokens,
  individualFeatureImportanceStyles,
  verticalComponentTokens
} from "./IndividualFeatureImportanceView.styles";
import { TabularLocalImportancePlots } from "./TabularLocalImportancePlots";
import { TextLocalImportancePlots } from "./TextLocalImportancePlots";

export class IndividualFeatureImportanceView extends React.Component<
  IIndividualFeatureImportanceProps,
  IIndividualFeatureImportanceState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IIndividualFeatureImportanceProps) {
    super(props);
    this.state = {
      allSubsetSelectedItems: []
    };
  }

  public render(): React.ReactNode {
    const hasTextImportances =
      !!this.context.modelExplanationData?.precomputedExplanations
        ?.textFeatureImportance;
    const classNames = individualFeatureImportanceStyles();
    return (
      <Stack
        tokens={verticalComponentTokens}
        id="IndividualFeatureImportanceView"
      >
        <Stack horizontal tokens={horizontalComponentTokens}>
          <Label className={classNames.boldText}>
            {
              localization.ModelAssessment.IndividualFeatureImportanceView
                .SmallInstanceSelection
            }
          </Label>
          <Text variant="large">
            {
              localization.ModelAssessment.IndividualFeatureImportanceView
                .SmallTableText
            }
          </Text>
        </Stack>
        <TableView
          features={this.props.features}
          jointDataset={this.props.jointDataset}
          selectedCohort={this.props.selectedCohort}
          modelType={this.props.modelType}
          onAllSelectedItemsChange={this.onAllSubsetSelectedItemsChange}
          telemetryHook={this.props.telemetryHook}
        />
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
            selectedItems={this.state.allSubsetSelectedItems}
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

  private onAllSubsetSelectedItemsChange = (
    allSubsetSelectedItems: IObjectWithKey[]
  ): void => {
    this.setState({ allSubsetSelectedItems });
  };
}
