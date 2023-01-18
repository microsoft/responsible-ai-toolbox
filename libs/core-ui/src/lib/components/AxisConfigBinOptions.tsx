// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text, Toggle } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { RangeTypes } from "@responsible-ai/mlchartlib";
import React from "react";

import { AxisTypes, ISelectorConfig } from "../util/IGenericChartProps";
import { JointDataset } from "../util/JointDataset";
import { IJointMeta } from "../util/JointDatasetUtils";

import { axisConfigBinOptionsStyles } from "./AxisConfigBinOptions.styles";
import { AxisConfigDialogSpinButton } from "./AxisConfigDialogSpinButton";
import {
  allowUserInteract,
  getBinCountForProperty,
  metaDescription
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
  allowTreatAsCategorical: boolean;
  allowLogarithmicScaling?: boolean;
  selectedColumn: ISelectorConfig;
  onBinCountUpdated: (binCount?: number) => void;
  onEnableLogarithmicScaling: (checked?: boolean | undefined) => void;
  onSelectedColumnUpdated: (selectedColumn: ISelectorConfig) => void;
  onSetAsCategorical: (checked?: boolean | undefined) => void;
}

export class AxisConfigBinOptions extends React.PureComponent<IAxisConfigBinOptionsProps> {
  public render(): React.ReactNode {
    const selectedMeta =
      this.props.jointDataset.metaDict[this.props.selectedColumn.property];
    const selectedColumnDesc = metaDescription(selectedMeta);
    const styles = axisConfigBinOptionsStyles();
    return (
      <Stack>
        {selectedMeta.treatAsCategorical ? (
          <Stack.Item className={styles.hideMinMax}>&nbsp;</Stack.Item>
        ) : (
          <Stack.Item className={styles.minMax}>
            <Text variant="small" nowrap block>
              {selectedColumnDesc.minDescription}
            </Text>
            <Text variant="small" nowrap block>
              {selectedColumnDesc.maxDescription}
            </Text>
          </Stack.Item>
        )}
        {this.displayLogarithmicToggle(selectedMeta) && (
          <Toggle
            key="logarithmic-toggle"
            label={localization.Interpret.AxisConfigDialog.logarithmicScaling}
            inlineLabel
            checked={selectedMeta.AxisType === AxisTypes.Logarithmic}
            onChange={this.enableLogarithmicScaling}
          />
        )}
        {this.displayCategoricalToggle(selectedMeta) && (
          <Toggle
            key="categorical-toggle"
            label={localization.Interpret.AxisConfigDialog.TreatAsCategorical}
            inlineLabel
            checked={selectedMeta.treatAsCategorical}
            onChange={this.setAsCategorical}
          />
        )}
        {selectedMeta?.treatAsCategorical ? (
          <>
            <Text variant="small">
              {selectedColumnDesc.categoricalDescription}
            </Text>
            {this.props.canDither && this.getDitherToggle()}
          </>
        ) : (
          <>
            {this.props.canBin && !this.props.mustBin && (
              <Toggle
                key="bin-toggle"
                label={localization.Interpret.AxisConfigDialog.binLabel}
                inlineLabel
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
              allowUserInteract(this.props.selectedColumn.property) &&
              this.getDitherToggle()}
          </>
        )}
      </Stack>
    );
  }

  private getDitherToggle = (): JSX.Element => {
    return (
      <Toggle
        key="dither-toggle"
        label={localization.Interpret.AxisConfigDialog.ditherLabel}
        inlineLabel
        checked={this.props.selectedColumn.options.dither}
        onChange={this.ditherChecked}
      />
    );
  };

  private displayLogarithmicToggle = (selectedMeta: IJointMeta): boolean => {
    const allowLogarithmicScaling = this.props.allowLogarithmicScaling ?? true;
    return (
      (selectedMeta.featureRange?.rangeType === RangeTypes.Integer ||
        selectedMeta.featureRange?.rangeType === RangeTypes.Numeric) &&
      allowLogarithmicScaling &&
      allowUserInteract(this.props.selectedColumn.property)
    );
  };

  private displayCategoricalToggle = (selectedMeta: IJointMeta): boolean => {
    return (
      selectedMeta.featureRange?.rangeType === RangeTypes.Integer &&
      this.props.allowTreatAsCategorical &&
      allowUserInteract(this.props.selectedColumn.property)
    );
  };

  private readonly setAsCategorical = (
    _ev?: React.FormEvent<HTMLElement>,
    checked?: boolean
  ): void => {
    this.props.onSetAsCategorical(checked);
    this.forceUpdate();
  };

  private readonly enableLogarithmicScaling = (
    _ev?: React.FormEvent<HTMLElement>,
    checked?: boolean
  ): void => {
    this.props.onEnableLogarithmicScaling(checked);
  };

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
        property,
        type: this.props.jointDataset.metaDict[property]?.AxisType
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
        property,
        type: this.props.jointDataset.metaDict[property]?.AxisType
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
      property: this.props.selectedColumn.property,
      type: this.props.jointDataset.metaDict[this.props.selectedColumn.property]
        ?.AxisType
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
