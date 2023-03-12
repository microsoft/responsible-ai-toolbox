// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Checkbox,
  IComboBoxOption,
  IComboBox,
  ComboBox,
  DefaultButton,
  PrimaryButton,
  Stack,
  Text
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import {
  ICategoricalRange,
  INumericRange,
  RangeTypes,
  roundDecimal
} from "@responsible-ai/mlchartlib";
import React from "react";

import { IDataset } from "../../Interfaces/IDataset";
import { IFilter } from "../../Interfaces/IFilter";
import { FluentUIStyles } from "../../util/FluentUIStyles";
import { JointDataset } from "../../util/JointDataset";

import { NoneCategoricalFilterOptions } from "./NoneCategoricalFilterOptions";

export interface ICohortEditorFilterProps {
  openedLegacyFilter: IFilter;
  openedFilter: IFilter;
  jointDataset: JointDataset;
  dataset: IDataset;
  columnRanges?: { [key: string]: INumericRange | ICategoricalRange };
  filterIndex?: number;
  filters: IFilter[];
  showInvalidMinMaxValueError: boolean;
  showInvalidValueError: boolean;
  isRefactorFlightOn: boolean;
  setFilterMessage: (filtersMessage: string) => void;
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
    index: number,
    stringVal: string,
    range?: INumericRange
  ): string | void;
  saveState(index?: number): void;
  cancelFilter(): void;
}
const maxLength = 18;
export class CohortEditorFilter extends React.Component<ICohortEditorFilterProps> {
  private readonly dataArray: IComboBoxOption[] = this.props.isRefactorFlightOn
    ? this.props.dataset.feature_names.map((featureName, index) => {
        return {
          index,
          key: featureName,
          text:
            featureName.length <= maxLength
              ? featureName
              : `${featureName.slice(0, maxLength)}...`
        };
      })
    : new Array(this.props.jointDataset.datasetFeatureCount)
        .fill(0)
        .map((_, index) => {
          const key = JointDataset.DataLabelRoot + index.toString();
          return {
            index,
            key,
            text: this.props.jointDataset.metaDict[key].abbridgedLabel
          };
        });

  public render(): React.ReactNode {
    const selectedMeta =
      this.props.jointDataset.metaDict[this.props.openedLegacyFilter.column];
    const isDataColumn = this.props.isRefactorFlightOn
      ? this.props.dataset.feature_names.includes(
          this.props.openedFilter.column
        )
      : this.props.openedLegacyFilter.column.includes(
          JointDataset.DataLabelRoot
        );
    // filterIndex is set when the filter is editing openedFilter and reset to filters.length otherwise
    const isEditingFilter =
      this.props.filterIndex !== this.props.filters.length;

    let categoricalOptions: IComboBoxOption[] | undefined;
    let minVal, maxVal, featureRange, isCategorical, categoricalValuesLength;
    if (this.props.isRefactorFlightOn) {
      featureRange = this.props.columnRanges
        ? this.props.columnRanges[this.props.openedFilter.column]
        : ({} as INumericRange);
      isCategorical = featureRange?.rangeType === RangeTypes.Categorical;
      if (featureRange?.rangeType === RangeTypes.Categorical) {
        categoricalOptions = featureRange?.uniqueValues.map((label, index) => {
          return { key: index, text: label };
        });
        categoricalValuesLength = categoricalOptions.length;
      } else {
        minVal = roundDecimal(featureRange?.min);
        maxVal = roundDecimal(featureRange?.max);
      }
    } else {
      featureRange = selectedMeta.featureRange;
      isCategorical = selectedMeta.treatAsCategorical;
      categoricalValuesLength = selectedMeta.sortedCategoricalValues?.length;
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
    }
    return (
      <Stack tokens={{ childrenGap: "l1" }}>
        {isDataColumn && (
          <ComboBox
            styles={FluentUIStyles.limitedSizeMenuDropdown}
            options={this.dataArray}
            onChange={this.props.setSelectedProperty}
            label={localization.Interpret.CohortEditor.selectFilter}
            selectedKey={
              this.props.isRefactorFlightOn
                ? this.props.openedFilter.column
                : this.props.openedLegacyFilter.column
            }
            calloutProps={FluentUIStyles.calloutProps}
          />
        )}
        {!this.props.isRefactorFlightOn &&
          featureRange &&
          featureRange.rangeType === RangeTypes.Integer && (
            <Checkbox
              key={this.props.openedLegacyFilter.column}
              label={localization.Interpret.CohortEditor.TreatAsCategorical}
              checked={isCategorical}
              onChange={this.props.setAsCategorical}
            />
          )}
        {isCategorical ? (
          <>
            <Text variant={"small"}>
              {`${localization.formatString(
                localization.Interpret.Filters.uniqueValues,
                categoricalValuesLength
              )}`}
            </Text>
            <ComboBox
              key={
                this.props.isRefactorFlightOn
                  ? this.props.openedFilter.column
                  : this.props.openedLegacyFilter.column
              }
              multiSelect
              label={localization.Interpret.Filters.categoricalIncludeValues}
              selectedKey={
                this.props.isRefactorFlightOn
                  ? this.props.openedFilter.arg
                  : this.props.openedLegacyFilter.arg
              }
              onChange={this.props.setCategoricalValues}
              options={categoricalOptions || []}
              useComboBoxAsMenuWidth
              calloutProps={FluentUIStyles.calloutProps}
              styles={FluentUIStyles.limitedSizeMenuDropdown}
            />
          </>
        ) : (
          <NoneCategoricalFilterOptions
            featureRange={featureRange as INumericRange}
            selectedMeta={selectedMeta}
            openedFilter={
              this.props.isRefactorFlightOn
                ? this.props.openedFilter
                : this.props.openedLegacyFilter
            }
            showInvalidMinMaxValueError={this.props.showInvalidMinMaxValueError}
            showInvalidValueError={this.props.showInvalidMinMaxValueError}
            minVal={minVal}
            maxVal={maxVal}
            setComparison={this.props.setComparison}
            setNumericValue={this.props.setNumericValue}
            isRefactorFlightOn={this.props.isRefactorFlightOn}
          />
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
                onClick={this.onAddFilterClick}
              />
            </Stack.Item>
          )}
        </Stack>
      </Stack>
    );
  }
  private onAddFilterClick = (): void => {
    this.props.saveState(this.props.filters.length);
    this.props.setFilterMessage(
      localization.Interpret.CohortEditor.filterAdded
    );
  };
}
