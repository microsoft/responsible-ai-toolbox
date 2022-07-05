// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text, Panel, FocusZone, Stack } from "@fluentui/react";
import React from "react";

import { flyoutStyles } from "./Flyout.styles";
import { IListItem } from "./ImageList";

export interface IFlyoutProps {
  isOpen: boolean;
  item: IListItem | undefined;
  callback(): void | undefined;
}

export class IFlyoutState {}

export class Flyout extends React.Component<IFlyoutProps, IFlyoutState> {
  public constructor(props: IFlyoutProps) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactNode {
    const classNames = flyoutStyles();

    return (
      <FocusZone>
        <Panel
          headerText="Selected instance"
          isOpen={this.props.isOpen}
          closeButtonAriaLabel="Close"
          onDismiss={this.props.callback}
        >
          <Stack tokens={{ childrenGap: "l1" }}>
            <Stack.Item>
              <div className={classNames.line} />
            </Stack.Item>
            <Stack.Item>
              <Text>hi</Text>
            </Stack.Item>
          </Stack>
        </Panel>
      </FocusZone>
    );
  }
}
