// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComboBox, IComboBox, IComboBoxOption } from "@fluentui/react";
import React from "react";

export interface IWhatIfPanelComboBoxProps {
  allowFreeform?: boolean;
  autoComplete?: "on" | "off";
  disabled: boolean;
  id: string;
  key: string | number;
  label: string;
  options: IComboBoxOption[];
  selectedKey?: string | number | string[] | number[];
  onChange: (
    key: string | number,
    option?: IComboBoxOption,
    value?: string
  ) => void;
}

export class WhatIfPanelComboBox extends React.Component<IWhatIfPanelComboBoxProps> {
  public render(): React.ReactNode {
    return (
      <ComboBox
        key={this.props.key}
        label={this.props.label}
        autoComplete={"on"}
        allowFreeform
        selectedKey={this.props.selectedKey}
        options={this.props.options}
        onChange={this.onChange}
        disabled={this.props.disabled}
        id={this.props.id}
      />
    );
  }

  private onChange = (
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption | undefined,
    _index?: number | undefined,
    value?: string
  ): void => {
    this.props.onChange(this.props.key, option, value);
  };
}
