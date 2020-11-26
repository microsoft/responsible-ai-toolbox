// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { DataSpecificationBlade } from "../../components/DataSpecificationBlade";
import { IWizardTabProps } from "../../components/IWizardTabProps";
import { WizardFooter } from "../../components/WizardFooter";
import { IFairnessPickerPropsV2 } from "../FairnessWizard";

import { SelectionList, ISelectionItemProps } from "./SelectionList";

export interface IFairnessTabProps extends IWizardTabProps {
  fairnessPickerProps: IFairnessPickerPropsV2;
}

export class FairnessTab extends React.PureComponent<IFairnessTabProps> {
  public render(): React.ReactNode {
    return (
      <Stack>
        <Stack horizontal horizontalAlign="space-between">
          <Stack tokens={{ childrenGap: "l1", padding: "l1 0" }}>
            <Text variant={"xLarge"} block>
              {localization.Fairness.Fairness.pickerHeader}
            </Text>
            <Text block>{localization.Fairness.Fairness.body}</Text>
          </Stack>
          <DataSpecificationBlade
            numberRows={this.props.dashboardContext.trueY.length}
            featureNames={
              this.props.dashboardContext.modelMetadata.featureNames
            }
          />
        </Stack>
        <SelectionList
          grouped={true}
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
                onSelect: this.props.fairnessPickerProps.onFairnessChange.bind(
                  this,
                  fairness.key
                )
              };
            }
          )}
        />
        <WizardFooter
          onNext={this.props.onNext}
          onPrevious={this.props.onPrevious}
        />
      </Stack>
    );
  }
}
