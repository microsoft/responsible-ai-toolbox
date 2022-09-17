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
import { RangeTypes, roundDecimal } from "@responsible-ai/mlchartlib";
import React from "react";

import { IFilter } from "../../Interfaces/IFilter";
import { FluentUIStyles } from "../../util/FluentUIStyles";
import { JointDataset } from "../../util/JointDataset";
import { IJointMeta } from "../../util/JointDatasetUtils";

import { NoneCategoricalFilterOptions } from "./NoneCategoricalFilterOptions";

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
  public render(): React.ReactNode {
    const selectedMeta =
      this.props.jointDataset.metaDict[this.props.openedFilter.column];
    const isDataColumn = this.props.openedFilter.column.includes(
      JointDataset.DataLabelRoot
    );
    let categoricalOptions: IComboBoxOption[] | undefined;
    // filterIndex is set when the filter is editing openedFilter and reset to filters.length otherwise
    const isEditingFilter =
      this.props.filterIndex !== this.props.filters.length;
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
          <NoneCategoricalFilterOptions
            selectedMeta={selectedMeta}
            openedFilter={this.props.openedFilter}
            showInvalidMinMaxValueError={this.props.showInvalidMinMaxValueError}
            showInvalidValueError={this.props.showInvalidMinMaxValueError}
            minVal={minVal}
            maxVal={maxVal}
            setComparison={this.props.setComparison}
            setNumericValue={this.props.setNumericValue}
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
    const filterInfo = document.querySelector("#filterInfo");
    if (filterInfo) {
      filterInfo.textContent = localization.Interpret.CohortEditor.filterAdded;
    }
  };
}
