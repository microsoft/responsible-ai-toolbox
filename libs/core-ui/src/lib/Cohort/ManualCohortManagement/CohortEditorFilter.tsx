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
import { IColumnRange, RangeTypes } from "@responsible-ai/mlchartlib";
import React from "react";

import {
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "../../Context/ModelAssessmentContext";
import { IFilter } from "../../Interfaces/IFilter";
import { ifEnableLargeData } from "../../util/buildInitialContext";
import { FluentUIStyles } from "../../util/FluentUIStyles";

import { maxLength } from "./CohortEditorPanelContentUtils";
import { NoneCategoricalFilterOptions } from "./NoneCategoricalFilterOptions";

export interface ICohortEditorFilterProps {
  featureNames: string[];
  columnRanges?: { [key: string]: IColumnRange };
  openedFilter: IFilter;
  filterIndex?: number;
  filters: IFilter[];
  showInvalidMinMaxValueError: boolean;
  showInvalidValueError: boolean;
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
    range?: IColumnRange
  ): string | void;
  saveState(index?: number): void;
  cancelFilter(): void;
}

export class CohortEditorFilter extends React.Component<ICohortEditorFilterProps> {
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private readonly dataArray: IComboBoxOption[] = this.props.featureNames.map(
    (featureName, index) => {
      return {
        index,
        key: featureName,
        text:
          featureName.length <= maxLength
            ? featureName
            : `${featureName.slice(0, maxLength)}...`
      };
    }
  );

  public render(): React.ReactNode {
    const isDataColumn = this.props.featureNames.includes(
      this.props.openedFilter.column
    );
    let categoricalOptions: IComboBoxOption[] | undefined;
    // filterIndex is set when the filter is editing openedFilter and reset to filters.length otherwise
    const isEditingFilter =
      this.props.filterIndex !== this.props.filters.length;
    const columnRange = this.props.columnRanges
      ? this.props.columnRanges[this.props.openedFilter.column]
      : undefined;
    const isCategorical =
      columnRange?.treatAsCategorical ||
      columnRange?.rangeType === RangeTypes.Categorical;
    if (isCategorical) {
      categoricalOptions = columnRange?.sortedUniqueValues.map(
        (label, index) => {
          return { key: index, text: String(label) };
        }
      );
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
        {columnRange &&
          columnRange.rangeType === RangeTypes.Integer &&
          !ifEnableLargeData(this.context.dataset) && (
            <Checkbox
              key={this.props.openedFilter.column}
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
                categoricalOptions?.length
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
            columnRange={columnRange}
            openedFilter={this.props.openedFilter}
            showInvalidMinMaxValueError={this.props.showInvalidMinMaxValueError}
            showInvalidValueError={this.props.showInvalidMinMaxValueError}
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
    this.props.setFilterMessage(
      localization.Interpret.CohortEditor.filterAdded
    );
  };
}
