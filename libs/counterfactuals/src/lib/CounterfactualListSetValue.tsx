// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Link } from "@fluentui/react";
import {
  ITelemetryEvent,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface ICounterfactualListSetValueProps {
  index: number;
  telemetryHook?: (message: ITelemetryEvent) => void;
  onSelect(idx: number): void;
}

export class CounterfactualListSetValue extends React.Component<ICounterfactualListSetValueProps> {
  public render(): React.ReactNode {
    const theme = getTheme();
    return (
      <Link
        onClick={this.onSelect}
        styles={{
          root: {
            color: theme.palette.themeDark
          }
        }}
      >
        {localization.Counterfactuals.WhatIf.setValue}
      </Link>
    );
  }

  private onSelect = (): void => {
    this.props.onSelect(this.props.index);
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.CounterfactualListSetValueClick
    });
  };
}
