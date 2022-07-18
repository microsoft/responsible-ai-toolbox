// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyleFunctionOrObject,
  ITextFieldStyleProps,
  ITextFieldStyles,
  TextField
} from "@fluentui/react";
import React from "react";

export interface IWhatIfPanelTextFieldProps {
  disabled: boolean;
  errorMessage?: string;
  id: string;
  isString: boolean;
  key: string | number;
  label: string;
  styles?: IStyleFunctionOrObject<ITextFieldStyleProps, ITextFieldStyles>;
  value: string;
  onChange: (
    key: string | number,
    isString: boolean,
    newValue?: string
  ) => void;
}

export class WhatIfPanelTextField extends React.Component<IWhatIfPanelTextFieldProps> {
  public render(): React.ReactNode {
    return (
      <TextField
        disabled={this.props.disabled}
        errorMessage={this.props.errorMessage}
        id={this.props.id}
        key={this.props.key}
        label={this.props.label}
        styles={this.props.styles}
        value={this.props.value}
        onChange={this.onChange}
      />
    );
  }

  private onChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    this.props.onChange(this.props.key, this.props.isString, newValue);
  };
}
