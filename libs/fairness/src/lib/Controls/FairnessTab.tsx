// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { IFairnessPickerPropsV2 } from "../FairnessWizard";

import { DataSpecificationBlade } from "./DataSpecificationBlade";
import { IWizardTabProps } from "./IWizardTabProps";
import { SelectionList, ISelectionItemProps } from "./SelectionList";
import { WizardFooter } from "./WizardFooter";

export interface IFairnessTabProps extends IWizardTabProps {
  fairnessPickerProps: IFairnessPickerPropsV2;
  nextTabKey: string;
  previousTabKey: string;
}

export class FairnessTab extends React.PureComponent<IFairnessTabProps> {
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
              {localization.Fairness.Fairness.pickerHeader}
            </Text>
            <Text block style={{ color: theme.semanticColors.bodyText }}>
              {localization.Fairness.Fairness.body}
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
          grouped
          defaultSelectedKey={
            this.props.fairnessPickerProps.selectedFairnessKey
          }
          items={this.props.fairnessPickerProps.fairnessOptions.map(
            (fairness): ISelectionItemProps => {
              return {
                description: fairness.description,
                key: fairness.key,
                metric: fairness.fairnessMetric,
                name: fairness.title,
                onSelect: this.props.fairnessPickerProps.onFairnessChange
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
