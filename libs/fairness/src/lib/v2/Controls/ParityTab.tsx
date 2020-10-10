// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Stack, StackItem, Text } from "office-ui-fabric-react";
import React from "react";

import { DataSpecificationBlade } from "../../components/DataSpecificationBlade";
import { IWizardTabProps } from "../../components/IWizardTabProps";
import { WizardFooter } from "../../components/WizardFooter";
import { IParityPickerPropsV2 } from "../FairnessWizard";

import { ParityTabStyles } from "./ParityTab.styles";
import { TileList, ITileProp } from "./TileList";

export interface IParityTabProps extends IWizardTabProps {
  parityPickerProps: IParityPickerPropsV2;
}

export class ParityTab extends React.PureComponent<IParityTabProps> {
  public render(): React.ReactNode {
    const styles = ParityTabStyles();
    return (
      <Stack
        horizontal
        horizontalAlign="space-between"
        className={styles.frame}
      >
        <StackItem grow={2}>
          <Stack className={styles.main}>
            <Text className={styles.header} block>
              {localization.Fairness.Performance.header}
            </Text>
            <Text className={styles.textBody} block>
              {localization.Fairness.Parity.body}
            </Text>
            <StackItem grow={2} className={styles.itemsList}>
              <TileList
                items={this.props.parityPickerProps.parityOptions.map(
                  (parity): ITileProp => {
                    const selected =
                      this.props.parityPickerProps.selectedParityKey ===
                      parity.key;
                    return {
                      description: parity.description,
                      onSelect: this.props.parityPickerProps.onParityChange.bind(
                        this,
                        parity.key
                      ),
                      selected,
                      title: parity.title
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
        </StackItem>
        <DataSpecificationBlade
          numberRows={this.props.dashboardContext.trueY.length}
          featureNames={this.props.dashboardContext.modelMetadata.featureNames}
        />
      </Stack>
    );
  }
}
