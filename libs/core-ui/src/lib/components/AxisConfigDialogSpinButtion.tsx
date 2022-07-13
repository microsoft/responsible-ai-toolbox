// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  SpinButton,
  Position,
  IStyleFunctionOrObject,
  ISpinButtonStyleProps,
  ISpinButtonStyles
} from "@fluentui/react";
import { IJointMeta } from "@responsible-ai/core-ui";
import _ from "lodash";
import React from "react";

export interface IAxisConfigSpinButtonProps {
  label: string;
  min: number;
  max: number;
  selectedMeta?: IJointMeta;
  styles?: IStyleFunctionOrObject<ISpinButtonStyleProps, ISpinButtonStyles>;
  value?: string;
  setNumericValue: (delta: number, stringVal: string) => string | void;
}

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

  private onIncrement = (value: string) => {
    this.props.setNumericValue(1, value);
  };

  private onDecrement = (value: string) => {
    this.props.setNumericValue(-1, value);
  };

  private onValidate = (value: string) => {
    this.props.setNumericValue(0, value);
  };
}
