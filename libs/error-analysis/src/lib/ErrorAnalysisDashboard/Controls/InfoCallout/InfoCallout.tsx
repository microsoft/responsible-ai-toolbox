// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Callout, IconButton } from "office-ui-fabric-react";
import React from "react";

import { infoCalloutStyles } from "./InfoCallout.styles";

export interface IInfoCalloutProps {
  iconId: string;
  infoText: string;
  title: string;
}

export interface IInfoCalloutState {
  isCalloutVisible: boolean;
}

export class InfoCallout extends React.Component<
  IInfoCalloutProps,
  IInfoCalloutState
> {
  public constructor(props: IInfoCalloutProps) {
    super(props);
    this.state = {
      isCalloutVisible: false
    };
  }
  public render(): React.ReactNode {
    const classNames = infoCalloutStyles();
    return (
      <span>
        <IconButton
          id={this.props.iconId}
          iconProps={{ iconName: "Info" }}
          title={this.props.title}
          onClick={this.onIconClick}
          styles={{
            root: {
              color: "rgb(0, 120, 212)",
              height: "24px",
              marginBottom: -3,
              marginTop: -3
            }
          }}
        />
        {this.state.isCalloutVisible && (
          <Callout
            target={"#" + this.props.iconId}
            setInitialFocus
            onDismiss={this.onDismiss}
            role="alertdialog"
          >
            <div className={classNames.calloutInfo}>
              <span>{this.props.infoText}</span>
            </div>
          </Callout>
        )}
      </span>
    );
  }

  private onIconClick = (): void => {
    this.setState({ isCalloutVisible: !this.state.isCalloutVisible });
  };

  private onDismiss = (): void => {
    this.setState({ isCalloutVisible: false });
  };
}
