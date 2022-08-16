// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  IDropdownOption,
  TextField
} from "@fluentui/react";
import { FluentUIStyles } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  ICategoricalRange,
  IModelMetadata,
  INumericRange,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import _, { toNumber } from "lodash";
import React from "react";

import { binningControlStyles } from "./BinningControl.styles";

export interface IBinningProps {
  modelMetadata: IModelMetadata;
  featureOptions: IDropdownOption[];
  selectedFeatureIndex: number;
  defaultSteps?: number;
  onError?: () => string;
  onChange: (value: IBinnedResponse) => void;
}

export interface IBinningState {
  featureIndex: number;
  type: RangeTypes;
  min?: string;
  minErrorMessage?: string;
  max?: string;
  maxErrorMessage?: string;
  steps?: string;
  stepsErrorMessage?: string;
  selectedOptionKeys?: string[];
  categoricalOptions?: IComboBoxOption[];
}

export interface IBinnedResponse {
  hasError: boolean;
  array: Array<number | string>;
  featureIndex: number;
  rangeType?: RangeTypes;
}

export class BinningControl extends React.PureComponent<
  IBinningProps,
  IBinningState
> {
  public componentDidMount(): void {
    if (!this.state) {
      this.setState(
        this.buildRangeView(this.props.selectedFeatureIndex),
        () => {
          this.pushChange();
        }
      );
    }
  }

  public render(): React.ReactNode {
    return (
      <div className={binningControlStyles.featurePicker}>
        <div>
          <ComboBox
            options={this.props.featureOptions}
            onChange={this.onFeatureSelected}
            label={localization.Interpret.IcePlot.featurePickerLabel}
            ariaLabel="feature picker"
            selectedKey={this.state ? this.state.featureIndex : undefined}
            useComboBoxAsMenuWidth
            styles={FluentUIStyles.defaultDropdownStyle}
          />
        </div>
        {!!this.state && (
          <div className={binningControlStyles.rangeView}>
            {this.state.type === RangeTypes.Categorical && (
              <ComboBox
                multiSelect
                selectedKey={this.state.selectedOptionKeys}
                allowFreeform
                autoComplete="on"
                options={this.state.categoricalOptions || []}
                onChange={this.onCategoricalRangeChanged}
                styles={FluentUIStyles.defaultDropdownStyle}
              />
            )}
            {this.state.type !== RangeTypes.Categorical && (
              <div className={binningControlStyles.featurePicker}>
                <TextField
                  label={localization.Interpret.IcePlot.minimumInputLabel}
                  styles={FluentUIStyles.textFieldStyle}
                  value={this.state.min}
                  onChange={this.onMinRangeChanged}
                  errorMessage={this.state.minErrorMessage}
                />
                <TextField
                  label={localization.Interpret.IcePlot.maximumInputLabel}
                  styles={FluentUIStyles.textFieldStyle}
                  value={this.state.max}
                  onChange={this.onMaxRangeChanged}
                  errorMessage={this.state.maxErrorMessage}
                />
                <TextField
                  label={localization.Interpret.IcePlot.stepInputLabel}
                  styles={FluentUIStyles.textFieldStyle}
                  value={this.state.steps}
                  onChange={this.onStepsRangeChanged}
                  errorMessage={this.state.stepsErrorMessage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  private onFeatureSelected = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "number") {
      this.setState(this.buildRangeView(item.key), () => {
        this.pushChange();
      });
    }
  };

  private onMinRangeChanged = (
    _ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    const val = toNumber(newValue);
    const rangeView = _.cloneDeep(this.state) as IBinningState;
    rangeView.min = newValue;
    if (
      Number.isNaN(val) ||
      (this.state.type === RangeTypes.Integer && !Number.isInteger(val))
    ) {
      rangeView.minErrorMessage =
        this.state.type === RangeTypes.Integer
          ? localization.Interpret.IcePlot.integerError
          : localization.Interpret.IcePlot.numericError;
      this.setState(rangeView);
    } else {
      rangeView.minErrorMessage = undefined;
      this.setState(rangeView, () => {
        this.pushChange();
      });
    }
  };

  private onMaxRangeChanged = (
    _ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    const val = toNumber(newValue);
    const rangeView = _.cloneDeep(this.state) as IBinningState;
    rangeView.max = newValue;
    if (
      Number.isNaN(val) ||
      (this.state.type === RangeTypes.Integer && !Number.isInteger(val))
    ) {
      rangeView.maxErrorMessage =
        this.state.type === RangeTypes.Integer
          ? localization.Interpret.IcePlot.integerError
          : localization.Interpret.IcePlot.numericError;
      this.setState(rangeView);
    } else {
      rangeView.maxErrorMessage = undefined;
      this.setState(rangeView, () => {
        this.pushChange();
      });
    }
  };

  private onStepsRangeChanged = (
    _ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    const val = toNumber(newValue);
    const rangeView = _.cloneDeep(this.state) as IBinningState;
    rangeView.steps = newValue;
    if (!Number.isInteger(val)) {
      rangeView.stepsErrorMessage = localization.Interpret.IcePlot.integerError;
      this.setState(rangeView);
    } else {
      rangeView.stepsErrorMessage = undefined;
      this.setState(rangeView, () => {
        this.pushChange();
      });
    }
  };

  private onCategoricalRangeChanged = (
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    _index?: number,
    value?: string
  ): void => {
    const rangeView = _.cloneDeep(this.state) as IBinningState;
    const currentSelectedKeys = rangeView.selectedOptionKeys || [];
    if (option) {
      // User selected/de-selected an existing option
      rangeView.selectedOptionKeys = this.updateSelectedOptionKeys(
        currentSelectedKeys,
        option
      );
    } else if (value !== undefined) {
      // User typed a freeform option
      const newOption: IComboBoxOption = { key: value, text: value };
      rangeView.selectedOptionKeys = [
        ...currentSelectedKeys,
        newOption.key as string
      ];
      if (rangeView.categoricalOptions) {
        rangeView.categoricalOptions.push(newOption);
      }
    }
    this.setState(rangeView, () => {
      this.pushChange();
    });
  };

  private updateSelectedOptionKeys = (
    selectedKeys: string[],
    option: IComboBoxOption
  ): string[] => {
    selectedKeys = [...selectedKeys]; // modify a copy
    const index = selectedKeys.indexOf(option.key as string);
    if (option.selected && index < 0) {
      selectedKeys.push(option.key as string);
    } else {
      selectedKeys.splice(index, 1);
    }
    return selectedKeys;
  };

  private buildRangeView(featureIndex: number): IBinningState {
    if (this.props.modelMetadata.featureIsCategorical?.[featureIndex]) {
      const summary = this.props.modelMetadata.featureRanges[
        featureIndex
      ] as ICategoricalRange;
      return {
        categoricalOptions: summary.uniqueValues.map((text) => {
          return { key: text, text };
        }),
        featureIndex,
        selectedOptionKeys: summary.uniqueValues,
        type: RangeTypes.Categorical
      };
    }
    const summary = this.props.modelMetadata.featureRanges[
      featureIndex
    ] as INumericRange;
    return {
      featureIndex,
      max: summary.max.toString(),
      min: summary.min.toString(),
      steps:
        this.props.defaultSteps !== undefined
          ? this.props.defaultSteps.toString()
          : "20",
      type: summary.rangeType
    };
  }

  private pushChange(): void {
    if (
      this.state === undefined ||
      this.state.minErrorMessage !== undefined ||
      this.state.maxErrorMessage !== undefined ||
      this.state.stepsErrorMessage !== undefined
    ) {
      this.props.onChange({
        array: [],
        featureIndex: this.state.featureIndex,
        hasError: true,
        rangeType: undefined
      });
    }
    const min = toNumber(this.state.min);
    const max = toNumber(this.state.max);
    const steps = toNumber(this.state.steps);

    if (
      this.state.type === RangeTypes.Categorical &&
      Array.isArray(this.state.selectedOptionKeys)
    ) {
      this.props.onChange({
        array: this.state.selectedOptionKeys,
        featureIndex: this.state.featureIndex,
        hasError: false,
        rangeType: RangeTypes.Categorical
      });
    } else if (
      !Number.isNaN(min) &&
      !Number.isNaN(max) &&
      Number.isInteger(steps)
    ) {
      const delta = steps > 0 ? (max - min) / steps : max - min;
      const array = _.uniq(
        Array.from({ length: steps }, (_, i) =>
          this.state.type === RangeTypes.Integer
            ? Math.round(min + i * delta)
            : min + i * delta
        )
      );
      this.props.onChange({
        array,
        featureIndex: this.state.featureIndex,
        hasError: false,
        rangeType: this.state.type
      });
    } else {
      this.props.onChange({
        array: [],
        featureIndex: this.state.featureIndex,
        hasError: true,
        rangeType: undefined
      });
    }
  }
}
