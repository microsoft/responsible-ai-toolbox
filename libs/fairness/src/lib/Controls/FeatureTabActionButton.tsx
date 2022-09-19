// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionButton } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface IFeatureTabActionButton {
  index: number;
  onClick: (index: number) => void;
}

export class FeatureTabActionButton extends React.PureComponent<IFeatureTabActionButton> {
  public render(): React.ReactNode {
    return (
      <ActionButton iconProps={{ iconName: "Edit" }} onClick={this.onClick}>
        {localization.Fairness.Feature.editBinning}
      </ActionButton>
    );
  }

  private onClick = (): void => {
    this.props.onClick(this.props.index);
  };
}
