// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  Position,
  SpinButton,
  Text
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { INumericRange, RangeTypes } from "@responsible-ai/mlchartlib";
import React from "react";

import { FilterMethods, IFilter } from "../../Interfaces/IFilter";
import { FluentUIStyles } from "../../util/FluentUIStyles";
import { IJointMeta } from "../../util/JointDatasetUtils";

import { cohortEditorStyles } from "./CohortEditor.styles";
import { comparisonOptions } from "./CohortEditorFilterUtils";

export interface INoneCategoricalFilterOptionsProps {
  featureRange: INumericRange;
  isRemoveJointDatasetFlightOn: boolean;
  selectedMeta: IJointMeta;
  openedFilter: IFilter;
  showInvalidMinMaxValueError: boolean;
  showInvalidValueError: boolean;
  minVal: number | undefined;
  maxVal: number | undefined;
  setComparison(ev?: React.FormEvent<IComboBox>, item?: IComboBoxOption): void;
  setNumericValue(
    delta: number,
    index: number,
    stringVal: string,
    featureRange?: INumericRange
  ): string | void;
}

export class NoneCategoricalFilterOptions extends React.Component<INoneCategoricalFilterOptionsProps> {
  private comparisonOptions: IComboBoxOption[] = comparisonOptions;
  public render(): React.ReactNode {
    const {
      selectedMeta,
      openedFilter,
      setComparison,
      setNumericValue,
      minVal,
      maxVal
    } = this.props;
    let numericDelta: number;
    let featureRange: INumericRange | undefined;
    if (this.props.isRemoveJointDatasetFlightOn) {
      featureRange = this.props.featureRange;
      numericDelta =
        featureRange?.rangeType === RangeTypes.Integer
          ? 1
          : (featureRange?.max - featureRange?.min) / 10;
    } else {
      featureRange = selectedMeta.featureRange;
      numericDelta =
        selectedMeta?.treatAsCategorical ||
        selectedMeta.featureRange?.rangeType === RangeTypes.Integer ||
        !selectedMeta.featureRange
          ? 1
          : (selectedMeta.featureRange.max - selectedMeta.featureRange.min) /
            10;
    }
    const styles = cohortEditorStyles();
    return (
      <>
        <Text block nowrap variant={"small"}>
          {`${localization.formatString(
            localization.Interpret.Filters.min,
            minVal
          )} ${localization.formatString(
            localization.Interpret.Filters.max,
            maxVal
          )}`}
        </Text>
        <ComboBox
          label={localization.Interpret.Filters.numericalComparison}
          selectedKey={openedFilter.method}
          onChange={setComparison}
          options={this.comparisonOptions}
          useComboBoxAsMenuWidth
          calloutProps={FluentUIStyles.calloutProps}
        />
        {featureRange &&
          (openedFilter.method === FilterMethods.InTheRangeOf ? (
            <>
              <SpinButton
                ariaLabel={localization.Common.spinButton}
                labelPosition={Position.top}
                value={openedFilter.arg[0].toString()}
                label={localization.Interpret.Filters.minimum}
                min={featureRange.min}
                max={featureRange.max}
                onIncrement={(value): void => {
                  setNumericValue(numericDelta, 0, value, featureRange);
                }}
                onDecrement={(value): void => {
                  setNumericValue(-numericDelta, 0, value, featureRange);
                }}
                onValidate={(value): void => {
                  setNumericValue(0, 0, value, featureRange);
                }}
                incrementButtonAriaLabel={localization.Common.increaseValue}
                decrementButtonAriaLabel={localization.Common.decreaseValue}
              />
              <SpinButton
                ariaLabel={localization.Common.spinButton}
                labelPosition={Position.top}
                value={openedFilter.arg[1].toString()}
                label={localization.Interpret.Filters.maximum}
                min={featureRange.min}
                max={featureRange.max}
                onIncrement={(value): void => {
                  setNumericValue(numericDelta, 1, value, featureRange);
                }}
                onDecrement={(value): void => {
                  setNumericValue(-numericDelta, 1, value, featureRange);
                }}
                onValidate={(value): void => {
                  setNumericValue(0, 1, value, featureRange);
                }}
                incrementButtonAriaLabel={localization.Common.increaseValue}
                decrementButtonAriaLabel={localization.Common.decreaseValue}
              />
              {this.props.showInvalidMinMaxValueError && featureRange && (
                <p className={styles.invalidValueError}>
                  {localization.formatString(
                    localization.Interpret.CohortEditor
                      .minimumGreaterThanMaximum,
                    featureRange.min,
                    featureRange.max
                  )}
                </p>
              )}
            </>
          ) : (
            <SpinButton
              ariaLabel={localization.Common.spinButton}
              labelPosition={Position.top}
              label={localization.Interpret.Filters.numericValue}
              min={featureRange.min}
              max={featureRange.max}
              value={openedFilter.arg[0].toString()}
              onIncrement={(value): void => {
                setNumericValue(numericDelta, 0, value, featureRange);
              }}
              onDecrement={(value): void => {
                setNumericValue(-numericDelta, 0, value, featureRange);
              }}
              onValidate={(value): void => {
                setNumericValue(0, 0, value, featureRange);
              }}
              incrementButtonAriaLabel={localization.Common.increaseValue}
              decrementButtonAriaLabel={localization.Common.decreaseValue}
            />
          ))}
        {this.props.showInvalidValueError && featureRange && (
          <p className={styles.invalidValueError}>
            {localization.formatString(
              localization.Interpret.CohortEditor.invalidValueError,
              featureRange.min,
              featureRange.max
            )}
          </p>
        )}
      </>
    );
  }
}
