// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  IconButton,
  DefaultButton,
  IDropdownOption,
  Callout
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { IFairnessPickerPropsV2 } from "../FairnessWizard";

interface IState {
  showCallout: boolean;
}

export class FairnessPicker extends React.PureComponent<
  IFairnessPickerPropsV2,
  IState
> {
  private _fairnessDropdownHelpId = "_fairnessDropdownHelpId";
  public constructor(props: IFairnessPickerPropsV2) {
    super(props);
    this.state = { showCallout: false };
  }
  public ender(): React.ReactNode {
    const options: IDropdownOption[] = this.props.fairnessOptions.map(
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
              id={this._fairnessDropdownHelpId}
              iconProps={{ iconName: "Info" }}
              title={"TODO"}
              ariaLabel="Info"
              onClick={this.onOpen}
              styles={{ root: { color: "rgb(0, 120, 212)", marginBottom: -3 } }}
            />
          </div>
          <ComboBox
            selectedKey={this.props.selectedFairnessKey}
            onChange={this.onFairnessChange}
            options={options}
            ariaLabel={"Fairness selector"}
            useComboBoxAsMenuWidth
          />
        </div>
        {this.state.showCallout && (
          <Callout
            target={`#${this._fairnessDropdownHelpId}`}
            setInitialFocus
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

  private readonly onFairnessChange = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      this.props.onFairnessChange(item.key);
    }
  };
}
