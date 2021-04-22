// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FabricStyles } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Callout as FabricCallout,
  CommandBarButton,
  IconButton,
  Text
} from "office-ui-fabric-react";
import React from "react";
import { v4 } from "uuid";

import { labelWithCalloutStyles } from "./LabelWithCallout.styles";

export interface ILabelWithCalloutProps {
  label: string;
  calloutTitle: string | undefined;
  type?: "label" | "button";
}
interface ILabelWithCalloutState {
  showCallout: boolean;
}

export class LabelWithCallout extends React.Component<
  ILabelWithCalloutProps,
  ILabelWithCalloutState
> {
  public constructor(props: ILabelWithCalloutProps) {
    super(props);
    this.state = {
      showCallout: false
    };
  }
  public render(): React.ReactNode {
    const classNames = labelWithCalloutStyles();
    const id = `callout-${v4()}`;
    return (
      <div className={classNames.calloutContainer}>
        {this.props.type === "button" ? (
          <CommandBarButton
            iconProps={{ iconName: "Info" }}
            id={id}
            className={classNames.infoButton}
            text={this.props.label}
            onClick={this.toggleCallout}
          />
        ) : (
          <>
            <Text id={id} variant={"medium"} className={classNames.calloutText}>
              {this.props.label}
            </Text>
            <IconButton
              id={"cross-class-weight-info"}
              iconProps={{ iconName: "Info" }}
              title={localization.Interpret.calloutTitle}
              onClick={this.toggleCallout}
            />
          </>
        )}
        {this.state.showCallout && (
          <FabricCallout
            doNotLayer={true}
            target={`#${id}`}
            setInitialFocus={true}
            onDismiss={this.toggleCallout}
            role="alertdialog"
            styles={{ container: FabricStyles.calloutContainer }}
          >
            <div className={classNames.calloutWrapper}>
              <div className={classNames.calloutHeader}>
                <Text className={classNames.calloutTitle}>
                  {this.props.calloutTitle}
                </Text>
              </div>
              <div className={classNames.calloutInner}>
                {this.props.children}
              </div>
            </div>
          </FabricCallout>
        )}
      </div>
    );
  }

  private toggleCallout = (): void => {
    this.setState({ showCallout: !this.state.showCallout });
  };
}
