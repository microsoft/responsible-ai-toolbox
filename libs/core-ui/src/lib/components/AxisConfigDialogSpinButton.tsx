// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  SpinButton,
  Position,
  IStyleFunctionOrObject,
  ISpinButtonStyleProps,
  ISpinButtonStyles
} from "@fluentui/react";
import React from "react";

export interface IAxisConfigSpinButtonProps {
  label: string;
  min?: number;
  max?: number;
  styles?: IStyleFunctionOrObject<ISpinButtonStyleProps, ISpinButtonStyles>;
  value?: string;
  setNumericValue: (delta: number, stringVal: string) => string | void;
}

export const SpinButtonStyles = {
  labelWrapper: { alignSelf: "center" },
  root: {
    display: "inline-flex",
    float: "right",
    selectors: {
      "> div": {
        maxWidth: "78px"
      }
    }
  },
  spinButtonWrapper: { maxWidth: "68px" }
};

export class AxisConfigDialogSpinButton extends React.PureComponent<IAxisConfigSpinButtonProps> {
  public render(): React.ReactNode {
    return (
      <SpinButton
        labelPosition={Position.top}
        label={this.props.label}
        min={this.props.min}
        max={this.props.max}
        styles={this.props.styles}
        value={this.props.value}
        onIncrement={this.onIncrement}
        onDecrement={this.onDecrement}
        onValidate={this.onValidate}
      />
    );
  }

  private onIncrement = (value: string): void => {
    this.props.setNumericValue(1, value);
  };

  private onDecrement = (value: string): void => {
    this.props.setNumericValue(-1, value);
  };

  private onValidate = (value: string): void => {
    this.props.setNumericValue(0, value);
  };
}
