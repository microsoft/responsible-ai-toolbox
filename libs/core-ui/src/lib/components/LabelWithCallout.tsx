// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Callout as FabricCallout,
  CommandBarButton,
  IconButton,
  Text,
  DirectionalHint
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";
import { v4 } from "uuid";

import { FluentUIStyles } from "../util/FluentUIStyles";
import { ITelemetryEvent, TelemetryLevels } from "../util/ITelemetryEvent";
import { TelemetryEventName } from "../util/TelemetryEventName";

import { labelWithCalloutStyles } from "./LabelWithCallout.styles";

export interface ILabelWithCalloutProps {
  label: string;
  calloutTitle: string | undefined;
  calloutEventName?: TelemetryEventName;
  renderOnNewLayer?: boolean;
  type?: "label" | "button";
  telemetryHook?: (message: ITelemetryEvent) => void;
  iconButtonId?: string;
  calloutTarget?: string;
  directionalHint?: DirectionalHint;
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
    const iconButtonId = this.props.iconButtonId
      ? this.props.iconButtonId
      : "label-callout-info";
    const calloutTarget = this.props.calloutTarget
      ? this.props.calloutTarget
      : `#${id}`;
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
              id={iconButtonId}
              iconProps={{ iconName: "Info" }}
              title={localization.Interpret.calloutTitle}
              onClick={this.toggleCallout}
            />
          </>
        )}
        {this.state.showCallout && (
          <FabricCallout
            doNotLayer={!this.props.renderOnNewLayer}
            target={calloutTarget}
            setInitialFocus
            onDismiss={this.toggleCallout}
            role="alertdialog"
            directionalHint={this.props.directionalHint}
            styles={{ container: FluentUIStyles.calloutContainer }}
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
    if (!this.state.showCallout) {
      this.props.telemetryHook?.({
        level: TelemetryLevels.ButtonClick,
        type: this.props.calloutEventName
      });
    }
    this.setState({ showCallout: !this.state.showCallout });
  };
}
