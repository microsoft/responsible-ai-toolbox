// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton } from "@fluentui/react";
import React from "react";

import { interactiveLegendStyles } from "./InteractiveLegend.styles";

interface IInteractiveLegendProps {
  index: number;
  onDelete?: (index: number) => void;
  onEdit?: (index: number) => void;
}

export class InteractiveLegendEditAndDeleteButton extends React.PureComponent<IInteractiveLegendProps> {
  private readonly classes = interactiveLegendStyles();

  public render(): React.ReactNode {
    return (
      <div>
        {this.props.onEdit !== undefined && (
          <IconButton
            className={this.classes.editButton}
            iconProps={{ iconName: "Edit", style: { fontSize: "10px" } }}
            onClick={this.onEdit}
          />
        )}
        {this.props.onDelete !== undefined && (
          <IconButton
            className={this.classes.deleteButton}
            iconProps={{ iconName: "Clear", style: { fontSize: "10px" } }}
            onClick={this.onDelete}
          />
        )}
      </div>
    );
  }

  private onEdit = (): void => {
    this.props.onEdit?.(this.props.index);
  };

  private onDelete = (): void => {
    this.props.onDelete?.(this.props.index);
  };
}
