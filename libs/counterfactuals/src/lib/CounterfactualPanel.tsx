// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Panel, PanelType } from "office-ui-fabric-react";
import React from "react";

export interface ICounterfactualPanelProps {
  isPanelOpen: boolean;
  closePanel(): void;
}

export class CounterfactualPanel extends React.Component<
  ICounterfactualPanelProps
> {
  public render(): React.ReactNode {
    return (
      <Panel
        isOpen={this.props.isPanelOpen}
        type={PanelType.medium}
        onDismiss={this.props.closePanel}
        closeButtonAriaLabel="Close"
        headerText="Sample panel"
      >
        <div>{"Test"}</div>
      </Panel>
    );
  }
}
