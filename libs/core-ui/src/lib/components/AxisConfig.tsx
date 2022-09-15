// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DefaultButton } from "@fluentui/react";
import React from "react";

import { ISelectorConfig } from "../util/IGenericChartProps";
import { ITelemetryEvent } from "../util/ITelemetryEvent";
import { JointDataset } from "../util/JointDataset";
import { ColumnCategories } from "../util/JointDatasetUtils";

import { AxisConfigDialog } from "./AxisConfigDialog";

export interface IAxisConfigProps {
  buttonText: string;
  buttonTitle: string;
  jointDataset: JointDataset;
  orderedGroupTitles: ColumnCategories[];
  selectedColumn: ISelectorConfig;
  canBin: boolean;
  mustBin: boolean;
  canDither: boolean;
  onAccept: (newConfig: ISelectorConfig) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export interface IAxisConfigState {
  dialogOpen: boolean;
}

export class AxisConfig extends React.PureComponent<
  IAxisConfigProps,
  IAxisConfigState
> {
  public constructor(props: IAxisConfigProps) {
    super(props);
    this.state = {
      dialogOpen: false
    };
  }
  public render(): React.ReactNode {
    return (
      <>
        <DefaultButton
          onClick={this.setOpen}
          text={this.props.buttonText}
          title={this.props.buttonTitle}
        />
        {this.state.dialogOpen && (
          <AxisConfigDialog
            onCancel={this.setClose}
            jointDataset={this.props.jointDataset}
            orderedGroupTitles={this.props.orderedGroupTitles}
            selectedColumn={this.props.selectedColumn}
            canBin={this.props.canBin}
            mustBin={this.props.mustBin}
            canDither={this.props.canDither}
            onAccept={this.onAccept}
            telemetryHook={this.props.telemetryHook}
          />
        )}
      </>
    );
  }

  private readonly onAccept = (newConfig: ISelectorConfig): void => {
    this.setState({ dialogOpen: false });
    this.props.onAccept(newConfig);
  };

  private readonly setOpen = (): void => {
    this.setState({ dialogOpen: true });
  };

  private readonly setClose = (): void => {
    this.setState({ dialogOpen: false });
  };
}
