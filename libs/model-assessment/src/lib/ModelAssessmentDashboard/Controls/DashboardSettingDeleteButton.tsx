// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton } from "office-ui-fabric-react";
import React from "react";

export interface IDashboardSettingDeleteButtonProps {
  index: number;
  removeTab(index: number): void;
}

export class DashboardSettingDeleteButton extends React.PureComponent<
  IDashboardSettingDeleteButtonProps
> {
  public render(): React.ReactNode {
    return (
      <IconButton iconProps={{ iconName: "Delete" }} onClick={this.removeTab} />
    );
  }

  private removeTab = (): void => {
    this.props.removeTab(this.props.index);
  };
}
