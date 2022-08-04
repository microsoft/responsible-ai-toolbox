// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Checkbox, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { ISelectorConfig } from "../util/IGenericChartProps";
import { JointDataset } from "../util/JointDataset";

import { AxisConfigDialogSpinButton } from "./AxisConfigDialogSpinButton";
import {
  allowUserInteract,
  getBinCountForProperty,
  getMaxValue,
  getMinValue
} from "./AxisConfigDialogUtils";

export interface IAxisConfigBinOptionsProps {
  canBin: boolean;
  canDither: boolean;
  defaultBinCount: number;
  jointDataset: JointDataset;
  maxHistCols: number;
  minHistCols: number;
  mustBin: boolean;
  selectedBinCount?: number;
  selectedColumn: ISelectorConfig;
  onBinCountUpdated: (binCount?: number) => void;
  onSelectedColumnUpdated: (selectedColumn: ISelectorConfig) => void;
}

export class AxisConfigBinOptions extends React.PureComponent<IAxisConfigBinOptionsProps> {
  public render(): React.ReactNode {
    const selectedMeta =
      this.props.jointDataset.metaDict[this.props.selectedColumn.property];
    const minVal = getMinValue(selectedMeta);
    const maxVal = getMaxValue(selectedMeta);
    return selectedMeta?.treatAsCategorical ? (
      <>
        <Text variant={"small"}>
          {`${localization.formatString(
            localization.Interpret.Filters.uniqueValues,
            selectedMeta.sortedCategoricalValues?.length
          )}`}
        </Text>
        {this.props.canDither && (
          <Checkbox
            key={this.props.selectedColumn.property}
            label={localization.Interpret.AxisConfigDialog.ditherLabel}
            checked={this.props.selectedColumn.options.dither}
            onChange={this.ditherChecked}
          />
        )}
      </>
    ) : (
      <>
        <Text variant={"small"} nowrap block>
          {localization.formatString(
            localization.Interpret.Filters.min,
            minVal
          )}
        </Text>
        <Text variant={"small"} nowrap block>
          {localization.formatString(
            localization.Interpret.Filters.max,
            maxVal
          )}
        </Text>
        {this.props.canBin && !this.props.mustBin && (
          <Checkbox
            key={this.props.selectedColumn.property}
            label={localization.Interpret.AxisConfigDialog.binLabel}
            checked={this.props.selectedColumn.options.bin}
            onChange={this.shouldBinClicked}
          />
        )}
        {(this.props.mustBin || this.props.selectedColumn.options.bin) &&
          this.props.selectedBinCount !== undefined && (
            <AxisConfigDialogSpinButton
              label={localization.Interpret.AxisConfigDialog.numOfBins}
              max={this.props.maxHistCols}
              min={this.props.minHistCols}
              setNumericValue={this.setNumericValue}
              value={this.props.selectedBinCount.toString()}
            />
          )}
        {!(this.props.mustBin || this.props.selectedColumn.options.bin) &&
          this.props.canDither &&
          allowUserInteract(this.props.selectedColumn.property) && (
            <Checkbox
              key={this.props.selectedColumn.property}
              label={localization.Interpret.AxisConfigDialog.ditherLabel}
              checked={this.props.selectedColumn.options.dither}
              onChange={this.ditherChecked}
            />
          )}
      </>
    );
  }

  private readonly shouldBinClicked = (
    _ev?: React.FormEvent<HTMLElement>,
    checked?: boolean
  ): void => {
    if (checked === undefined) {
      return;
    }
    const property = this.props.selectedColumn.property;
    if (checked === false) {
      this.props.onBinCountUpdated(undefined);
      this.props.onSelectedColumnUpdated({
        options: {
          bin: checked
        },
        property
      });
    } else {
      const binCount = getBinCountForProperty(
        this.props.jointDataset.metaDict[property],
        this.props.canBin,
        this.props.defaultBinCount
      );
      this.props.onBinCountUpdated(binCount);
      this.props.onSelectedColumnUpdated({
        options: {
          bin: checked
        },
        property
      });
    }
  };

  private readonly ditherChecked = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ): void => {
    this.props.onSelectedColumnUpdated({
      options: {
        dither: checked
      },
      property: this.props.selectedColumn.property
    });
  };

  private readonly setNumericValue = (
    delta: number,
    stringVal: string
  ): string | void => {
    if (delta === 0) {
      const number = +stringVal;
      if (
        !Number.isInteger(number) ||
        number > this.props.maxHistCols ||
        number < this.props.minHistCols
      ) {
        return this.props.selectedBinCount?.toString();
      }
      this.props.onBinCountUpdated(number);
    } else {
      const prevVal = this.props.selectedBinCount as number;
      const newVal = prevVal + delta;
      if (newVal > this.props.maxHistCols || newVal < this.props.minHistCols) {
        return prevVal.toString();
      }
      this.props.onBinCountUpdated(newVal);
    }
  };
}
