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
import { RangeTypes } from "@responsible-ai/mlchartlib";
import React from "react";

import { FilterMethods, IFilter } from "../../Interfaces/IFilter";
import { FluentUIStyles } from "../../util/FluentUIStyles";
import { IJointMeta } from "../../util/JointDatasetUtils";

import { cohortEditorStyles } from "./CohortEditor.styles";
import { comparisonOptions } from "./CohortEditorFilterUtils";

export interface INoneCategoricalFilterOptionsProps {
  selectedMeta: IJointMeta;
  openedFilter: IFilter;
  showInvalidMinMaxValueError: boolean;
  showInvalidValueError: boolean;
  minVal: number | undefined;
  maxVal: number | undefined;
  setComparison(ev?: React.FormEvent<IComboBox>, item?: IComboBoxOption): void;
  setNumericValue(
    delta: number,
    column: IJointMeta,
    index: number,
    stringVal: string
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
    const numericDelta =
      selectedMeta?.treatAsCategorical ||
      selectedMeta.featureRange?.rangeType === RangeTypes.Integer ||
      !selectedMeta.featureRange
        ? 1
        : (selectedMeta.featureRange.max - selectedMeta.featureRange.min) / 10;
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
        {selectedMeta.featureRange &&
          (openedFilter.method === FilterMethods.InTheRangeOf ? (
            <>
              <SpinButton
                ariaLabel={localization.Common.spinButton}
                labelPosition={Position.top}
                value={openedFilter.arg[0].toString()}
                label={localization.Interpret.Filters.minimum}
                min={selectedMeta.featureRange.min}
                max={selectedMeta.featureRange.max}
                onIncrement={(value): void => {
                  setNumericValue(numericDelta, selectedMeta, 0, value);
                }}
                onDecrement={(value): void => {
                  setNumericValue(-numericDelta, selectedMeta, 0, value);
                }}
                onValidate={(value): void => {
                  setNumericValue(0, selectedMeta, 0, value);
                }}
                incrementButtonAriaLabel={localization.Common.increaseValue}
                decrementButtonAriaLabel={localization.Common.decreaseValue}
              />
              <SpinButton
                ariaLabel={localization.Common.spinButton}
                labelPosition={Position.top}
                value={openedFilter.arg[1].toString()}
                label={localization.Interpret.Filters.maximum}
                min={selectedMeta.featureRange.min}
                max={selectedMeta.featureRange.max}
                onIncrement={(value): void => {
                  setNumericValue(numericDelta, selectedMeta, 1, value);
                }}
                onDecrement={(value): void => {
                  setNumericValue(-numericDelta, selectedMeta, 1, value);
                }}
                onValidate={(value): void => {
                  setNumericValue(0, selectedMeta, 1, value);
                }}
                incrementButtonAriaLabel={localization.Common.increaseValue}
                decrementButtonAriaLabel={localization.Common.decreaseValue}
              />
              {this.props.showInvalidMinMaxValueError &&
                selectedMeta.featureRange && (
                  <p className={styles.invalidValueError}>
                    {localization.formatString(
                      localization.Interpret.CohortEditor
                        .minimumGreaterThanMaximum,
                      selectedMeta.featureRange.min,
                      selectedMeta.featureRange.max
                    )}
                  </p>
                )}
            </>
          ) : (
            <SpinButton
              ariaLabel={localization.Common.spinButton}
              labelPosition={Position.top}
              label={localization.Interpret.Filters.numericValue}
              min={selectedMeta.featureRange.min}
              max={selectedMeta.featureRange.max}
              value={openedFilter.arg[0].toString()}
              onIncrement={(value): void => {
                setNumericValue(numericDelta, selectedMeta, 0, value);
              }}
              onDecrement={(value): void => {
                setNumericValue(-numericDelta, selectedMeta, 0, value);
              }}
              onValidate={(value): void => {
                setNumericValue(0, selectedMeta, 0, value);
              }}
              incrementButtonAriaLabel={localization.Common.increaseValue}
              decrementButtonAriaLabel={localization.Common.decreaseValue}
            />
          ))}
        {this.props.showInvalidValueError && selectedMeta.featureRange && (
          <p className={styles.invalidValueError}>
            {localization.formatString(
              localization.Interpret.CohortEditor.invalidValueError,
              selectedMeta.featureRange.min,
              selectedMeta.featureRange.max
            )}
          </p>
        )}
      </>
    );
  }
}
