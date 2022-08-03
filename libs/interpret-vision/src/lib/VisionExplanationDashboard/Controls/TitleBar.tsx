// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text, Icon } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { titleBarStyles } from "./TitleBar.styles";
export interface ITitleBarProps {
  type: TitleBarOptions;
}

export class ITitleBarState {}

enum TitleBarOptions {
  Error,
  Success
}

export class TitleBar extends React.Component<ITitleBarProps, ITitleBarState> {
  public constructor(props: ITitleBarProps) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactNode {
    const classNames = titleBarStyles();

    return (
      <Stack
        horizontal
        tokens={{ childrenGap: "s1" }}
        horizontalAlign="center"
        verticalAlign="end"
      >
        <Stack.Item className={classNames.iconContainer}>
          <Icon
            iconName={
              this.props.type === TitleBarOptions.Error ? "Cancel" : "Checkmark"
            }
            className={
              this.props.type === TitleBarOptions.Error
                ? classNames.errorIcon
                : classNames.successIcon
            }
          />
        </Stack.Item>
        <Stack.Item>
          <Text variant="large" className={classNames.titleBarLabel}>
            {this.props.type === TitleBarOptions.Error
              ? localization.InterpretVision.Dashboard.titleBarError
              : localization.InterpretVision.Dashboard.titleBarSuccess}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Text variant="large" className={classNames.titleBarNumber}>
            {this.props.type === TitleBarOptions.Error ? "6170" : "3825"}
          </Text>
        </Stack.Item>
      </Stack>
    );
  }
}
