import React from "react";
import {
  IconButton,
  DefaultButton,
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IDropdownOption,
  Callout
} from "office-ui-fabric-react";

import { localization } from "../Localization/localization";
import { IParityPickerProps } from "../FairnessWizard";

interface IState {
  showCallout: boolean;
}

export class ParityPicker extends React.PureComponent<
  IParityPickerProps,
  IState
> {
  private _parityDropdownHelpId = "_parityDropdownHelpId";
  public constructor(props: IParityPickerProps) {
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
              styles={{ root: { marginBottom: -3, color: "rgb(0, 120, 212)" } }}
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
                {localization.close}
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
    item: IComboBoxOption
  ): void => {
    this.props.onParityChange(item.key as string);
  };
}
