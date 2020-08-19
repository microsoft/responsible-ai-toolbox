import React from "react";
import { Stack, StackItem, Separator } from "office-ui-fabric-react";

import { localization } from "../../Localization/localization";
import { IWizardTabProps } from "../IWizardTabProps";
import { IParityPickerPropsV1 } from "../FairnessWizard";
import { DataSpecificationBlade } from "./DataSpecificationBlade";
import { WizardFooter } from "./WizardFooter";
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
            <h2 style={{ fontWeight: "bold" }}>{localization.Parity.header}</h2>
            <p>{localization.Parity.bodyLegacy}</p>
            <StackItem grow={2}>
              <TileList
                items={this.props.parityPickerProps.parityOptions.map(
                  (parity): ITileProp => {
                    const selected =
                      this.props.parityPickerProps.selectedParityKey ===
                      parity.key;
                    return {
                      title: parity.title,
                      description: parity.description,
                      onSelect: this.props.parityPickerProps.onParityChange.bind(
                        this,
                        parity.key
                      ),
                      selected
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
          numberRows={this.props.dashboardContext.dataset.length}
          featureNames={this.props.dashboardContext.modelMetadata.featureNames}
        />
      </Stack>
    );
  }
}
