// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SpinButton, Position } from "@fluentui/react";
import { IJointMeta } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

export interface IAxisConfigSpinButtonProps {
  binCountValue?: string;
  min: number;
  max: number;
  selectedMeta: IJointMeta;
  setNumericValue: (
    delta: number,
    _column: IJointMeta,
    stringVal: string
  ) => string | void;
}

export class AxisConfigDialogSpinButton extends React.PureComponent<IAxisConfigSpinButtonProps> {
  public render(): React.ReactNode {
    return (
      <SpinButton
        labelPosition={Position.top}
        label={localization.Interpret.AxisConfigDialog.numOfBins}
        min={this.props.min}
        max={this.props.max}
        value={this.props.binCountValue}
        onIncrement={this.onIncrement}
        onDecrement={this.onDecrement}
        onValidate={this.onValidate}
      />
    );
  }

  private onIncrement = (value: string) => {
    this.props.setNumericValue(1, this.props.selectedMeta, value);
  };

  private onDecrement = (value: string) => {
    this.props.setNumericValue(-1, this.props.selectedMeta, value);
  };

  private onValidate = (value: string) => {
    this.props.setNumericValue(0, this.props.selectedMeta, value);
  };
}
