// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Callout as FabricCallout,
  CommandBarButton,
  IconButton,
  Text
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
              id={"label-callout-info"}
              iconProps={{ iconName: "Info" }}
              title={localization.Interpret.calloutTitle}
              onClick={this.toggleCallout}
            />
          </>
        )}
        {this.state.showCallout && (
          <FabricCallout
            doNotLayer={!this.props.renderOnNewLayer}
            target={`#${id}`}
            setInitialFocus
            onDismiss={this.toggleCallout}
            role="alertdialog"
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
