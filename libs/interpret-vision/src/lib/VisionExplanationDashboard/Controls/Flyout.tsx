// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Image, Panel, PanelType, FocusZone, Stack } from "@fluentui/react";
import React from "react";

import { IDatasetSummary } from "../Interfaces/IExplanationDashboardProps";

import { flyoutStyles } from "./Flyout.styles";
import { IListItem } from "./ImageList";

export interface IFlyoutProps {
  data: IDatasetSummary;
  isOpen: boolean;
  item: IListItem | undefined;
  callback: () => void;
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
          isLightDismiss
          type={PanelType.custom}
          customWidth="700px"
        >
          <Stack tokens={{ childrenGap: "l1" }}>
            <Stack.Item>
              <div className={classNames.line} />
            </Stack.Item>
            <Stack.Item style={{ overflow: "hidden" }}>
              <Image
                src={`data:image/jpg;base64,${this.props.data.localExplanations[0]}`}
                width="800px"
                style={{ position: "relative", right: 85 }}
              />
            </Stack.Item>
          </Stack>
        </Panel>
      </FocusZone>
    );
  }
}
