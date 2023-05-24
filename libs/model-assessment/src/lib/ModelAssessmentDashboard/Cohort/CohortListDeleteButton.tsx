// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton } from "@fluentui/react";
import React from "react";

export interface ICohortListDeleteButtonProps {
  disabled: boolean;
  itemKey: number;
  onDeleteCohortClick: (index: number) => void;
}

export class CohortListDeleteButton extends React.Component<ICohortListDeleteButtonProps> {
  public render(): React.ReactNode {
    return (
      <IconButton
        iconProps={{ iconName: "Trash" }}
        disabled={this.props.disabled}
        onClick={this.onDeleteCohortClick}
      />
    );
  }

  private onDeleteCohortClick = (): void => {
    this.props.onDeleteCohortClick(this.props.itemKey);
  };
}
