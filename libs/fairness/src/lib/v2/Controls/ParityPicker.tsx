// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  IconButton,
  DefaultButton,
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IDropdownOption,
  Callout
} from "office-ui-fabric-react";
import React from "react";

import { IParityPickerPropsV2 } from "../FairnessWizard";

interface IState {
  showCallout: boolean;
}

export class ParityPicker extends React.PureComponent<
  IParityPickerPropsV2,
  IState
> {
  private _parityDropdownHelpId = "_parityDropdownHelpId";
  public constructor(props: IParityPickerPropsV2) {
    super(props);
    this.state = { showCallout: false };
  }
  public ender(): React.ReactNode {
    const options: IDropdownOption[] = this.props.parityOptions.map(
      (option) => {
        return {
          key: option.key,
          text: option.title
        };
      }
    );

    return (
      <div>
        <div>
          <div>
            <span>{"TODO"}</span>
            <IconButton
              id={this._parityDropdownHelpId}
              iconProps={{ iconName: "Info" }}
              title={"TODO"}
              ariaLabel="Info"
              onClick={this.onOpen}
              styles={{ root: { color: "rgb(0, 120, 212)", marginBottom: -3 } }}
            />
          </div>
          <ComboBox
            selectedKey={this.props.selectedParityKey}
            onChange={this.onParityChange}
            options={options}
            ariaLabel={"Parity selector"}
            useComboBoxAsMenuWidth={true}
          />
        </div>
        {this.state.showCallout && (
          <Callout
            target={"#" + this._parityDropdownHelpId}
            setInitialFocus={true}
            onDismiss={this.onDismiss}
            role="alertdialog"
          >
            <div>
              <DefaultButton onClick={this.onDismiss}>
                {localization.Fairness.close}
              </DefaultButton>
            </div>
          </Callout>
        )}
      </div>
    );
  }

  private readonly onDismiss = (): void => {
    this.setState({ showCallout: false });
  };

  private readonly onOpen = (): void => {
    this.setState({ showCallout: true });
  };

  private readonly onParityChange = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      this.props.onParityChange(item.key);
    }
  };
}
