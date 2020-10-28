// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Stack, StackItem, Separator } from "office-ui-fabric-react";
import React from "react";

import { DataSpecificationBlade } from "../../components/DataSpecificationBlade";
import { IWizardTabProps } from "../../components/IWizardTabProps";
import { WizardFooter } from "../../components/WizardFooter";
import { IFairnessPickerPropsV1 } from "../FairnessWizard";

import { TileList, ITileProp } from "./TileList";

export interface IFairnessTabProps extends IWizardTabProps {
  fairnessPickerProps: IFairnessPickerPropsV1;
}

export class FairnessTab extends React.PureComponent<IFairnessTabProps> {
  public render(): React.ReactNode {
    return (
      <Stack horizontal>
        <StackItem grow={2}>
          <Stack>
            <h2 style={{ fontWeight: "bold" }}>
              {localization.Fairness.Fairness.header}
            </h2>
            <p>{localization.Fairness.Fairness.bodyLegacy}</p>
            <StackItem grow={2}>
              <TileList
                items={this.props.fairnessPickerProps.fairnessOptions.map(
                  (fairnessOption): ITileProp => {
                    const selected =
                      this.props.fairnessPickerProps.selectedFairnessKey ===
                      fairnessOption.key;
                    return {
                      description: fairnessOption.description,
                      onSelect: this.props.fairnessPickerProps.onFairnessChange.bind(
                        this,
                        fairnessOption.key
                      ),
                      selected,
                      title: fairnessOption.title
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
