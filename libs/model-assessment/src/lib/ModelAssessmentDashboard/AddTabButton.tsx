// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getRandomId } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Callout,
  Dropdown,
  IconButton,
  IDropdownOption,
  PrimaryButton,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { addTabButtonStyles } from "./AddTabButton.styles";
import { GlobalTabKeys } from "./ModelAssessmentEnums";
export interface IAddTabButtonProps {
  tabIndex: number;
  availableTabs: IDropdownOption[];
  onAdd(index: number, tab: GlobalTabKeys): void;
}
interface IAddTabButtonState {
  isCalloutVisible: boolean;
  tabSelected: GlobalTabKeys | undefined;
}

export class AddTabButton extends React.Component<
  IAddTabButtonProps,
  IAddTabButtonState
> {
  private buttonId = getRandomId();
  public constructor(props: IAddTabButtonProps) {
    super(props);
    this.state = {
      isCalloutVisible: false,
      tabSelected: undefined
    };
  }
  public render(): React.ReactNode {
    const style = addTabButtonStyles();
    return (
      <div className={style.buttonSection}>
        <div className={style.splitter} />
        <Stack horizontal horizontalAlign={"center"}>
          <IconButton
            id={this.buttonId}
            iconProps={{ iconName: "CircleAdditionSolid" }}
            onClick={this.toggleIsCalloutVisible}
            className={style.button}
          />
          {this.state.isCalloutVisible && (
            <Callout
              target={`#${this.buttonId}`}
              onDismiss={this.toggleIsCalloutVisible}
              role="status"
              aria-live="assertive"
              className={style.callout}
            >
              <Stack tokens={{ childrenGap: "l1" }}>
                {localization.ModelAssessment.AddingTab.CalloutContent}
                <Dropdown
                  options={this.props.availableTabs}
                  onChange={this.onChange}
                />
                <PrimaryButton
                  onClick={this.addTab}
                  text={localization.ModelAssessment.AddingTab.AddButtonText}
                />
              </Stack>
            </Callout>
          )}
        </Stack>
      </div>
    );
  }

  private onChange = (
    _: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption | undefined
  ): void => {
    if (!option) {
      return;
    }
    this.setState({ tabSelected: option.key as GlobalTabKeys });
  };

  private addTab = (): void => {
    if (!this.state.tabSelected) {
      return;
    }
    this.props.onAdd(this.props.tabIndex, this.state.tabSelected);
    this.setState({
      isCalloutVisible: false
    });
  };
  private toggleIsCalloutVisible = (): void => {
    this.setState((prev) => ({
      isCalloutVisible: !prev.isCalloutVisible,
      tabSelected: undefined
    }));
  };
}
