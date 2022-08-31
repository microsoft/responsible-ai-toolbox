// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Text } from "@fluentui/react";
import React from "react";

import { interactiveLegendStyles } from "./InteractiveLegend.styles";

interface IInteractiveLegendProps {
  activated: boolean;
  index: number;
  name: string;
  colorBoxClassName?: string;
  onClick?: (index: number) => void;
}

export class InteractiveLegendClickButton extends React.PureComponent<IInteractiveLegendProps> {
  private readonly classes = interactiveLegendStyles(this.props.activated);

  public render(): React.ReactNode {
    return (
      <div
        className={this.classes.clickTarget}
        onClick={this.onClick}
        onKeyUp={undefined}
        role="checkbox"
        aria-checked={this.props.activated}
        tabIndex={this.props.index}
      >
        <div
          className={
            this.props.colorBoxClassName || this.classes.circleColorBox
          }
        />
        <Text nowrap variant={"medium"} className={this.classes.label}>
          {this.props.name}
        </Text>
      </div>
    );
  }

  private onClick = (): void => {
    this.props.onClick?.(this.props.index);
  };
}
