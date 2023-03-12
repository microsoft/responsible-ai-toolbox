// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IComboBoxOption, IComboBox, Text, Stack } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import {
  ICategoricalRange,
  INumericRange,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import React from "react";

import { IDataset } from "../../Interfaces/IDataset";
import { FilterMethods, IFilter } from "../../Interfaces/IFilter";
import { JointDataset } from "../../util/JointDataset";

import { CohortEditorFilter } from "./CohortEditorFilter";

export interface ICohortEditorFilterSectionProps {
  filterIndex?: number;
  legacyFilters: IFilter[];
  filters: IFilter[];
  dataset: IDataset;
  columnRanges?: { [key: string]: INumericRange | ICategoricalRange };
  jointDataset: JointDataset;
  openedLegacyFilter?: IFilter;
  openedFilter?: IFilter;
  isRefactorFlightOn: boolean;
  onFiltersUpdated: (filters: IFilter[], isLegacy: boolean) => void;
  onOpenedFilterUpdated: (isLegacy: boolean, openedFilter?: IFilter) => void;
  onSelectedFilterCategoryUpdated: (selectedFilterCategory?: string) => void;
  setFilterMessage: (filtersMessage: string) => void;
}

export interface ICohortEditorFilterSectionState {
  showInvalidMinMaxValueError: boolean;
  showInvalidValueError: boolean;
}

export class CohortEditorFilterSection extends React.PureComponent<
  ICohortEditorFilterSectionProps,
  ICohortEditorFilterSectionState
> {
  public constructor(props: ICohortEditorFilterSectionProps) {
    super(props);
    this.state = {
      showInvalidMinMaxValueError: false,
      showInvalidValueError: false
    };
  }

  public render(): React.ReactNode {
    const openedFilter = this.props.isRefactorFlightOn
      ? this.props.openedFilter
      : this.props.openedLegacyFilter;
    return (
      <Stack.Item>
        {!openedFilter ? (
          <Text variant={"medium"}>
            {localization.Interpret.CohortEditor.defaultFilterState}
          </Text>
        ) : (
          <CohortEditorFilter
            dataset={this.props.dataset}
            columnRanges={this.props.columnRanges}
            cancelFilter={this.cancelFilter}
            filters={
              this.props.isRefactorFlightOn
                ? this.props.filters
                : this.props.legacyFilters
            }
            jointDataset={this.props.jointDataset}
            openedLegacyFilter={
              this.props.openedLegacyFilter || ({} as IFilter)
            }
            openedFilter={this.props.openedFilter || ({} as IFilter)}
            isRefactorFlightOn={this.props.isRefactorFlightOn}
            saveState={this.saveState}
            setAsCategorical={this.setAsCategorical}
            setCategoricalValues={this.setCategoricalValues}
            setComparison={this.setComparison}
            setNumericValue={this.setNumericValue}
            setSelectedProperty={this.setSelectedDataProperty}
            showInvalidValueError={this.state.showInvalidValueError}
            showInvalidMinMaxValueError={this.state.showInvalidMinMaxValueError}
            filterIndex={this.props.filterIndex}
            setFilterMessage={this.props.setFilterMessage}
          />
        )}
      </Stack.Item>
    );
  }

  private readonly setAsCategorical = (
    _ev?: React.FormEvent,
    checked?: boolean
  ): void => {
    if (checked === undefined || !this.props.openedLegacyFilter) {
      return;
    }
    const openedFilter = this.props.openedLegacyFilter;
    this.props.jointDataset.setTreatAsCategorical(openedFilter.column, checked);
    if (checked) {
      this.props.onOpenedFilterUpdated(true, {
        arg: [],
        column: openedFilter.column,
        method: FilterMethods.Includes
      });
    } else {
      this.props.onOpenedFilterUpdated(true, {
        arg: [
          this.props.jointDataset.metaDict[openedFilter.column].featureRange
            ?.max || Number.MAX_SAFE_INTEGER
        ],
        column: openedFilter.column,
        method: FilterMethods.LessThan
      });
    }
  };

  private readonly setSelectedDataProperty = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item?.index !== undefined) {
      const legacyFilterKey =
        JointDataset.DataLabelRoot + item.index.toString();
      const filterKey = this.props.dataset.feature_names[item.index];
      const filter = this.getFilterValue(filterKey);
      this.props.onOpenedFilterUpdated(false, filter);
      const legacyFilter = this.getLegacyFilterValue(legacyFilterKey);
      this.props.onOpenedFilterUpdated(true, legacyFilter);
    }
  };

  private saveState = (index?: number): void => {
    const openedFilter = this.props.isRefactorFlightOn
      ? this.props.openedFilter
      : this.props.openedLegacyFilter;
    if (!openedFilter || index === undefined) {
      return;
    }
    if (this.props.openedLegacyFilter) {
      this.updateFilter(this.props.openedLegacyFilter, index, true);
    }
    if (this.props.openedFilter) {
      this.updateFilter(this.props.openedFilter, index);
    }
    this.props.onSelectedFilterCategoryUpdated(undefined);
  };

  private readonly setCategoricalValues = (
    _ev?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    const openedFilter = this.props.isRefactorFlightOn
      ? this.props.openedFilter
      : this.props.openedLegacyFilter;
    if (!openedFilter || (!item?.key && item?.key !== 0)) {
      return;
    }
    // the filter arg is the same, the only difference between legacy and new filter is on column
    const selectedVals = [...(this.props.openedLegacyFilter?.arg as number[])];
    const index = selectedVals.indexOf(item.key as number);
    if (item.selected && index === -1) {
      selectedVals.push(item.key as number);
    } else {
      selectedVals.splice(index, 1);
    }
    if (this.props.openedLegacyFilter) {
      this.props.onOpenedFilterUpdated(true, {
        arg: selectedVals,
        column: this.props.openedLegacyFilter.column,
        method: this.props.openedLegacyFilter.method
      });
    }
    if (this.props.openedFilter) {
      this.props.onOpenedFilterUpdated(false, {
        arg: selectedVals,
        column: this.props.openedFilter.column,
        method: this.props.openedFilter.method
      });
    }
  };

  private readonly setComparison = (
    _ev?: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    const openedFilter = this.props.isRefactorFlightOn
      ? this.props.openedFilter
      : this.props.openedLegacyFilter;
    if (!openedFilter || !item) {
      return;
    }
    if ((item.key as FilterMethods) === FilterMethods.InTheRangeOf) {
      //default values for in the range operation
      let range;
      if (this.props.isRefactorFlightOn && this.props.openedFilter) {
        range =
          this.props.columnRanges &&
          (this.props.columnRanges[
            this.props.openedFilter.column
          ] as INumericRange);
      } else if (
        !this.props.isRefactorFlightOn &&
        this.props.openedLegacyFilter
      ) {
        range =
          this.props.jointDataset.metaDict[this.props.openedLegacyFilter.column]
            .featureRange;
      }

      if (range?.min === undefined) {
        openedFilter.arg[0] = Number.MIN_SAFE_INTEGER;
      } else {
        openedFilter.arg[0] = range.min;
      }
      if (range?.max === undefined) {
        openedFilter.arg[1] = Number.MAX_SAFE_INTEGER;
      } else {
        openedFilter.arg[1] = range.max;
      }
    } else {
      //handle switch from in the range to less than, equals etc
      openedFilter.arg = openedFilter.arg.slice(0, 1);
    }
    if (this.props.openedLegacyFilter) {
      this.props.onOpenedFilterUpdated(true, {
        arg: openedFilter.arg,
        column: this.props.openedLegacyFilter.column,
        method: item.key as FilterMethods
      });
    }
    if (this.props.openedFilter) {
      this.props.onOpenedFilterUpdated(false, {
        arg: openedFilter.arg,
        column: this.props.openedFilter.column,
        method: item.key as FilterMethods
      });
    }
  };

  private readonly setNumericValue = (
    delta: number,
    index: number,
    stringVal: string,
    range?: INumericRange
  ): string | void => {
    const openedFilter = this.props.isRefactorFlightOn
      ? this.props.openedFilter
      : this.props.openedLegacyFilter;
    if (!openedFilter) {
      return;
    }
    const openArg = openedFilter.arg;
    const max = range?.max || Number.MAX_SAFE_INTEGER;
    const min = range?.min || Number.MIN_SAFE_INTEGER;
    if (delta === 0) {
      const numberVal = +stringVal;
      if (
        (!Number.isInteger(numberVal) &&
          range?.rangeType === RangeTypes.Integer) ||
        numberVal > max ||
        numberVal < min
      ) {
        this.setState({
          showInvalidMinMaxValueError: false,
          showInvalidValueError: true
        });
        return openedFilter.arg[index].toString();
      }
      this.setState({ showInvalidValueError: false });
      openArg[index] = numberVal;
    } else {
      const prevVal = openArg[index];
      const newVal = prevVal + delta;
      if (newVal > max || newVal < min) {
        this.setState({
          showInvalidMinMaxValueError: false,
          showInvalidValueError: true
        });
        return prevVal.toString();
      }
      this.setState({ showInvalidValueError: false });
      openArg[index] = newVal;
    }

    // in the range validation
    if (openArg[1] <= openArg[0]) {
      openArg[1] = max;
      this.setState({
        showInvalidMinMaxValueError: true,
        showInvalidValueError: false
      });
    } else {
      this.setState({ showInvalidMinMaxValueError: false });
    }
    if (this.props.openedLegacyFilter) {
      this.props.onOpenedFilterUpdated(true, {
        arg: openArg,
        column: this.props.openedLegacyFilter.column,
        method: this.props.openedLegacyFilter.method
      });
    }
    if (this.props.openedFilter) {
      this.props.onOpenedFilterUpdated(false, {
        arg: openArg,
        column: this.props.openedFilter.column,
        method: this.props.openedFilter.method
      });
    }
  };

  private getLegacyFilterValue(key: string): IFilter {
    const filter: IFilter = { column: key } as IFilter;
    const meta = this.props.jointDataset.metaDict[key];
    if (meta?.treatAsCategorical && meta.sortedCategoricalValues) {
      filter.method = FilterMethods.Includes;
      filter.arg = [...new Array(meta.sortedCategoricalValues.length).keys()];
    } else {
      filter.method = FilterMethods.LessThan;
      filter.arg = [meta.featureRange?.max || Number.MAX_SAFE_INTEGER];
    }
    return filter;
  }

  private getFilterValue(key: string): IFilter {
    const filter: IFilter = { column: key } as IFilter;
    const range = this.props.columnRanges
      ? this.props.columnRanges[key]
      : ({} as INumericRange);
    if (range.rangeType === RangeTypes.Categorical) {
      filter.method = FilterMethods.Includes;
      filter.arg = [...new Array(range.uniqueValues.length).keys()];
    } else {
      filter.method = FilterMethods.LessThan;
      filter.arg = [range.max || Number.MAX_SAFE_INTEGER];
    }
    return filter;
  }

  private updateFilter(
    filter: IFilter,
    index: number,
    isLegacy?: boolean
  ): void {
    if (isLegacy) {
      const legacyFilters = [...this.props.legacyFilters];
      legacyFilters[index] = filter;
      this.props.onFiltersUpdated(legacyFilters, true);
    } else {
      const filters = [...this.props.filters];
      filters[index] = filter;
      this.props.onFiltersUpdated(filters, false);
    }
    this.props.onOpenedFilterUpdated(true, undefined);
    this.props.onOpenedFilterUpdated(false, undefined);
  }

  private cancelFilter = (): void => {
    this.props.onSelectedFilterCategoryUpdated(undefined);
    this.props.onOpenedFilterUpdated(true, undefined);
    this.props.onOpenedFilterUpdated(false, undefined);
  };
}
