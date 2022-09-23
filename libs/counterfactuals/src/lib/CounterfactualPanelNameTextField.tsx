// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TextField } from "@fluentui/react";
import { WhatIfConstants } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { counterfactualPanelStyles } from "./CounterfactualPanel.styles";

export interface ICounterfactualPanelNameTextFieldProps {
  value?: string;
  setCustomRowProperty(
    key: string | number,
    isString: boolean,
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined
  ): void;
}

export class CounterfactualPanelNameTextField extends React.Component<ICounterfactualPanelNameTextFieldProps> {
  public render(): React.ReactNode {
    const classes = counterfactualPanelStyles();
    return (
      <TextField
        id="whatIfNameLabel"
        label={localization.Counterfactuals.counterfactualName}
        value={this.props.value}
        onChange={this.setCustomRowProperty}
        className={classes.counterfactualName}
      />
    );
  }

  private setCustomRowProperty = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    this.props.setCustomRowProperty(
      WhatIfConstants.namePath,
      true,
      event,
      newValue
    );
  };
}
