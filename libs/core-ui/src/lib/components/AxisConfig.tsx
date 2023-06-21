// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DefaultButton } from "@fluentui/react";
import React from "react";

import { ISelectorConfig } from "../util/IGenericChartProps";
import { ColumnCategories } from "../util/JointDatasetUtils";

import { AxisConfigDialog } from "./AxisConfigDialog";

export interface IAxisConfigProps {
  buttonText: string;
  buttonTitle: string;
  orderedGroupTitles: ColumnCategories[];
  selectedColumn: ISelectorConfig;
  canBin: boolean;
  mustBin: boolean;
  canDither: boolean;
  allowTreatAsCategorical: boolean;
  hideDroppedFeatures?: boolean;
  allowLogarithmicScaling?: boolean;
  disabled?: boolean;
  removeCount?: boolean;
  onAccept: (newConfig: ISelectorConfig) => void;
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
          disabled={this.props.disabled}
        />
        {this.state.dialogOpen && (
          <AxisConfigDialog
            onCancel={this.setClose}
            orderedGroupTitles={this.props.orderedGroupTitles}
            selectedColumn={this.props.selectedColumn}
            canBin={this.props.canBin}
            mustBin={this.props.mustBin}
            removeCount={this.props.removeCount}
            allowTreatAsCategorical={this.props.allowTreatAsCategorical}
            allowLogarithmicScaling={this.props.allowLogarithmicScaling}
            canDither={this.props.canDither}
            hideDroppedFeatures={this.props.hideDroppedFeatures}
            onAccept={this.onAccept}
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
