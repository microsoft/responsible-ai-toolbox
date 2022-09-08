// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { TableView } from "./TableView";
import { ITableViewProps } from "./TableViewProps";
import { tableViewTabStyles } from "./TableViewTab.styles";

export class TableViewTab extends React.Component<ITableViewProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const hasTextImportances =
      !!this.context.modelExplanationData?.precomputedExplanations
        ?.textFeatureImportance;
    const classNames = tableViewTabStyles();
    return (
      <Stack tokens={{ padding: "l1" }}>
        <Stack.Item className={classNames.infoWithText}>
          {!hasTextImportances && (
            <Text variant="medium">
              {
                localization.ModelAssessment.FeatureImportances
                  .IndividualFeatureTabular
              }
            </Text>
          )}
          {hasTextImportances && (
            <Text variant="medium">
              {
                localization.ModelAssessment.FeatureImportances
                  .IndividualFeatureText
              }
            </Text>
          )}
        </Stack.Item>
        <Stack.Item>
          <TableView
            features={this.props.features}
            jointDataset={this.props.jointDataset}
            selectedCohort={this.props.selectedCohort}
            modelType={this.props.modelType}
            onAllSelectedItemsChange={this.props.onAllSelectedItemsChange}
            telemetryHook={this.props.telemetryHook}
          />
        </Stack.Item>
      </Stack>
    );
  }
}
