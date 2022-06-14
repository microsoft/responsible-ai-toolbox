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

import { IPerformancePickerPropsV2 } from "../FairnessWizard";

interface IState {
  showCallout: boolean;
}

export class PerformancePicker extends React.PureComponent<
  IPerformancePickerPropsV2,
  IState
> {
  private _performanceDropdownHelpId = "_performanceDropdownHelpId";
  public constructor(props: IPerformancePickerPropsV2) {
    super(props);
    this.state = { showCallout: false };
  }
  public render(): React.ReactNode {
    const options: IDropdownOption[] = this.props.performanceOptions.map(
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
              id={this._performanceDropdownHelpId}
              iconProps={{ iconName: "Info" }}
              title={"TODO"}
              ariaLabel="Info"
              onClick={this.onOpen}
              styles={{ root: { color: "rgb(0, 120, 212)", marginBottom: -3 } }}
            />
          </div>
          <ComboBox
            selectedKey={this.props.selectedPerformanceKey}
            onChange={this.onPerformanceChange}
            options={options}
            ariaLabel={"Performance selector"}
            useComboBoxAsMenuWidth
          />
        </div>
        {this.state.showCallout && (
          <Callout
            target={`#${this._performanceDropdownHelpId}`}
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

  private readonly onPerformanceChange = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      this.props.onPerformanceChange(item.key);
    }
  };
}
