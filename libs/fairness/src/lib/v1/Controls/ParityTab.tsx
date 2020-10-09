// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, StackItem, Separator } from "office-ui-fabric-react";
import React from "react";

import { DataSpecificationBlade } from "../../components/DataSpecificationBlade";
import { IWizardTabProps } from "../../components/IWizardTabProps";
import { WizardFooter } from "../../components/WizardFooter";
import { localization } from "@responsible-ai/localization";
import { IParityPickerPropsV1 } from "../FairnessWizard";

import { TileList, ITileProp } from "./TileList";

export interface IParityTabProps extends IWizardTabProps {
  parityPickerProps: IParityPickerPropsV1;
}

export class ParityTab extends React.PureComponent<IParityTabProps> {
  public render(): React.ReactNode {
    return (
      <Stack horizontal>
        <StackItem grow={2}>
          <Stack>
            <h2 style={{ fontWeight: "bold" }}>
              {localization.Fairness.Parity.header}
            </h2>
            <p>{localization.Fairness.Parity.bodyLegacy}</p>
            <StackItem grow={2}>
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
            <Separator />
            <WizardFooter
              onNext={this.props.onNext}
              onPrevious={this.props.onPrevious}
            />
          </Stack>
        </StackItem>
        <DataSpecificationBlade
          numberRows={this.props.dashboardContext.dataset?.length || 0}
          featureNames={this.props.dashboardContext.modelMetadata.featureNames}
        />
      </Stack>
    );
  }
}
