// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { RangeTypes } from "@responsible-ai/mlchartlib";
import { toNumber } from "lodash";
import {
  TextField,
  ComboBox,
  IComboBox,
  IComboBoxOption
} from "office-ui-fabric-react";
import React from "react";

import { FabricStyles } from "../FabricStyles";

import { featureEditingTileStyles } from "./FeatureEditingTile.styles";

export interface IFeatureEditingTileProps {
  onEdit: (index: number, val: string | number, error?: string) => void;
  defaultValue: string | number;
  featureName: string;
  index: number;
  enumeratedValues: string[] | undefined;
  rangeType: RangeTypes;
}

export interface IFeatureEditingTileState {
  value?: string;
  errorMessage?: string;
}

export class FeatureEditingTile extends React.Component<
  IFeatureEditingTileProps,
  IFeatureEditingTileState
> {
  private options =
    this.props.enumeratedValues !== undefined
      ? this.props.enumeratedValues.map((value) => {
          return { key: value, text: value };
        })
      : undefined;

  public constructor(props: IFeatureEditingTileProps) {
    super(props);
    this.state = {
      value: this.props.defaultValue.toString()
    };
  }

  public componentDidUpdate(prevProps: IFeatureEditingTileProps): void {
    if (this.props.defaultValue !== prevProps.defaultValue) {
      this.setState({
        errorMessage: undefined,
        value: this.props.defaultValue.toString()
      });
    }
  }

  public render(): React.ReactNode {
    let tileClass = featureEditingTileStyles.tile;
    if (
      this.state.value !== this.props.defaultValue.toString() &&
      this.state.errorMessage === undefined
    ) {
      tileClass += " " + featureEditingTileStyles.edited;
    }
    if (this.state.errorMessage !== undefined) {
      tileClass += " " + featureEditingTileStyles.error;
    }

    return (
      <div className={tileClass}>
        <div className={featureEditingTileStyles.tileLabel}>
          {this.props.featureName}
        </div>
        {this.props.enumeratedValues === undefined && (
          <TextField
            styles={FabricStyles.textFieldStyle}
            ariaLabel={this.props.featureName}
            value={this.state.value}
            onChange={this.onValueChanged}
            errorMessage={this.state.errorMessage}
          />
        )}
        {this.props.enumeratedValues !== undefined && (
          <ComboBox
            text={this.state.value}
            allowFreeform={true}
            ariaLabel={this.props.featureName}
            autoComplete="on"
            options={this.options}
            onChange={this.onComboSelected}
            styles={FabricStyles.defaultDropdownStyle}
          />
        )}
      </div>
    );
  }

  private onValueChanged = (
    _ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    const val = toNumber(newValue);
    let errorMessage: string | undefined;
    if (
      Number.isNaN(val) ||
      (this.props.rangeType === RangeTypes.Integer && !Number.isInteger(val))
    ) {
      errorMessage =
        this.props.rangeType === RangeTypes.Integer
          ? localization.Interpret.IcePlot.integerError
          : localization.Interpret.IcePlot.numericError;
    }
    this.props.onEdit(this.props.index, val, errorMessage);
    this.setState({ errorMessage, value: newValue });
  };

  private onComboSelected = (
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption | undefined,
    _index?: number | undefined,
    value?: string | undefined
  ): void => {
    const newVal = option ? option.text : value;
    if (newVal) {
      this.props.onEdit(this.props.index, newVal);
    }
    this.setState({ value: newVal });
  };
}
