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
import {
  IColumnRange,
  RangeTypes,
  roundDecimal
} from "@responsible-ai/mlchartlib";
import React from "react";

import { FilterMethods, IFilter } from "../../Interfaces/IFilter";
import { FluentUIStyles } from "../../util/FluentUIStyles";

import { cohortEditorStyles } from "./CohortEditor.styles";
import { comparisonOptions } from "./CohortEditorFilterUtils";

export interface INoneCategoricalFilterOptionsProps {
  columnRange?: IColumnRange;
  openedFilter: IFilter;
  showInvalidMinMaxValueError: boolean;
  showInvalidValueError: boolean;
  setComparison(ev?: React.FormEvent<IComboBox>, item?: IComboBoxOption): void;
  setNumericValue(
    delta: number,
    index: number,
    stringVal: string,
    range: IColumnRange
  ): string | void;
}

export class NoneCategoricalFilterOptions extends React.Component<INoneCategoricalFilterOptionsProps> {
  private comparisonOptions: IComboBoxOption[] = comparisonOptions;
  public render(): React.ReactNode {
    const { columnRange, openedFilter, setComparison, setNumericValue } =
      this.props;
    const min = columnRange?.min || 0;
    const max = columnRange?.max || 0;
    const numericDelta =
      columnRange?.rangeType === RangeTypes.Integer || !columnRange
        ? 1
        : (max - min) / 10;
    const styles = cohortEditorStyles();
    const minVal = columnRange ? roundDecimal(min) : undefined;
    const maxVal = columnRange ? roundDecimal(max) : undefined;
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
        {columnRange &&
          (openedFilter.method === FilterMethods.InTheRangeOf ? (
            <>
              <SpinButton
                ariaLabel={localization.Common.spinButton}
                labelPosition={Position.top}
                value={openedFilter.arg[0].toString()}
                label={localization.Interpret.Filters.minimum}
                min={columnRange.min}
                max={columnRange.max}
                onIncrement={(value): void => {
                  setNumericValue(numericDelta, 0, value, columnRange);
                }}
                onDecrement={(value): void => {
                  setNumericValue(-numericDelta, 0, value, columnRange);
                }}
                onValidate={(value): void => {
                  setNumericValue(0, 0, value, columnRange);
                }}
                incrementButtonAriaLabel={localization.Common.increaseValue}
                decrementButtonAriaLabel={localization.Common.decreaseValue}
              />
              <SpinButton
                ariaLabel={localization.Common.spinButton}
                labelPosition={Position.top}
                value={openedFilter.arg[1].toString()}
                label={localization.Interpret.Filters.maximum}
                min={columnRange.min}
                max={columnRange.max}
                onIncrement={(value): void => {
                  setNumericValue(numericDelta, 1, value, columnRange);
                }}
                onDecrement={(value): void => {
                  setNumericValue(-numericDelta, 1, value, columnRange);
                }}
                onValidate={(value): void => {
                  setNumericValue(0, 1, value, columnRange);
                }}
                incrementButtonAriaLabel={localization.Common.increaseValue}
                decrementButtonAriaLabel={localization.Common.decreaseValue}
              />
              {this.props.showInvalidMinMaxValueError && columnRange && (
                <p className={styles.invalidValueError}>
                  {localization.formatString(
                    localization.Interpret.CohortEditor
                      .minimumGreaterThanMaximum,
                    columnRange.min,
                    columnRange.max
                  )}
                </p>
              )}
            </>
          ) : (
            <SpinButton
              ariaLabel={localization.Common.spinButton}
              labelPosition={Position.top}
              label={localization.Interpret.Filters.numericValue}
              min={columnRange.min}
              max={columnRange.max}
              value={openedFilter.arg[0].toString()}
              onIncrement={(value): void => {
                setNumericValue(numericDelta, 0, value, columnRange);
              }}
              onDecrement={(value): void => {
                setNumericValue(-numericDelta, 0, value, columnRange);
              }}
              onValidate={(value): void => {
                setNumericValue(0, 0, value, columnRange);
              }}
              incrementButtonAriaLabel={localization.Common.increaseValue}
              decrementButtonAriaLabel={localization.Common.decreaseValue}
            />
          ))}
        {this.props.showInvalidValueError && columnRange && (
          <p className={styles.invalidValueError}>
            {localization.formatString(
              localization.Interpret.CohortEditor.invalidValueError,
              columnRange.min,
              columnRange.max
            )}
          </p>
        )}
      </>
    );
  }
}
