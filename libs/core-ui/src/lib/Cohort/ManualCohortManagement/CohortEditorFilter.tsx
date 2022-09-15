// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Checkbox,
  IComboBoxOption,
  IComboBox,
  ComboBox,
  DefaultButton,
  PrimaryButton,
  SpinButton,
  Stack,
  Text,
  Position
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { RangeTypes, roundDecimal } from "@responsible-ai/mlchartlib";
import React from "react";

import { FilterMethods, IFilter } from "../../Interfaces/IFilter";
import { FluentUIStyles } from "../../util/FluentUIStyles";
import { JointDataset } from "../../util/JointDataset";
import { IJointMeta } from "../../util/JointDatasetUtils";

import { cohortEditorStyles } from "./CohortEditor.styles";
import { comparisonOptions } from "./CohortEditorFilterUtils";

export interface ICohortEditorFilterProps {
  openedFilter: IFilter;
  jointDataset: JointDataset;
  filterIndex?: number;
  filters: IFilter[];
  showInvalidMinMaxValueError: boolean;
  showInvalidValueError: boolean;
  setSelectedProperty(
    ev: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void;
  setAsCategorical(ev?: React.FormEvent, checked?: boolean): void;
  setCategoricalValues(
    ev?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void;
  setComparison(ev?: React.FormEvent<IComboBox>, item?: IComboBoxOption): void;
  setNumericValue(
    delta: number,
    column: IJointMeta,
    index: number,
    stringVal: string
  ): string | void;
  saveState(index?: number): void;
  cancelFilter(): void;
}
export class CohortEditorFilter extends React.Component<ICohortEditorFilterProps> {
  private readonly dataArray: IComboBoxOption[] = new Array(
    this.props.jointDataset.datasetFeatureCount
  )
    .fill(0)
    .map((_, index) => {
      const key = JointDataset.DataLabelRoot + index.toString();
      return {
        key,
        text: this.props.jointDataset.metaDict[key].abbridgedLabel
      };
    });
  private comparisonOptions: IComboBoxOption[] = comparisonOptions;
  public render(): React.ReactNode {
    const selectedMeta =
      this.props.jointDataset.metaDict[this.props.openedFilter.column];
    const numericDelta =
      selectedMeta?.treatAsCategorical ||
      selectedMeta.featureRange?.rangeType === RangeTypes.Integer ||
      !selectedMeta.featureRange
        ? 1
        : (selectedMeta.featureRange.max - selectedMeta.featureRange.min) / 10;
    const isDataColumn = this.props.openedFilter.column.includes(
      JointDataset.DataLabelRoot
    );
    let categoricalOptions: IComboBoxOption[] | undefined;
    // filterIndex is set when the filter is editing openedFilter and reset to filters.length otherwise
    const isEditingFilter =
      this.props.filterIndex !== this.props.filters.length;
    const styles = cohortEditorStyles();
    let minVal, maxVal;
    if (selectedMeta?.treatAsCategorical || !selectedMeta.featureRange) {
      // Numerical values treated as categorical are stored with the values in the column,
      // true categorical values store indexes to the string values
      categoricalOptions = selectedMeta.sortedCategoricalValues?.map(
        (label, index) => {
          return { key: index, text: label };
        }
      );
    } else {
      minVal = roundDecimal(selectedMeta.featureRange.min);
      maxVal = roundDecimal(selectedMeta.featureRange.max);
    }
    return (
      <Stack tokens={{ childrenGap: "l1" }}>
        {isDataColumn && (
          <ComboBox
            styles={FluentUIStyles.limitedSizeMenuDropdown}
            options={this.dataArray}
            onChange={this.props.setSelectedProperty}
            label={localization.Interpret.CohortEditor.selectFilter}
            selectedKey={this.props.openedFilter.column}
            calloutProps={FluentUIStyles.calloutProps}
          />
        )}
        {selectedMeta.featureRange &&
          selectedMeta.featureRange.rangeType === RangeTypes.Integer && (
            <Checkbox
              key={this.props.openedFilter.column}
              label={localization.Interpret.CohortEditor.TreatAsCategorical}
              checked={selectedMeta?.treatAsCategorical}
              onChange={this.props.setAsCategorical}
            />
          )}
        {selectedMeta?.treatAsCategorical ? (
          <>
            <Text variant={"small"}>
              {`${localization.formatString(
                localization.Interpret.Filters.uniqueValues,
                selectedMeta.sortedCategoricalValues?.length
              )}`}
            </Text>
            <ComboBox
              key={this.props.openedFilter.column}
              multiSelect
              label={localization.Interpret.Filters.categoricalIncludeValues}
              selectedKey={this.props.openedFilter.arg}
              onChange={this.props.setCategoricalValues}
              options={categoricalOptions || []}
              useComboBoxAsMenuWidth
              calloutProps={FluentUIStyles.calloutProps}
              styles={FluentUIStyles.limitedSizeMenuDropdown}
            />
          </>
        ) : (
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
              selectedKey={this.props.openedFilter.method}
              onChange={this.props.setComparison}
              options={this.comparisonOptions}
              useComboBoxAsMenuWidth
              calloutProps={FluentUIStyles.calloutProps}
            />
            {selectedMeta.featureRange &&
              (this.props.openedFilter.method === FilterMethods.InTheRangeOf ? (
                <>
                  <SpinButton
                    ariaLabel={localization.Common.spinButton}
                    labelPosition={Position.top}
                    value={this.props.openedFilter.arg[0].toString()}
                    label={localization.Interpret.Filters.minimum}
                    min={selectedMeta.featureRange.min}
                    max={selectedMeta.featureRange.max}
                    onIncrement={(value): void => {
                      this.props.setNumericValue(
                        numericDelta,
                        selectedMeta,
                        0,
                        value
                      );
                    }}
                    onDecrement={(value): void => {
                      this.props.setNumericValue(
                        -numericDelta,
                        selectedMeta,
                        0,
                        value
                      );
                    }}
                    onValidate={(value): void => {
                      this.props.setNumericValue(0, selectedMeta, 0, value);
                    }}
                  />
                  <SpinButton
                    ariaLabel={localization.Common.spinButton}
                    labelPosition={Position.top}
                    value={this.props.openedFilter.arg[1].toString()}
                    label={localization.Interpret.Filters.maximum}
                    min={selectedMeta.featureRange.min}
                    max={selectedMeta.featureRange.max}
                    onIncrement={(value): void => {
                      this.props.setNumericValue(
                        numericDelta,
                        selectedMeta,
                        1,
                        value
                      );
                    }}
                    onDecrement={(value): void => {
                      this.props.setNumericValue(
                        -numericDelta,
                        selectedMeta,
                        1,
                        value
                      );
                    }}
                    onValidate={(value): void => {
                      this.props.setNumericValue(0, selectedMeta, 1, value);
                    }}
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
                  value={this.props.openedFilter.arg[0].toString()}
                  onIncrement={(value): void => {
                    this.props.setNumericValue(
                      numericDelta,
                      selectedMeta,
                      0,
                      value
                    );
                  }}
                  onDecrement={(value): void => {
                    this.props.setNumericValue(
                      -numericDelta,
                      selectedMeta,
                      0,
                      value
                    );
                  }}
                  onValidate={(value): void => {
                    this.props.setNumericValue(0, selectedMeta, 0, value);
                  }}
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
        )}
        <Stack horizontal tokens={{ childrenGap: "l1" }}>
          {isEditingFilter ? (
            <>
              <Stack.Item>
                <PrimaryButton
                  text={localization.Interpret.CohortEditor.save}
                  onClick={(): void =>
                    this.props.saveState(this.props.filterIndex)
                  }
                />
              </Stack.Item>
              <Stack.Item>
                <DefaultButton
                  text={localization.Interpret.CohortEditor.cancel}
                  onClick={(): void => this.props.cancelFilter()}
                />
              </Stack.Item>
            </>
          ) : (
            <Stack.Item>
              <PrimaryButton
                text={localization.Interpret.CohortEditor.addFilter}
                onClick={(): void =>
                  this.props.saveState(this.props.filters.length)
                }
              />
            </Stack.Item>
          )}
        </Stack>
      </Stack>
    );
  }
}
