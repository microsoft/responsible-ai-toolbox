// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Link } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

export interface ICounterfactualListSetValueProps {
  index: number;
  onSelect(idx: number): void;
}

export class CounterfactualListSetValue extends React.Component<ICounterfactualListSetValueProps> {
  public render(): React.ReactNode {
    return (
      <Link onClick={this.onSelect}>
        {localization.Counterfactuals.WhatIf.setValue}
      </Link>
    );
  }

  private onSelect = (): void => {
    this.props.onSelect(this.props.index);
  };
}
