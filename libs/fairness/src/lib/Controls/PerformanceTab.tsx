// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text, Stack, getTheme } from "@fluentui/react";
import { PredictionTypes } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { IPerformancePickerPropsV2 } from "../FairnessWizard";

import { DataSpecificationBlade } from "./DataSpecificationBlade";
import { IWizardTabProps } from "./IWizardTabProps";
import { SelectionList } from "./SelectionList";
import { WizardFooter } from "./WizardFooter";

export interface IPerformancePickingTabProps extends IWizardTabProps {
  nextTabKey: string;
  performancePickerProps: IPerformancePickerPropsV2;
  previousTabKey: string;
}

export class PerformanceTab extends React.PureComponent<IPerformancePickingTabProps> {
  public render(): React.ReactNode {
    const theme = getTheme();
    return (
      <Stack>
        <Stack horizontal horizontalAlign="space-between">
          <Stack tokens={{ childrenGap: "l1", padding: "l1 0" }}>
            <Text
              variant={"xLarge"}
              block
              style={{ color: theme.semanticColors.bodyText }}
            >
              {localization.Fairness.Performance.header}
            </Text>
            <Text block style={{ color: theme.semanticColors.bodyText }}>
              {localization.formatString(
                localization.Fairness.Performance.body,
                this.props.dashboardContext.modelMetadata.PredictionType !==
                  PredictionTypes.Regression
                  ? localization.Fairness.Performance.binary
                  : localization.Fairness.Performance.continuous,
                this.props.dashboardContext.modelMetadata.PredictionType ===
                  PredictionTypes.BinaryClassification
                  ? localization.Fairness.Performance.binary
                  : localization.Fairness.Performance.continuous,
                this.props.dashboardContext.predictions.length === 1
                  ? localization.Fairness.Performance.modelMakes
                  : localization.Fairness.Performance.modelsMake
              )}
            </Text>
          </Stack>
          <DataSpecificationBlade
            numberRows={this.props.dashboardContext.trueY.length}
            featureNames={
              this.props.dashboardContext.modelMetadata.featureNames
            }
          />
        </Stack>
        <SelectionList
          grouped={false}
          defaultSelectedKey={
            this.props.performancePickerProps.selectedPerformanceKey
          }
          items={this.props.performancePickerProps.performanceOptions.map(
            (performance) => {
              return {
                description: performance.description,
                key: performance.key,
                metric: performance.key,
                name: performance.title,
                onSelect: this.props.performancePickerProps.onPerformanceChange
              };
            }
          )}
        />
        <WizardFooter
          nextTabKey={this.props.nextTabKey}
          previousTabKey={this.props.previousTabKey}
          onSetTab={this.props.onSetTab}
        />
      </Stack>
    );
  }
}
