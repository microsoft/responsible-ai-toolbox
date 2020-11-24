// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Stack, StackItem, Text } from "office-ui-fabric-react";
import React from "react";

import { DataSpecificationBlade } from "../../components/DataSpecificationBlade";
import { IWizardTabProps } from "../../components/IWizardTabProps";
import { WizardFooter } from "../../components/WizardFooter";
import { IFairnessPickerPropsV2 } from "../FairnessWizard";

import { FairnessTabStyles } from "./FairnessTab.styles";
import { SelectionList, ISelectionItemProps } from "./SelectionList";

export interface IFairnessTabProps extends IWizardTabProps {
  fairnessPickerProps: IFairnessPickerPropsV2;
}

export class FairnessTab extends React.PureComponent<IFairnessTabProps> {
  public render(): React.ReactNode {
    const styles = FairnessTabStyles();
    return (
      <Stack horizontal={false} className={styles.frame}>
        <Stack horizontal={true} horizontalAlign="space-between">
          <Stack horizontal={false} styles={{ root: { display: "flex" } }}>
            <Text className={styles.header} block>
              {localization.Fairness.Fairness.pickerHeader}
            </Text>
            <Text className={styles.textBody} block>
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
        <StackItem className={styles.itemsList}>
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
        </StackItem>
        <WizardFooter
          onNext={this.props.onNext}
          onPrevious={this.props.onPrevious}
        />
      </Stack>
    );
  }
}
